// Content script - Intercept clipboard events
console.log('ClipRefine: Content script loaded on', window.location.href);

let isActive = true;
let showToastSetting = true;
let rules = [];
let isLoaded = false;

// 초기 설정 로드
chrome.storage.sync.get(['settings', 'rules'], (data) => {
  if (data.settings) {
    isActive = data.settings.isGlobalActive !== false;
    showToastSetting = data.settings.showToast !== false;
  }
  if (data.rules) {
    rules = data.rules;
    console.log('ClipRefine: Loaded rules:', rules);
  } else {
    console.log('ClipRefine: No rules found in storage');
  }
  isLoaded = true;
});

// 설정 변경 감지
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.settings) {
      isActive = changes.settings.newValue.isGlobalActive !== false;
      showToastSetting = changes.settings.newValue.showToast !== false;
    }
    if (changes.rules) {
      rules = changes.rules.newValue || [];
    }
  }
});

// 복사 이벤트 리스너
document.addEventListener('copy', (event) => {
  if (!isActive) {
    console.log('ClipRefine: Inactive');
    return;
  }

  try {
    // 현재 선택된 텍스트 가져오기
    const selection = window.getSelection();
    let text = selection.toString();

    if (!text) return;
    console.log('ClipRefine: Original text:', text);

    // 현재 도메인
    const currentDomain = window.location.hostname;

    // Filter and apply active rules
    const activeRules = rules.filter(rule => {
      if (!rule.isActive) return false;
      
      // 도메인 필터링
      if (rule.targetDomains && rule.targetDomains.length > 0) {
        return rule.targetDomains.some(domain => 
          currentDomain.includes(domain)
        );
      }
      
      return true;
    });
    
    console.log('ClipRefine: Active rules:', activeRules.length, activeRules);

    // Apply rules sequentially
    let processedText = text;
    activeRules.forEach(rule => {
      const before = processedText;
      if (rule.isRegex) {
        try {
          const regex = new RegExp(rule.findPattern, 'g');
          processedText = processedText.replace(regex, rule.replacePattern);
        } catch (e) {
          console.error('ClipRefine: Invalid regex pattern', rule.findPattern, e);
        }
      } else {
        processedText = processedText.replaceAll(rule.findPattern, rule.replacePattern);
      }
      console.log(`ClipRefine: Rule "${rule.name}" - Before: "${before}" → After: "${processedText}"`);
    });

    // 텍스트가 변경되었으면 클립보드에 새로운 값 설정
    if (processedText !== text) {
      console.log('ClipRefine: Text changed, setting clipboard:', processedText);
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
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
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
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes cliprefine-fade-out {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
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
