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
        
        // Créer les encarts spéciaux
        let barreDeFavorisHtml = barreDeFavorisLinksHtml !== '<ul></ul>' ? 
            `<div class="encart barre-favoris"><h2>Barre de Favoris</h2>${barreDeFavorisLinksHtml}</div>` : '';
        
        let autresFavorisHtml = '';
        if (autresFavoris.children.length > 0) {
            autresFavorisHtml = `<div class="encart autres-favoris">${createBookmarksHtml(autresFavoris.children, 'Autres Favoris')}</div>`;
        }
        
        // Ajouter CSS pour notre nouvelle structure avec responsive design
        const css = `
            <style>
                #bookmarksContainer {
                    display: flex;
                    align-items: flex-start;
                    width: 100%;
                    box-sizing: border-box;
                    padding-right: 15px; /* Pour éviter que le contenu aille jusqu'au bord */
                    overflow-x: hidden; /* Empêcher le défilement horizontal */
                }
                
                #specialContainer {
                    display: flex;
                    flex-direction: column;
                    margin-right: 15px;
                    flex-shrink: 0; /* Empêcher le conteneur spécial de rétrécir */
                    width: auto; /* Largeur basée sur le contenu */
                }
                
                #masonryContainer {
                    flex: 1;
                    box-sizing: border-box;
                }
                
                /* Assurer que les encarts ne dépassent pas de leur conteneur */
                .encart {
                    max-width: 100%;
                    box-sizing: border-box;
                }
                
                /* Ajustements responsives */
                @media (max-width: 1200px) {
                    #masonryContainer .encart {
                        width: 180px; /* Réduit légèrement la largeur des encarts */
                    }
                }
                
                @media (max-width: 992px) {
                    #masonryContainer .encart {
                        width: 160px; /* Réduit davantage pour les écrans plus petits */
                    }
                }
            </style>
        `;
        
        // Insérer le CSS dans la page
        document.head.insertAdjacentHTML('beforeend', css);
        
        // Restructurer complètement notre conteneur principal
        const container = document.getElementById('bookmarksContainer');
        container.innerHTML = '';
        
        // Créer deux conteneurs distincts
        const specialContainer = document.createElement('div');
        specialContainer.id = 'specialContainer';
        
        const masonryContainer = document.createElement('div');
        masonryContainer.id = 'masonryContainer';
        
        // Ajouter ces conteneurs au conteneur principal
        container.appendChild(specialContainer);
        container.appendChild(masonryContainer);
        
        // Ajouter les encarts spéciaux dans leur conteneur
        specialContainer.innerHTML = barreDeFavorisHtml + autresFavorisHtml;
        
        // Ajouter tous les autres encarts dans le conteneur Masonry
        masonryContainer.innerHTML = bookmarksHtml;
        
        // Initialiser Masonry avec des options améliorées
        setTimeout(function() {
            // Calculer le nombre optimal de colonnes en fonction de l'espace disponible
            function calculateOptimalColumnWidth() {
                const containerWidth = masonryContainer.clientWidth;
                const minColumnWidth = 200; // Largeur minimale souhaitée pour une colonne
                const maxColumns = Math.floor(containerWidth / minColumnWidth);
                
                // S'il y a de l'espace pour au moins 1 colonne
                if (maxColumns >= 1) {
                    // Distribuer l'espace disponible uniformément
                    return Math.floor(containerWidth / maxColumns) - 15; // Soustraire l'espace de gouttière
                }
                
                return minColumnWidth; // Fallback à la largeur minimale
            }
            
            // Initialiser Masonry avec une largeur de colonne calculée
            const optimalColumnWidth = calculateOptimalColumnWidth();
            
            msnry = new Masonry('#masonryContainer', {
                itemSelector: '.encart',
                columnWidth: optimalColumnWidth,
                gutter: 15,
                fitWidth: false, // Ne pas utiliser fitWidth car nous voulons occuper tout l'espace
                percentPosition: true, // Utiliser un positionnement relatif pour une meilleure adaptation
                horizontalOrder: true, // Pour que les éléments soient organisés de gauche à droite
                transitionDuration: '0.2s' // Animation douce lors du réarrangement
            });
            
            // Recalculer le layout lors du redimensionnement de la fenêtre
            window.addEventListener('resize', function() {
                if (msnry) {
                    // Re-calculer la largeur optimale de colonne
                    const newOptimalWidth = calculateOptimalColumnWidth();
                    
                    // Mettre à jour les options de Masonry
                    msnry.options.columnWidth = newOptimalWidth;
                    
                    // Recharger le layout
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