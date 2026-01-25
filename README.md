# ClipRefine - Smart Clipboard Manager

ClipRefine is a Chrome extension that automatically processes text when copying.

## Key Features

### MVP Features
- **Global On/Off**: Click the extension icon to enable/disable all functionality.
- **Built-in Rules**:
  - Remove Commas: Remove commas from numbers (1,000,000 → 1000000)
  - Trim Whitespace: Remove leading and trailing whitespace
  - Clean URL Parameters: Remove URL parameters
- **Custom Rules**: Create your own replacement rules using RegEx patterns
- **Toast Notifications**: Display notifications when text is transformed

## Installation

1. Navigate to `chrome://extensions/` in Chrome browser
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select this folder

## Usage

1. Click the extension icon to check activation status
2. Enable/add rules in the settings page
3. Copy text from any webpage (`Ctrl+C`) and rules will be automatically applied

## Rule Configuration

### Adding Rules
1. Click the extension icon
2. Click "RULE SETTINGS" button
3. Click "Add Rule" button
4. Enter rule information:
   - Rule name
   - Description (optional)
   - Find pattern (plain text or regex)
   - Replacement text
   - Enable regex
   - Target domains (optional)
5. Save

### Regex Examples
- Remove number commas: `[,]` → (empty string)
- Remove URL parameters: `\\?.*$` → (empty string)
- Normalize whitespace: `\\s+` → ` ` (single space)
- Remove special characters: `[^a-zA-Z0-9\\s]` → (empty string)

## Rule Sharing

### Export
1. Click "Export Rules" at the bottom of settings page
2. JSON file will be downloaded

### Import
1. Click "Import Rules" at the bottom of settings page
2. Select JSON file

## Project Structure

```
clip-refine/
├── manifest.json       # Extension configuration
├── background.js       # Background service worker
├── content.js          # Content script (clipboard intercept)
├── popup.html          # Popup UI
├── popup.js            # Popup logic
├── options.html        # Settings page UI
├── options.js          # Settings page logic
├── styles.css          # Styles
├── icons/              # Extension icons
└── README.md           # This file
```

## Tech Stack

- **Manifest V3**: Latest Chrome Extension version
- **Vanilla JavaScript**: Pure JavaScript (ES6+)
- **Chrome Storage API**: User settings synchronization
- **Content Scripts**: Capture copy events within pages

## Notes

- Regex patterns should be written carefully.
- Incorrect regex may transform text unexpectedly.
- Domain-specific settings make rules work only on certain sites.

## Future Plans

- Rule chaining (apply multiple rules sequentially)
- Context menu integration (select rules via right-click)
- Rule testing functionality
- Statistics and usage history

## License

MIT

MIT License

## 제작자

ClipFlow Team
