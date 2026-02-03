# ClipRefine BETA - Usage Guide

## What is ClipRefine?

**ClipRefine** is a smart clipboard manager that automatically refines copied text based on your custom rules.

---

## Key Features

### 1. Custom Text Replacement Rules
Create rules to automatically transform copied text.

- **Find & Replace**: Simple text replacement
- **Regex Support**: Advanced pattern matching
- **Domain Targeting**: Apply rules only on specific websites

### 2. Global Toggle
Enable or disable all rules with one click from the popup.

### 3. Toast Notifications
See visual confirmation when text is refined.

---

## How to Use

### Step 1: Open Settings
Click the ClipRefine icon in your browser toolbar, then click **"Open Settings"**.

![Step 1](./images/step1-open-settings.png)

---

### Step 2: Create a New Rule
Click **"+ Add Rule"** button to create your first rule.

![Step 2](./images/step2-add-rule.png)

---

### Step 3: Configure Your Rule

| Field | Description | Example |
|-------|-------------|---------|
| **Rule Name** | A descriptive name | "Remove Tracking Parameters" |
| **Description** | What this rule does | "Removes UTM parameters from URLs" |
| **Find Pattern** | Text or regex to find | `?utm_source=.*` |
| **Replace With** | Replacement text | (leave empty to remove) |
| **Use Regex** | Enable for pattern matching | ON |
| **Target Domains** | Limit to specific sites | `google.com, github.com` |
| **Active Status** | Enable/disable this rule | ON |

![Step 3](./images/step3-configure-rule.png)

---

### Step 4: Copy Text
When you copy text on a matching website, ClipRefine automatically applies your rules.

**Before:** `https://example.com?utm_source=google&utm_medium=cpc`

**After:** `https://example.com`

![Step 4](./images/step4-copy-text.png)

---

### Step 5: See the Result
A toast notification confirms the text was refined.

![Step 5](./images/step5-toast-notification.png)

---

## Rule Examples

### Example 1: Remove URL Tracking
| Setting | Value |
|---------|-------|
| Find Pattern | `[?&](utm_[a-z_]+|fbclid|gclid)=[^&]*` |
| Replace With | *(empty)* |
| Use Regex | ON |

### Example 2: Replace Company Name
| Setting | Value |
|---------|-------|
| Find Pattern | `OldCompany` |
| Replace With | `NewCompany` |
| Use Regex | OFF |

### Example 3: Format Phone Numbers
| Setting | Value |
|---------|-------|
| Find Pattern | `(\d{3})(\d{4})(\d{4})` |
| Replace With | `$1-$2-$3` |
| Use Regex | ON |

---

## Quick Tips

1. **Test your regex** at [regex101.com](https://regex101.com) before adding
2. **Leave domains empty** to apply rules on all websites
3. **Use the toggle** in popup to quickly disable all rules
4. **Check console logs** for debugging (enable in settings)

---

## Popup Overview

```
+----------------------------------+
|  ClipRefine              [Toggle]|
+----------------------------------+
|  Active Rules                    |
|  +----------------------------+  |
|  | Rule Name 1               |  |
|  | Description text here     |  |
|  +----------------------------+  |
|  | Rule Name 2               |  |
|  | Description text here     |  |
|  +----------------------------+  |
|                                  |
|  [Open Settings]                 |
+----------------------------------+
```

---

## Settings Page Overview

```
+--------------------------------------------------+
|  [Logo] ClipRefine                               |
+--------------------------------------------------+
|  +------------+  +-----------------------------+ |
|  | Dashboard  |  |  Rule Dashboard             | |
|  | Settings   |  |  +-----------------------+  | |
|  | License    |  |  | Rule 1    [ON] [Edit] |  | |
|  |   [BETA]   |  |  | Rule 2    [ON] [Edit] |  | |
|  +------------+  |  +-----------------------+  | |
|                  |  [+ Add Rule]               | |
|                  +-----------------------------+ |
+--------------------------------------------------+
```

---

## Support

- **Website**: [cliprefine.com](https://cliprefine.com)
- **Email**: support@cliprefine.com
- **Version**: 0.9.0 (BETA)

---

*Thank you for using ClipRefine BETA!*
