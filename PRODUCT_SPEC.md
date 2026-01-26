# ClipRefine - Product Specification

## 📋 Overview

**ClipRefine** is a smart Chrome extension that automatically refines and transforms clipboard content in real-time. When users copy text from any webpage, ClipRefine applies customizable rules to clean, format, and transform the text before it reaches the clipboard.

### Key Value Proposition
- **Zero-friction text processing**: No manual steps required - transformations happen automatically during copy operations
- **Highly customizable**: Users can create unlimited custom rules using plain text or regex patterns
- **Domain-specific rules**: Apply different rules for different websites
- **Privacy-first**: All processing happens locally - no data is sent to external servers

---

## 🎯 Target Users

### Primary Users
1. **Developers & Technical Writers**
   - Need to clean code snippets, remove formatting, or standardize date formats
   - Frequently copy-paste between documentation and code

2. **Data Analysts**
   - Copy numbers with unwanted commas or formatting
   - Need consistent date/number formats for spreadsheets

3. **Content Creators & Copywriters**
   - Remove extra whitespace from copied text
   - Clean URLs before sharing

4. **Power Users**
   - Anyone who frequently copies text and wants automation
   - Users tired of manual text cleanup after copying

---

## ✨ Core Features

### 1. Automatic Text Transformation
- **Real-time processing**: Text is transformed during the copy event (Ctrl+C)
- **Multi-rule support**: Multiple rules can be applied sequentially
- **Conditional execution**: Rules only apply when enabled and domain matches

### 2. Rule Management System

#### Built-in Rules (Default)
1. **Remove Commas**
   - Pattern: `,` (plain text)
   - Use case: Converting formatted numbers (1,000,000 → 1000000)
   - Default: Disabled

2. **Remove All Spaces**
   - Pattern: `\s+` (regex)
   - Use case: Removing all whitespace characters
   - Default: Disabled

3. **Date Format: Hyphen to Dot**
   - Pattern: `(\d{4})-(\d{2})-(\d{2})` → `$1.$2.$3` (regex)
   - Use case: Converting date formats (2024-01-25 → 2024.01.25)
   - Default: Disabled

#### Custom Rules
Users can create unlimited custom rules with:
- **Rule Name**: Descriptive identifier
- **Description**: Optional explanation of the rule's purpose
- **Find Pattern**: Text or regex pattern to search for
- **Replace Pattern**: Replacement text (supports regex groups like $1, $2)
- **Regex Toggle**: Enable regex pattern matching
- **Target Domains**: Optional domain restrictions (e.g., "github.com")
- **Active Status**: Enable/disable individual rules

### 3. User Interface

#### Popup (Extension Icon)
- **Quick Status View**: Shows if service is active
- **Global Toggle**: One-click enable/disable all functionality
- **Active Rules List**: Displays currently enabled rules
- **Settings Access**: Quick link to full settings page

#### Options Page (Full Settings)
- **Toast Notifications Toggle**: Enable/disable visual feedback
- **Console Logs Toggle**: Enable/disable debug logging
- **Rules Table**: Comprehensive view of all rules with:
  - Rule name, description
  - Find/replace patterns
  - Regex indicator
  - Active status toggle
  - Edit/Delete actions
- **Add Rule Modal**: Full-featured form for creating/editing rules
- **Import/Export**: Backup and share rule configurations

### 4. Settings & Configuration

#### Global Settings
- **Service Active**: Master on/off switch
- **Show Toast Notifications**: Display notifications when text is transformed
- **Show Console Logs**: Enable debug logging for developers

#### Storage & Sync
- Uses Chrome Storage Sync API
- Settings and rules sync across devices (same Chrome account)
- Maximum storage: Chrome's sync quota (~100KB)

---

## � Pricing & Tier Comparison

ClipRefine offers two tiers to meet different user needs:

### Free Tier
Perfect for casual users and those getting started with clipboard automation.

### Premium Tier
Designed for power users who need unlimited rules, advanced features, and seamless synchronization.

### Feature Comparison Table

