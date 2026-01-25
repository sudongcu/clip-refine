// Background service worker
// Create default settings and rules on initial installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Default settings
    const defaultSettings = {
      isGlobalActive: true,
      showToast: true,
      showConsoleLog: false
    };

    // Default rules (MVP preset)
    const defaultRules = [
      {
        id: 'rule_builtin_001',
        name: 'Remove Commas',
        description: 'Remove commas from numbers (e.g., 1,000,000 → 1000000)',
        findPattern: ',',
        replacePattern: '',
        isRegex: false,
        isActive: false,
        targetDomains: []
      },
      {
        id: 'rule_builtin_002',
        name: 'Remove All Spaces',
        description: 'Remove all whitespace characters (spaces, tabs, newlines)',
        findPattern: '\\s+',
        replacePattern: '',
        isRegex: true,
        isActive: false,
        targetDomains: []
      },
      {
        id: 'rule_builtin_003',
        name: 'Date Format: Hyphen to Dot',
        description: 'Convert date format from YYYY-MM-DD to YYYY.MM.DD',
        findPattern: '(\\d{4})-(\\d{2})-(\\d{2})',
        replacePattern: '$1.$2.$3',
        isRegex: true,
        isActive: false,
        targetDomains: []
      }
    ];

    // Save to storage
    await chrome.storage.sync.set({
      settings: defaultSettings,
      rules: defaultRules
    });

    console.log('ClipRefine: Default settings and rules initialized');
  }
});

// Message listener (extend as needed)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getRules') {
    chrome.storage.sync.get(['rules'], (data) => {
      sendResponse({ rules: data.rules || [] });
    });
    return true; // Async response
  }

  if (request.action === 'saveRules') {
    chrome.storage.sync.set({ rules: request.rules }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Update icon state (active/inactive)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.settings) {
    const isActive = changes.settings.newValue?.isGlobalActive;
    updateIcon(isActive);
  }
});

// Update icon function
function updateIcon(isActive) {
  // Activate when actual icon files exist
  // chrome.action.setIcon({
  //   path: {
  //     16: isActive ? 'icons/icon16.png' : 'icons/icon16-disabled.png',
  //     48: isActive ? 'icons/icon48.png' : 'icons/icon48-disabled.png',
  //     128: isActive ? 'icons/icon128.png' : 'icons/icon128-disabled.png'
  //   }
  // });
}

// Initial icon setup
chrome.storage.sync.get(['settings'], (data) => {
  const isActive = data.settings?.isGlobalActive !== false;
  updateIcon(isActive);
});
