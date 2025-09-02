# The Unseen Spectrum - Chrome Extension

Experience a new perspective. The Unseen Spectrum uses simulations to show you the world as a color blind person sees it. Prepare to see color in a whole new light.

## Features

- **Color Blindness Simulation**: Experience web pages as someone with different types of color blindness would see them
- **Real-time Processing**: Apply filters instantly to any webpage
- **Multiple Color Blindness Types**: Support for Protanopia, Deuteranopia, Tritanopia, and more
- **Easy Toggle**: Simple on/off functionality with visual indicators
- **Modern UI**: Clean, accessible interface with smooth animations

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Download or Clone the Extension**
   ```bash
   git clone <your-repo-url>
   cd the-unseen-spectrum
   ```

2. **Create Required Icons**
   - Open `icons/icon.svg` in a design tool (Figma, Adobe Illustrator, GIMP, Inkscape)
   - Export as PNG files with these exact sizes:
     - `icon16.png` (16x16 pixels)
     - `icon32.png` (32x32 pixels) 
     - `icon48.png` (48x48 pixels)
     - `icon128.png` (128x128 pixels)
   - Save all PNG files in the `icons/` directory

3. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or go to Menu → More Tools → Extensions

4. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

5. **Load the Extension**
   - Click "Load unpacked"
   - Select the `the-unseen-spectrum` folder containing your extension files
   - The extension should now appear in your extensions list

6. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "The Unseen Spectrum" and click the pin icon
   - The extension icon will now appear in your toolbar

### Method 2: Create Extension Package (Distribution)

1. **Prepare the Extension**
   - Ensure all files are in place (manifest.json, scripts, icons, etc.)
   - Test the extension thoroughly

2. **Create ZIP Package**
   ```bash
   # On Windows (PowerShell)
   Compress-Archive -Path "manifest.json","popup.html","popup.css","popup.js","background.js","content.js","icons" -DestinationPath "the-unseen-spectrum.zip"
   
   # On macOS/Linux
   zip -r the-unseen-spectrum.zip manifest.json popup.html popup.css popup.js background.js content.js icons/
   ```

3. **Upload to Chrome Web Store** (Optional)
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Create a new item
   - Upload your ZIP file
   - Fill in store listing details
   - Submit for review

## File Structure

```
the-unseen-spectrum/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup UI
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── background.js          # Background service worker
├── content.js             # Content script for page interaction
├── icons/                 # Extension icons
│   ├── icon.svg          # Source SVG icon
│   ├── icon16.png        # 16x16 toolbar icon
│   ├── icon32.png        # 32x32 Windows icon
│   ├── icon48.png        # 48x48 management page icon
│   └── icon128.png       # 128x128 store icon
└── README.md             # This file
```

## Development

### Prerequisites
- Google Chrome browser
- Basic knowledge of HTML, CSS, and JavaScript
- Text editor or IDE

### Local Development Setup

1. **Make Changes**
   - Edit any of the extension files
   - Save your changes

2. **Reload Extension**
   - Go to `chrome://extensions/`
   - Find "The Unseen Spectrum"
   - Click the refresh/reload button
   - Test your changes

3. **Debug**
   - Right-click the extension icon → "Inspect popup" (for popup debugging)
   - Go to `chrome://extensions/` → Click "service worker" (for background script debugging)
   - Use browser DevTools for content script debugging

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] Toggle functionality works
- [ ] Content script injects properly
- [ ] Settings persist across browser sessions
- [ ] Icons display correctly in all sizes
- [ ] No console errors in any context

## Usage

1. **Activate the Extension**
   - Click the extension icon in your toolbar
   - Click "Toggle Feature" to enable/disable

2. **Visual Indicators**
   - When active, you'll see a small indicator on web pages
   - The extension icon will show the current state

3. **Keyboard Shortcut**
   - Press `Ctrl+Shift+U` (or `Cmd+Shift+U` on Mac) to toggle the extension

## Troubleshooting

### Common Issues

**Extension won't load:**
- Check that all required files are present
- Verify manifest.json syntax is correct
- Ensure all icon files exist and are proper PNG format

**Icons not displaying:**
- Make sure PNG files are in the `icons/` directory
- Verify file names match exactly (case-sensitive)
- Check that images are valid PNG format

**Content script not working:**
- Check browser console for errors
- Verify the content script is being injected
- Make sure the page URL matches the manifest permissions

**Popup not opening:**
- Check for JavaScript errors in popup
- Verify popup.html references popup.js correctly
- Test in incognito mode to rule out conflicts

### Getting Help

1. Check the browser console for error messages
2. Verify all file paths and references are correct
3. Test with a minimal version to isolate issues
4. Check Chrome extension documentation for API changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team.

---

**Note**: This extension is designed for educational and accessibility purposes. Always respect website terms of service and user privacy when developing extensions.