| Feature | Free | Pro |
|---------|------|---------|
| **Custom Rules** | Max 5 Rules | ✅ Unlimited |
| **Target Domains** | Max 3 Domains per Rule | ✅ Unlimited |
| **Regex Complexity** | ✅ Full Support | ✅ Full Support |
| **Import / Export** | ❌ Blocked | ✅ Available (Backup & Share) |
| **Popup Control** | Global Switch Only<br/>(전체 끄기/켜기만 가능) | ✅ Individual Toggles<br/>(개별 규칙 즉시 ON/OFF 가능) |
| **Profile System** | Single Default Mode | ✅ Multi-Profile Switching<br/>(coding, editing, etc…) |
| **Toast Notifications** | ✅ Available | ✅ Available |
| **Console Logging** | ✅ Available | ✅ Available |

### Premium-Only Features Explained

#### 1. Unlimited Custom Rules
- **Free**: Limited to 5 custom rules
- **Premium**: Create unlimited rules for any use case
- **Value**: Essential for users with diverse text processing needs

#### 2. Unlimited Target Domains
- **Free**: Each rule can target max 3 domains
- **Premium**: No limit on domain targeting
- **Value**: Apply same rule across all your frequently visited sites

#### 3. Import / Export Rules
- **Free**: Cannot backup or share rule configurations
- **Premium**: Full import/export capability with JSON files
- **Value**: 
  - Backup your rules before browser reset
  - Share rule sets with team members
  - Migrate between devices easily

#### 4. Individual Rule Toggles in Popup
- **Free**: Can only enable/disable all rules at once via global switch
- **Premium**: Quick toggle individual rules from popup without opening settings
- **Value**: 
  - Faster workflow adjustments
  - Context-specific rule activation
  - No need to navigate to settings page

#### 5. Multi-Profile System
- **Free**: Single default ruleset
- **Premium**: Create and switch between multiple profiles
- **Examples**:
  - "Coding Mode": Remove spaces, convert line breaks
  - "Data Entry": Keep formatting, remove commas only
  - "Writing": Clean URLs, normalize whitespace
  - "Research": Date format standardization
- **Value**: One-click workflow switching for different tasks

### Pricing Model (Recommended)

#### Free Forever
- $0/month
- Perfect for personal use
- All core features with reasonable limits

#### Premium
- **$3.99/month** or **$29.99/year** (save 37%)
- Ideal for professionals and power users
- All features unlocked
- Priority support
- Early access to new features

#### Team Plan (Future)
- **$9.99/month per user** (min 3 users)
- Shared rule libraries
- Team-wide profile templates
- Centralized management dashboard
- Volume discount for 10+ users

---

## �🛠 Technical Architecture

### Tech Stack
- **Manifest V3**: Latest Chrome Extension API
- **Vanilla JavaScript (ES6+)**: No frameworks for minimal bundle size
- **Tailwind CSS**: Utility-first styling
- **Chrome Storage Sync API**: Cross-device synchronization

### File Structure
```
clip-refine/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (initialization)
├── content.js             # Main logic (clipboard interception)
├── popup.html/js          # Extension icon popup
├── options.html/js        # Full settings page
├── styles.css             # Compiled Tailwind CSS
├── icons/                 # Extension icons
└── src/input.css          # Tailwind source
```

### Data Flow
1. **User copies text** (Ctrl+C or right-click copy)
2. **Content script intercepts** copy event
3. **Checks global active status** and loads enabled rules
4. **Filters rules** by domain (if specified)
5. **Applies rules sequentially** to transform text
6. **Replaces clipboard content** with transformed text
7. **Shows toast notification** (if enabled)

### Rule Processing Algorithm
```javascript
1. Load all rules from storage
2. Filter by isActive = true
3. Filter by targetDomains (if specified)
4. For each active rule:
   a. If regex: Apply RegExp with global flag
   b. If plain text: Use replaceAll()
5. Set transformed text to clipboard
```

---

## 🎨 Design System

### Colors
- **Primary**: `#6B40C8` (Purple) - Main brand color
- **Gradient**: `#6B40C8` to `#8a4fff` - Buttons and accents
- **Background Light**: `#f6f6f8`
- **Background Dark**: `#161022`

### Typography
- **Font Family**: Manrope (Google Fonts)
- **Weights**: 200-800 variable

### UI Components
- **Cards**: Rounded, shadowed containers with hover effects
- **Toggles**: Custom-styled checkboxes with smooth animations
- **Buttons**: Gradient backgrounds with scale animations
- **Modals**: Backdrop blur with smooth transitions
- **Icons**: Material Symbols Outlined

