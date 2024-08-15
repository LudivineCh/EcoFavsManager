// Declaration of the global variable for Masonry

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
        bookmarksHtml = barreDeFavorisLinksHtml !== '<ul></ul>' ? `<div class="encart"><h2>Barre de Favoris</h2>${barreDeFavorisLinksHtml}</div>` + bookmarksHtml : bookmarksHtml;

        // Adding other favorites
        if (autresFavoris.children.length > 0) {
            bookmarksHtml += `<div class="encart">${createBookmarksHtml(autresFavoris.children, 'Autres Favoris')}</div>`;
        }

        // Inserting the bookmarks HTML into the page
        document.getElementById('bookmarksContainer').innerHTML = bookmarksHtml;
        
        // Initialisez Masonry une fois que les signets ont été insérés dans le DOM
        msnry = new Masonry('#bookmarksContainer', {
            itemSelector: '.encart', // Sélecteur pour les éléments de la grille
            columnWidth: 200, // La largeur des colonnes
            gutter: 15,
            horizontalOrder: true,
            fitWidth: true // Centre la grille dans le conteneur parent
        });
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
    const urlObj = new URL(node.url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    let faviconUrl;
    
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
            faviconUrl = `https://icon.horse/icon/${domain}`;
    }

    // Formatting the title for display and full use in the link's 'title' attribute
    const formattedTitle = formatTitle(node.title, node.url);

    // Creating the HTML element for the favicon with the formatted title
    return `<li><img class="favicon" src="${faviconUrl}" alt="${formattedTitle}" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 5px;" onerror="this.src='https://icon.horse/icon/${domain}'">` +
           `<a href="${node.url}" target="_blank" title="${node.title}" class="bookmark-title">${formattedTitle}</a></li>`;
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
