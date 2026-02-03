// Content script - Intercept clipboard events

let isActive = true;
let showToastSetting = true;
let showConsoleLog = false;
let rules = [];
let isLoaded = false;

// Helper function for conditional logging
function log(...args) {
  if (showConsoleLog) {
    console.log('ClipRefine:', ...args);
  }
}

// Initial settings load
chrome.storage.sync.get(['settings', 'rules'], (data) => {
  if (data.settings) {
    isActive = data.settings.isGlobalActive !== false;
    showToastSetting = data.settings.showToast !== false;
    showConsoleLog = data.settings.showConsoleLog === true;
  }
  if (data.rules) {
    rules = data.rules;
    log('Loaded rules:', rules);
  } else {
    log('No rules found in storage');
  }
  isLoaded = true;
  log('Content script initialized. Console logging:', showConsoleLog ? 'ON' : 'OFF');
});

// Detect settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.settings) {
      const newSettings = changes.settings.newValue;
      isActive = newSettings.isGlobalActive !== false;
      showToastSetting = newSettings.showToast !== false;
      showConsoleLog = newSettings.showConsoleLog === true;
      log('Settings updated. Console logging:', showConsoleLog ? 'ON' : 'OFF');
    }
    if (changes.rules) {
      rules = changes.rules.newValue || [];
      log('Rules updated:', rules.length, 'rules');
    }
  }
});

// Copy event listener
document.addEventListener('copy', (event) => {
  if (!isActive) {
    log('Inactive');
    return;
  }

  try {
    // Get currently selected text
    const selection = window.getSelection();
    let text = selection.toString();

    if (!text) return;
    log('Original text:', text);

    // Current domain
    const currentDomain = window.location.hostname;

    // Filter and apply active rules
    const activeRules = rules.filter(rule => {
      if (!rule.isActive) return false;
      
      // Domain filtering
      if (rule.targetDomains && rule.targetDomains.length > 0) {
        return rule.targetDomains.some(domain => 
          currentDomain.includes(domain)
        );
      }
      
      return true;
    });
    
    log('Active rules:', activeRules.length, activeRules);

    // Apply rules sequentially
    let processedText = text;
    activeRules.forEach(rule => {
      const before = processedText;
      if (rule.isRegex) {
        try {
          const regex = new RegExp(rule.findPattern, 'g');
          processedText = processedText.replace(regex, rule.replacePattern);
        } catch (e) {
          log('Invalid regex pattern', rule.findPattern, e);
        }
      } else {
        processedText = processedText.replaceAll(rule.findPattern, rule.replacePattern);
      }
      log(`Rule "${rule.name}" - Before: "${before}" → After: "${processedText}"`);
    });

    // If text changed, set new value in clipboard
    if (processedText !== text) {
      log('Text refined, setting clipboard:', processedText);
      event.preventDefault();
      event.clipboardData.setData('text/plain', processedText);
      
      // Show toast notification (if enabled)
      if (showToastSetting) {
        showToast('ClipRefine: Text refined successfully');
      }
    }
  } catch (error) {
    console.error('ClipRefine error:', error);
  }
});

// 토스트 알림 함수
function showToast(message) {
  // 이미 토스트가 있으면 제거
  const existingToast = document.getElementById('cliprefine-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'cliprefine-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20%;
    left: 50%;
    transform: translateX(-50%);
    background: #6B40C8;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: cliprefine-fade-in 0.3s ease-in;
  `;

  // 애니메이션 스타일 추가
  if (!document.getElementById('cliprefine-styles')) {
    const style = document.createElement('style');
    style.id = 'cliprefine-styles';
    style.textContent = `
      @keyframes cliprefine-fade-in {
        from { opacity: 0; transform: translateX(-50%) translateY(10px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes cliprefine-fade-out {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(10px); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // 2초 후 제거
  setTimeout(() => {
    toast.style.animation = 'cliprefine-fade-out 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