---

## 📊 Use Cases & Examples

### Example 1: Data Analyst
**Scenario**: Copying financial data from website to spreadsheet

**Before**:
```
Total Revenue: $1,000,000
Expenses: $450,000
```

**Rules Applied**:
1. Remove Commas

**After**:
```
Total Revenue: $1000000
Expenses: $450000
```

### Example 2: Developer
**Scenario**: Copying date from API documentation

**Before**:
```
Release Date: 2024-01-25
```

**Rules Applied**:
1. Date Format: Hyphen to Dot

**After**:
```
Release Date: 2024.01.25
```

### Example 3: Content Creator
**Scenario**: Cleaning up copied text from PDF

**Before**:
```
Lorem    ipsum    dolor
sit     amet
```

**Rules Applied**:
1. Remove All Spaces

**After**:
```
Loremipsumdolorsitamet
```

---

## 🔒 Privacy & Security

### Data Handling
- **100% Local Processing**: All transformations happen in the browser
- **No External Servers**: No data is sent anywhere
- **No Tracking**: No analytics or user behavior tracking
- **Open Source Ready**: Code can be audited

### Permissions Required
- **storage**: Save user settings and rules
- **activeTab**: Access current webpage for domain-specific rules
- **clipboardWrite**: Modify clipboard content
- **host_permissions (all_urls)**: Apply rules on any website

---

## 🚀 Future Roadmap

### Phase 2 Features
1. **Rule Templates Library**
   - Pre-built rule collections for common use cases
   - Community-shared rule sets

2. **Rule Testing Tool**
   - Live preview of transformations
   - Input/output comparison view

3. **Rule Ordering**
   - Drag-and-drop rule prioritization
   - Manual sequence control

4. **Statistics Dashboard**
   - Track how many times each rule is used
   - Most-used domains
   - Total transformations counter

5. **Context Menu Integration**
   - Right-click → "Copy with Rule X"
   - Manual rule selection per copy

6. **Keyboard Shortcuts**
   - Quick toggle rules
   - Open settings with hotkey

### Phase 3 Features
1. **Multi-language Support**
   - i18n for interface
   - Language-specific rules

2. **Cloud Backup**
   - Optional external backup service
   - Rule versioning

3. **Rule Marketplace**
   - Share and discover rules
   - Rating system

---

## 📈 Success Metrics

### Key Performance Indicators (KPIs)
1. **Active Users**: Daily/Monthly active users
2. **Retention Rate**: 7-day and 30-day retention
3. **Rule Creation**: Average rules per user
4. **Engagement**: Percentage of users who create custom rules
5. **Chrome Web Store Rating**: Target 4.5+ stars

### User Satisfaction Goals
- Reduce manual text cleanup time by 80%
- Average rating of 4.5+ stars
- Less than 5% uninstall rate within first week

---

## 🐛 Known Limitations

1. **Single Undo Step**: Cannot undo transformations (clipboard limitation)
2. **Rich Text Limitation**: Only works with plain text, not formatted content
3. **Regex Complexity**: Users need regex knowledge for advanced patterns
4. **Chrome Only**: Currently limited to Chromium-based browsers
5. **Storage Quota**: Limited by Chrome's sync storage (~100KB)

---

## 📝 Version History

### v1.0.0 (Current)
- ✅ Automatic clipboard transformation
- ✅ Custom rule creation with regex support
- ✅ Domain-specific rules
- ✅ Import/Export rules
- ✅ Toast notifications
- ✅ Console logging toggle
- ✅ Dark mode support
- ✅ Settings sync across devices

---

## 🤝 Contributing

### Development Setup
```bash
# Install dependencies
npm install

# Build CSS
npm run build:css

# Watch CSS changes
npm run watch:css

# Load extension
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project folder
```

### Code Style
- **JavaScript**: ES6+ with clear function names
- **CSS**: Tailwind utility classes
- **Naming**: camelCase for variables, PascalCase for classes
- **Comments**: English only, explain "why" not "what"

---

## 📧 Support & Contact

- **Issues**: Report bugs or request features on GitHub
- **Documentation**: Full docs in README.md
- **License**: MIT License

---

**Last Updated**: January 25, 2026
**Document Version**: 1.0.0
