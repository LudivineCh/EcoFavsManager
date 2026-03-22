var msnry;

document.addEventListener('DOMContentLoaded', function () {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
        let bookmarksHtml = '';
        const bookmarksBar = bookmarkTreeNodes[0].children[0];
        const otherBookmarks = bookmarkTreeNodes[0].children[1];

        let bookmarksBarLinksHtml = '<ul>';
        for (const item of bookmarksBar.children) {
            if (item.children) {
                if (item.title.toLowerCase().trim() === 'sep') {
                    bookmarksHtml += `<div class="encart separator-encart"><hr class="separator-line"></div>`;
                } else {
                    bookmarksHtml += `<div class="encart"><h2>${item.title}</h2>` + createBookmarksHtml(item.children) + '</div>';
                }
            } else {
                bookmarksBarLinksHtml += createFaviconHtml(item);
            }
        }
        bookmarksBarLinksHtml += bookmarksBarLinksHtml === '<ul>' ? '' : '</ul>';

        let bookmarksBarHtml = bookmarksBarLinksHtml !== '<ul></ul>'
            ? `<div class="encart barre-favoris"><h2>Barre de Favoris</h2>${bookmarksBarLinksHtml}</div>`
            : '';

        let otherBookmarksHtml = '';
        if (otherBookmarks.children.length > 0) {
            otherBookmarksHtml = `<div class="encart autres-favoris">${createBookmarksHtml(otherBookmarks.children, 'Autres Favoris')}</div>`;
        }

        const css = `
            <style>
                #bookmarksContainer {
                    display: flex;
                    align-items: flex-start;
                    width: 100%;
                    box-sizing: border-box;
                    padding-right: 15px;
                    overflow-x: hidden;
                }
                #specialContainer {
                    display: flex;
                    flex-direction: column;
                    margin-right: 15px;
                    flex-shrink: 0;
                    width: auto;
                }
                #masonryContainer {
                    flex: 1;
                    box-sizing: border-box;
                }
                .encart {
                    max-width: 100%;
                    box-sizing: border-box;
                }
                @media (max-width: 1200px) {
                    #masonryContainer .encart { width: 180px; }
                }
                @media (max-width: 992px) {
                    #masonryContainer .encart { width: 160px; }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', css);

        const container = document.getElementById('bookmarksContainer');
        container.innerHTML = '';

        const specialContainer = document.createElement('div');
        specialContainer.id = 'specialContainer';

        const masonryContainer = document.createElement('div');
        masonryContainer.id = 'masonryContainer';

        container.appendChild(specialContainer);
        container.appendChild(masonryContainer);

        specialContainer.innerHTML = bookmarksBarHtml + otherBookmarksHtml;
        masonryContainer.innerHTML = bookmarksHtml;

        // Initialize favicon fallback for custom icons (after DOM injection)
        initFaviconFallbacks();

        setTimeout(function () {
            function calculateOptimalColumnWidth() {
                const containerWidth = masonryContainer.clientWidth;
                const minColumnWidth = 200;
                const maxColumns = Math.floor(containerWidth / minColumnWidth);
                if (maxColumns >= 1) {
                    return Math.floor(containerWidth / maxColumns) - 15;
                }
                return minColumnWidth;
            }

            const optimalColumnWidth = calculateOptimalColumnWidth();

            msnry = new Masonry('#masonryContainer', {
                itemSelector: '.encart',
                columnWidth: optimalColumnWidth,
                gutter: 15,
                fitWidth: false,
                percentPosition: true,
                horizontalOrder: true,
                transitionDuration: '0.2s'
            });

            window.addEventListener('resize', function () {
                if (msnry) {
                    const newOptimalWidth = calculateOptimalColumnWidth();
                    msnry.options.columnWidth = newOptimalWidth;
                    msnry.layout();
                }
            });
        }, 100);
    });

    // Delegate click events for folder toggling
    document.body.addEventListener('click', function (event) {
        if (event.target.classList.contains('toggle-folder') || event.target.classList.contains('folder-toggle')) {
            const folderTitle = event.target.closest('.folder-title');
            const folderContent = folderTitle.nextElementSibling;
            toggleFolderDisplay(folderTitle, folderContent);
        }
    });
});

// ================================================================
// ===== FAVICON FALLBACK =====
// ================================================================
//
// Only needed for custom favicons (local files).
// If a local icon fails → try DuckDuckGo.
// If DuckDuckGo fails → browser shows its default icon.
//
// ================================================================

/**
 * Attaches fallback to custom favicon images only.
 * If a local icon file fails, it falls back to DuckDuckGo.
 */
function initFaviconFallbacks() {
    document.querySelectorAll('.favicon.custom-favicon[data-domain]').forEach(function (img) {
        const domain = img.dataset.domain;

        img.onerror = function () {
            // Local icon failed → try DuckDuckGo, then give up
            img.onerror = null;
            img.src = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
        };

        // Handle images that already failed before this handler was attached
        if (img.complete && img.naturalWidth === 0) {
            img.onerror();
        }
    });
}

// ================================================================

/**
 * Toggles folder content visibility and refreshes Masonry layout.
 */
function toggleFolderDisplay(folderTitle, folderContent) {
    const isVisible = folderContent.style.display === 'none';
    folderContent.style.display = isVisible ? 'block' : 'none';
    folderTitle.querySelector('.folder-toggle').classList.toggle('folder-open', isVisible);
    setTimeout(updateMasonryLayout, 50);
}

/**
 * Triggers a Masonry layout recalculation.
 */
function updateMasonryLayout() {
    if (msnry) {
        msnry.layout();
    }
}

/**
 * Recursively builds HTML for bookmark nodes (folders and links).
 * Folders named "sep" (case-insensitive) render as visual separators.
 */
function createBookmarksHtml(bookmarkNodes, title = '') {
    let html = title ? `<h2>${title}</h2>` : '';
    html += '<ul>';
    for (const node of bookmarkNodes) {
        if (node.children) {
            if (node.title.toLowerCase().trim() === 'sep') {
                html += `<li class="separator"><hr></li>`;
            } else {
                html += `<li class="folder-title">`
                    + `<img class="folder-icon" src="icons/favicons/folder.png" alt="Folder">`
                    + `<span class="toggle-folder">${node.title}</span>`
                    + `<span class="folder-toggle">&#9660;</span>`
                    + `</li>`;
                html += `<ul class="folder-content" style="display: none;">`
                    + `${createBookmarksHtml(node.children)}`
                    + `</ul>`;
            }
        } else {
            html += createFaviconHtml(node);
        }
    }
    html += '</ul>';
    return html;
}

