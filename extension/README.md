
# DM Decoder Browser Extension

A browser extension companion for the DM Decoder web app that provides AI-powered message analysis and reply suggestions directly in your browser.

## Features

- **Text Selection Analysis**: Right-click on selected text to analyze with DM Decoder
- **Floating Widget**: Clean, unobtrusive widget that overlays on web pages
- **Multiple Tone Options**: Choose between friendly, formal, and witty reply styles
- **One-Click Copy**: Copy generated replies directly to your clipboard
- **Context Menu Integration**: Access DM Decoder from the right-click menu
- **Cross-Platform Support**: Works on Gmail, LinkedIn, Twitter/X, and other sites

## Installation

### For Development
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension` folder
4. The extension icon should appear in your browser toolbar

### For Distribution
1. Create a ZIP file of the extension folder
2. Submit to Chrome Web Store or Firefox Add-ons

## Usage

### Method 1: Text Selection
1. Select any text on a webpage (minimum 10 characters)
2. A quick "🧠 Analyze" button will appear
3. Click it to analyze the selected text

### Method 2: Context Menu
1. Select text on any webpage
2. Right-click and choose "Analyze with DM Decoder"
3. The analysis will start automatically

### Method 3: Extension Popup
1. Click the DM Decoder icon in your browser toolbar
2. Use the popup to access settings and open the full app

## Supported Platforms

- Gmail (mail.google.com)
- LinkedIn (linkedin.com)
- Twitter/X (twitter.com, x.com)
- Any website (via text selection)

## Privacy & Security

- No data is stored locally beyond user preferences
- All analysis requests go through the official DM Decoder API
- No tracking or analytics are collected by the extension
- Extension only activates when explicitly used

## Files Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for background tasks
├── content.js            # Content script injected into web pages
├── content.css           # Styles for the floating widget
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── icons/                # Extension icons (16x16 to 128x128)
└── README.md             # This file
```

## Development

To modify the extension:

1. Make changes to the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh button on the DM Decoder extension
4. Test your changes on supported websites

## Building for Production

1. Update version number in `manifest.json`
2. Add proper icon files to the `icons/` folder
3. Test thoroughly on all supported platforms
4. Create a ZIP file for store submission

## API Integration

The extension connects to the main DM Decoder app API:
- Production: `https://reply-mind.lovable.app/api/analyze`
- Fallback: Uses demo responses when API is unavailable

## Browser Compatibility

- Chrome 88+ (Manifest V3 support)
- Firefox 109+ (with minor modifications)
- Edge 88+ (Chromium-based)
