(function() {
  // Fonction pour trouver le favicon de la page
  function findFavicon() {
    // Essayer plusieurs sélecteurs pour couvrir plus de cas
    const selectors = [
      "link[rel~='icon']",
      "link[rel='shortcut icon']",
      "link[rel='icon']",
      "link[rel='apple-touch-icon']",
      "link[rel='apple-touch-icon-precomposed']"
    ];
    
    for (const selector of selectors) {
      const link = document.querySelector(selector);
      if (link && link.href) {
        return link.href;
      }
    }
    
    // Si aucun favicon n'est trouvé avec les sélecteurs, essayer /favicon.ico
    return new URL('/favicon.ico', location.origin).href;
  }
  
  // Attendre un peu pour s'assurer que Notion a chargé son favicon personnalisé
  setTimeout(() => {
    const faviconUrl = findFavicon();
    if (faviconUrl) {
      // Stocker le favicon avec l'URL de la page comme clé
      const storageData = {};
      storageData[location.href] = faviconUrl;
      chrome.storage.local.set(storageData, () => {
        console.log('Favicon stored for:', location.href, '->', faviconUrl);
      });
    }
  }, 2000); // Attendre 2 secondes pour laisser le temps à Notion de charger
})(); 