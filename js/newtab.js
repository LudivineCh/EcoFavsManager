var msnry;

document.addEventListener('DOMContentLoaded', function() {
    // Build the bookmarks structure from Chrome's bookmark tree
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
        let bookmarksHtml = '';
        const barreDeFavoris = bookmarkTreeNodes[0].children[0];
        const autresFavoris = bookmarkTreeNodes[0].children[1];

        // Constructing links for the favorites bar
        let barreDeFavorisLinksHtml = '<ul>';
        for (const item of barreDeFavoris.children) {
            if (item.children) {
                bookmarksHtml += `<div class="encart"><h2>${item.title}</h2>` + createBookmarksHtml(item.children) + '</div>';
            } else {
                barreDeFavorisLinksHtml += createFaviconHtml(item);
            }
        }
        barreDeFavorisLinksHtml += barreDeFavorisLinksHtml === '<ul>' ? '' : '</ul>';
        
        // Create special sections
        let barreDeFavorisHtml = barreDeFavorisLinksHtml !== '<ul></ul>' ? 
            `<div class="encart barre-favoris"><h2>Barre de Favoris</h2>${barreDeFavorisLinksHtml}</div>` : '';
        
        let autresFavorisHtml = '';
        if (autresFavoris.children.length > 0) {
            autresFavorisHtml = `<div class="encart autres-favoris">${createBookmarksHtml(autresFavoris.children, 'Autres Favoris')}</div>`;
        }
        
        // Add CSS for our new structure with responsive design
        const css = `
            <style>
                #bookmarksContainer {
                    display: flex;
                    align-items: flex-start;
                    width: 100%;
                    box-sizing: border-box;
                    padding-right: 15px; /* To prevent content from going to the edge */
                    overflow-x: hidden; /* Prevent horizontal scrolling */
                }
                
                #specialContainer {
                    display: flex;
                    flex-direction: column;
                    margin-right: 15px;
                    flex-shrink: 0; /* Prevent the special container from shrinking */
                    width: auto; /* Width based on content */
                }
                
                #masonryContainer {
                    flex: 1;
                    box-sizing: border-box;
                }
                
                /* Ensure that sections don't overflow their container */
                .encart {
                    max-width: 100%;
                    box-sizing: border-box;
                }
                
                /* Responsive adjustments */
                @media (max-width: 1200px) {
                    #masonryContainer .encart {
                        width: 180px; /* Slightly reduce the width of sections */
                    }
                }
                
                @media (max-width: 992px) {
                    #masonryContainer .encart {
                        width: 160px; /* Further reduce for smaller screens */
                    }
                }
            </style>
        `;
        
        // Insert CSS into the page
        document.head.insertAdjacentHTML('beforeend', css);
        
        // Completely restructure our main container
        const container = document.getElementById('bookmarksContainer');
        container.innerHTML = '';
        
        // Create two distinct containers
        const specialContainer = document.createElement('div');
        specialContainer.id = 'specialContainer';
        
        const masonryContainer = document.createElement('div');
        masonryContainer.id = 'masonryContainer';
        
        // Add these containers to the main container
        container.appendChild(specialContainer);
        container.appendChild(masonryContainer);
        
        // Add special sections to their container
        specialContainer.innerHTML = barreDeFavorisHtml + autresFavorisHtml;
        
        // Add all other sections to the Masonry container
        masonryContainer.innerHTML = bookmarksHtml;
        
        // Initialize Masonry with enhanced options
        setTimeout(function() {
            // Calculate the optimal number of columns based on available space
            function calculateOptimalColumnWidth() {
                const containerWidth = masonryContainer.clientWidth;
                const minColumnWidth = 200; // Minimum desired width for a column
                const maxColumns = Math.floor(containerWidth / minColumnWidth);
                
                // If there's space for at least 1 column
                if (maxColumns >= 1) {
                    // Distribute available space evenly
                    return Math.floor(containerWidth / maxColumns) - 15; // Subtract gutter space
                }
                
                return minColumnWidth; // Fallback to minimum width
            }
            
            // Initialize Masonry with calculated column width
            const optimalColumnWidth = calculateOptimalColumnWidth();
            
            msnry = new Masonry('#masonryContainer', {
                itemSelector: '.encart',
                columnWidth: optimalColumnWidth,
                gutter: 15,
                fitWidth: false, // Don't use fitWidth because we want to occupy all space
                percentPosition: true, // Use relative positioning for better adaptation
                horizontalOrder: true, // So that elements are organized from left to right
                transitionDuration: '0.2s' // Smooth animation during rearrangement
            });
            
            // Recalculate layout when resizing the window
            window.addEventListener('resize', function() {
                if (msnry) {
                    // Re-calculate optimal column width
                    const newOptimalWidth = calculateOptimalColumnWidth();
                    
                    // Update Masonry options
                    msnry.options.columnWidth = newOptimalWidth;
                    
                    // Reload the layout
                    msnry.layout();
                }
            });
        }, 100);
    });

    // Click handler to show/hide sub-folders
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('toggle-folder') || event.target.classList.contains('folder-toggle')) {
            const folderTitle = event.target.closest('.folder-title');
            const folderContent = folderTitle.nextElementSibling;
            toggleFolderDisplay(folderTitle, folderContent);
        }
    });
});

