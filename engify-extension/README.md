# Engify Chrome Extension

Visual debugging tool that connects UI elements to their source code.

## Features

- Click any element to find exact source file/line
- Uses Chrome DevTools Protocol for accuracy
- Integrates with MCP server for IDE integration
- Copy location to clipboard
- Send directly to IDE (Cursor, VS Code)

## Installation

### Development

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `engify-extension` folder

### Permissions

The extension requires:
- `activeTab`: Access current tab content
- `debugger`: Use Chrome DevTools Protocol to find source locations
- `scripting`: Inject content scripts

## Usage

1. Click the Engify icon in Chrome toolbar
2. Click "Start Inspection Mode"
3. Click any element on the page
4. View the source location in the popup
5. Copy to clipboard or send to IDE

## MCP Server Integration

The extension sends data to a local MCP server running on `localhost:3001`. Make sure the MCP server is running before using the "Send to IDE" feature.

## Development

### Files Structure

```
engify-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (CDP integration)
├── content.js            # Element detection and highlighting
├── content.css           # Styles for highlighting
├── popup.html            # Popup UI
├── popup.js              # Popup logic
└── icons/                # Extension icons
```

### Testing

1. Open a local development server (e.g., `npm run dev` on localhost:3000)
2. Load the extension in Chrome
3. Test clicking elements on your site
4. Check browser console for errors
5. Verify MCP server receives data

## Troubleshooting

### "Read and change all your data" warning

This warning appears because the extension needs the `debugger` permission to access Chrome DevTools Protocol. The extension only uses this to find source code locations and does not read or change your data.

### Elements not found

- Make sure source maps are enabled in your build tool
- Check that the site is running on localhost (required for debugger permission)
- Some CSS-in-JS libraries may not provide source maps

### MCP server connection

- Verify MCP server is running on localhost:3001
- Check that `http://localhost:3001/health` returns OK
- Look for CORS errors in browser console

## License

MIT
