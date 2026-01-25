// Background service worker
// 초기 설치 시 기본 설정 및 규칙 생성
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // 기본 설정
    const defaultSettings = {
      isGlobalActive: true,
      showToast: true
    };

    // 기본 규칙 (MVP 프리셋)
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
        name: 'Trim Whitespace',
        description: 'Remove leading and trailing whitespace',
        findPattern: '^\\s+|\\s+$',
        replacePattern: '',
        isRegex: true,
        isActive: false,
        targetDomains: []
      },
      {
        id: 'rule_builtin_003',
        name: 'Clean URL Parameters',
        description: 'Remove query parameters from URLs',
        findPattern: '\\?.*$',
        replacePattern: '',
        isRegex: true,
        isActive: false,
        targetDomains: []
      }
    ];

    // 스토리지에 저장
    await chrome.storage.sync.set({
      settings: defaultSettings,
      rules: defaultRules
    });

    console.log('ClipRefine: Default settings and rules initialized');
  }
});

// 메시지 리스너 (필요한 경우 확장)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getRules') {
    chrome.storage.sync.get(['rules'], (data) => {
      sendResponse({ rules: data.rules || [] });
    });
    return true; // 비동기 응답
  }

  if (request.action === 'saveRules') {
    chrome.storage.sync.set({ rules: request.rules }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// 아이콘 상태 업데이트 (활성/비활성)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.settings) {
    const isActive = changes.settings.newValue?.isGlobalActive;
    updateIcon(isActive);
  }
});

// 아이콘 업데이트 함수
function updateIcon(isActive) {
  // 실제 아이콘 파일이 있을 때 활성화
  // chrome.action.setIcon({
  //   path: {
  //     16: isActive ? 'icons/icon16.png' : 'icons/icon16-disabled.png',
  //     48: isActive ? 'icons/icon48.png' : 'icons/icon48-disabled.png',
  //     128: isActive ? 'icons/icon128.png' : 'icons/icon128-disabled.png'
  //   }
  // });
}

// 초기 아이콘 설정
chrome.storage.sync.get(['settings'], (data) => {
  const isActive = data.settings?.isGlobalActive !== false;
  updateIcon(isActive);
});