// Handler for expanding/collapsing subfolders
function toggleFolderDisplay(folderTitle, folderContent) {
    const isVisible = folderContent.style.display === 'none';
    folderContent.style.display = isVisible ? 'block' : 'none';
    folderTitle.querySelector('.folder-toggle').classList.toggle('folder-open', isVisible);
    
    // Update Masonry layout after a short delay
    setTimeout(updateMasonryLayout, 50); 
}

// Function to trigger a re-layout of Masonry
function updateMasonryLayout() {
    if (msnry) {
        msnry.layout();
    }
}

// Generates HTML for bookmarks based on the node structure
function createBookmarksHtml(bookmarkNodes, title = '') {
    let html = title ? `<h2>${title}</h2>` : '';
    html += '<ul>';
    for (const node of bookmarkNodes) {
        if (node.children) {
            html += `<li class="folder-title">` +
                    `<img class="folder-icon" src="icons/favicons/folder.png" alt="Folder">` +
                    `<span class="toggle-folder">${node.title}</span>` +
                    `<span class="folder-toggle">&#9660;</span>` +
                    `</li>`;
            html += `<ul class="folder-content" style="display: none;">` +
                    `${createBookmarksHtml(node.children)}` +
                    `</ul>`;
        } else {
            html += createFaviconHtml(node);
        }
    }
    html += '</ul>';
    return html;
}

// Generates favicon HTML for a bookmark node
function createFaviconHtml(node) {
    if (!node.url) return `<li>⚠️ <span class="bookmark-title">${node.title || "Sans titre"}</span></li>`;
    
    try {
        const urlObj = new URL(node.url);
        const domain = urlObj.hostname.replace(/^www\./, '');
        let faviconUrl;
        let fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        
        // Determining the favicon URL based on the domain
        switch (domain) {
            case 'cse-corsicasole.com':
                faviconUrl = 'icons/favicons/cse.ico';
                break;
            case 'wrike.com':
                faviconUrl = 'icons/favicons/wrike.png';
                break;
            case 'app.monportailrh.com':
                faviconUrl = 'icons/favicons/peoplesphere.png';
                break;
            case 'armoires.zeendoc.com':
                faviconUrl = 'icons/favicons/zeendoc.ico';
                break;
            case 'docs.google.com':
                if (urlObj.pathname.startsWith('/document')) {
                    faviconUrl = 'icons/favicons/google-docs.png';
                } else if (urlObj.pathname.startsWith('/spreadsheets')) {
                    faviconUrl = 'icons/favicons/google-sheets.png';
                } else if (urlObj.pathname.startsWith('/presentation')) {
                    faviconUrl = 'icons/favicons/google-slides.png';
                } else {
                    faviconUrl = 'icons/favicons/google-drive.png';
                }
                break;
            default:
                // For other sites, directly use the Google S2 service
                faviconUrl = fallbackUrl;
        }

        // Formatting the title for display
        const formattedTitle = formatTitle(node.title, node.url);

        // Creating the HTML element for the favicon with the formatted title
        // If it's a custom URL, add error handling, otherwise directly use the Google S2 service
        if (faviconUrl !== fallbackUrl) {
            return `<li><img class="favicon" src="${faviconUrl}" alt="${formattedTitle}" 
                style="width: 16px; height: 16px; vertical-align: middle; margin-right: 5px;" 
                onerror="this.src='${fallbackUrl}'">
                <a href="${node.url}" target="_blank" title="${node.title}" class="bookmark-title">${formattedTitle}</a></li>`;
        } else {
            return `<li><img class="favicon" src="${faviconUrl}" alt="${formattedTitle}" 
                style="width: 16px; height: 16px; vertical-align: middle; margin-right: 5px;">
                <a href="${node.url}" target="_blank" title="${node.title}" class="bookmark-title">${formattedTitle}</a></li>`;
        }
    } catch (error) {
        console.error("Error processing bookmark URL:", node.url, error);
        return `<li>🔗 <a href="${node.url}" target="_blank" title="${node.title}" class="bookmark-title">${node.title || node.url}</a></li>`;
    }
}

// Formats the title of a bookmark for display
function formatTitle(title, url) {
    if (typeof url !== 'string' || !url.trim()) {
        return title;
    }
    if (url.includes("docs.google.com") || url.includes("sheets.google.com")) {
        return title.replace(/\s*-\s*Google\s*(Docs|Sheets|Slides)/i, '').trim();
    }
    const domain = new URL(url).hostname.replace('www.', '');
    return title;
}