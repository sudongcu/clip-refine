# Privacy Policy - ClipRefine

**Last Updated:** February 2025
**Version:** Beta (0.9.x)

---

## Overview

ClipRefine is a Chrome extension that processes clipboard text locally in your browser. We are committed to protecting your privacy and being transparent about our data practices.

---

## Data Collection

### What We DO NOT Collect

- **Clipboard Content:** All text processing happens entirely within your browser. Your copied text is never sent to any external server.
- **Browsing History:** We do not track or store which websites you visit.
- **Personal Information:** We do not collect names, emails, or any personally identifiable information.
- **Usage Analytics:** We do not use any analytics or tracking services.

### What We Store Locally

The following data is stored locally in your browser using Chrome's Storage Sync API:

| Data | Purpose | Storage Location |
|------|---------|------------------|
| User-created rules | To apply text transformations | Chrome Storage Sync |
| Extension settings | To remember your preferences | Chrome Storage Sync |

This data syncs across your Chrome browsers if you are signed into Chrome, but is never accessible to us or any third party.

---

## Permissions Explained

ClipRefine requires the following permissions:

| Permission | Why We Need It |
|------------|----------------|
| `storage` | To save your rules and settings |
| `activeTab` | To detect the current website for domain-specific rules |
| `clipboardWrite` | To write refined text back to your clipboard |
| `host_permissions (<all_urls>)` | To run the content script on all websites where you copy text |

---

## Data Processing

- All text processing occurs **locally** in your browser
- No data is transmitted to external servers
- No third-party services are used for text processing
- Your clipboard content remains completely private

---

## Third-Party Services

This extension does not connect to any third-party services. All processing happens locally in your browser.

---

## Data Security

- All data is stored using Chrome's secure Storage API
- No external database or server stores your information
- Your rules and settings are encrypted in transit when syncing across Chrome browsers

---

## Your Rights

You have full control over your data:

- **View:** Access your rules and settings through the extension options page
- **Delete:** Remove all data by uninstalling the extension or clearing extension data in Chrome settings

---

## Children's Privacy

ClipRefine does not knowingly collect any information from children under 13 years of age.

---

## Changes to This Policy

We may update this privacy policy when new features are added. Significant changes will be communicated through:

- Extension update notes
- In-app notification

---

## Contact

If you have any questions about this privacy policy, please contact us:

- **GitHub Issues:** [Report an issue](https://github.com/user/cliprefine/issues)
- **Email:** [your-email@example.com]

---

## Summary

| Question | Answer |
|----------|--------|
| Do we collect your clipboard data? | **No** |
| Do we track your browsing? | **No** |
| Do we use analytics? | **No** |
| Is your data sent to servers? | **No** |
| Where is data stored? | Locally in your browser |

---

*This privacy policy is effective as of the date stated above.*