/**
 * Builds HTML for a single bookmark with its favicon image.
 *
 * Priority:
 *   1. Custom local icons for known domains (switch/case)
 *   2. DuckDuckGo favicon API (default, no redirects = no CORS)
 *
 * If DuckDuckGo has no icon, the browser shows its default broken image.
 */
function createFaviconHtml(node) {
    if (!node.url) {
        return `<li>⚠️ <span class="bookmark-title">${node.title || "Untitled"}</span></li>`;
    }

    try {
        const urlObj = new URL(node.url);
        const domain = urlObj.hostname.replace(/^www\./, '');
        const formattedTitle = formatTitle(node.title, node.url);

        let faviconUrl;
        let isCustom = true;

        switch (domain) {
            case 'cse-corsicasole.com':
                faviconUrl = 'icons/favicons/cse.ico';
                break;
            case 'sso.monportailrh.com':
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
                faviconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
                isCustom = false;
        }

        const faviconClass = isCustom ? 'favicon custom-favicon' : 'favicon';

        return `<li><img class="${faviconClass}" data-domain="${domain}" src="${faviconUrl}" alt="${formattedTitle}" 
            style="width: 16px; height: 16px; vertical-align: middle; margin-right: 5px;">
            <a href="${node.url}" target="_blank" title="${node.title}" class="bookmark-title">${formattedTitle}</a></li>`;
    } catch (error) {
        console.error('Error processing bookmark URL:', node.url, error);
        return `<li>🔗 <a href="${node.url}" target="_blank" title="${node.title}" class="bookmark-title">${node.title || node.url}</a></li>`;
    }
}

/**
 * Cleans up bookmark titles (removes Google Docs/Sheets/Slides suffixes).
 */
function formatTitle(title, url) {
    if (typeof url !== 'string' || !url.trim()) {
        return title;
    }
    if (url.includes('docs.google.com') || url.includes('sheets.google.com')) {
        return title.replace(/\s*-\s*Google\s*(Docs|Sheets|Slides)/i, '').trim();
    }
    return title;
}