# EcoFavsManager
A Chrome extension for managing bookmarks with integrated search bars for Lilo and Ecosia, featuring dynamic icons and a layout optimized by Masonry.

This project was born from the idea of migrating the Bookolio extension, originally designed with Manifest V2, to Manifest V3. During the process, it was simplified and tailored to my preferences, now fully upgraded to V3.

# Custom Bookmark Manager

This Chrome extension offers a sleek and dynamic way to manage your bookmarks, featuring integrated search functionalities with Lilo and Ecosia for eco-conscious web browsing.

## Features

- **Bookmark Management**: Easily organize, edit, and access your bookmarks.
- **Dual Search Bars**: Conduct web searches directly from your homepage using Lilo and Ecosia.
- **Dynamic Icons**: Automatically fetches icons for bookmarks, enhancing visual navigation.
- **Responsive Layout**: Utilizes Masonry for an optimal layout, ensuring efficient space usage and a clean appearance.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/LudivineCh/EcoFavsManager.git

2. **Load the extension into Chrome**:
- Open Chrome and navigate to chrome://extensions
- Enable Developer Mode by clicking the toggle switch next to "Developer mode."
- Click the "Load unpacked" button and select the directory where you cloned the repository.

## Usage
- Adding Bookmarks: Click the "Add Bookmark" button and enter the URL. The favicon will be automatically fetched.
- Searching the Web: Use the search bars at the top of the page to perform searches on Lilo or Ecosia.
- Organizing Bookmarks: Drag and drop bookmarks to rearrange them within the grid.

## Customization
- Modify the style.css to alter the appearance according to your preference.
- Edit newtab.js to add or modify functionalities.

## Contributions

We welcome contributions from everyone! 
For detailed instructions on how to contribute to EcoFavsManager, including coding standards, pull request guidelines, 
and how to set up your development environment, please see our [CONTRIBUTING.md](CONTRIBUTING.md) file.

If you're interested in helping, especially with the CSP issue mentioned below, your expertise would be greatly appreciated!

### Help Wanted

We are currently seeking help with specific issues, including a Content Security Policy (CSP) error that prevents inline scripts from executing. 
The exact error is:
> Refused to execute inline event handler because it violates the following Content Security Policy directive: "script-src 'self'". Either the 'unsafe-inline' keyword, a hash ('sha256-...'), or a nonce ('nonce-...') is required to enable inline execution. Note that hashes do not apply to event handlers, style attributes and javascript: navigations unless the 'unsafe-hashes' keyword is present.

If you have experience with CSP or web security, your insights and contributions to resolve this would be greatly appreciated!

### Reporting Issues

If you encounter any bugs or have suggestions for improvements, please file an issue through the GitHub issue tracker. 
Be sure to include detailed information about the issue and steps to reproduce it.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.

