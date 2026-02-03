// Popup script
document.addEventListener('DOMContentLoaded', async () => {
  const globalToggle = document.getElementById('globalToggle');
  const toggleLabel = document.getElementById('toggleLabel');
  const toggleKnob = document.getElementById('toggleKnob');
  const statusText = document.getElementById('statusText');
  const rulesList = document.getElementById('rulesList');
  const openOptionsBtn = document.getElementById('openOptions');

  let licenseStatus = { isPro: false, isActive: false };

  // 초기 설정 로드
  loadSettings();

  // 글로벌 토글 이벤트
  globalToggle.addEventListener('change', async (e) => {
    const isActive = e.target.checked;
    await chrome.storage.sync.set({
      settings: {
        isGlobalActive: isActive,
        showToast: true
      }
    });
    updateStatusText(isActive);
    updateToggleUI(isActive);
  });

  // 설정 페이지 열기
  openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // 설정 로드 함수
  async function loadSettings() {
    const data = await chrome.storage.sync.get(['settings', 'rules', 'license']);
    
    // License status
    licenseStatus = data.license || { isPro: false, isActive: false };
    
    // 글로벌 활성화 상태
    const isActive = data.settings?.isGlobalActive !== false;
    globalToggle.checked = isActive;
    updateStatusText(isActive);
    updateToggleUI(isActive);

    // 규칙 목록
    const rules = data.rules || [];
    displayRules(rules);
  }

  // 상태 텍스트 업데이트
  function updateStatusText(isActive) {
    statusText.textContent = isActive ? 'Service Active' : 'Service Inactive';
  }

  // 토글 UI 업데이트
  function updateToggleUI(isActive) {
    if (isActive) {
      toggleLabel.classList.add('justify-end', 'bg-primary');
      toggleLabel.classList.remove('bg-[#ebe7f3]');
    } else {
      toggleLabel.classList.remove('justify-end', 'bg-primary');
      toggleLabel.classList.add('bg-[#ebe7f3]');
    }
  }

  // 규칙 목록 표시
  function displayRules(rules) {
    if (rules.length === 0) {
      rulesList.innerHTML = '<p class="text-center py-8 text-gray-400 text-sm">No rules found. Add one in settings.</p>';
      return;
    }

    const activeRules = rules.filter(r => r.isActive);
    
    if (activeRules.length === 0) {
      rulesList.innerHTML = '<p class="text-center py-8 text-gray-400 text-sm">No active rules.</p>';
      return;
    }

    // PRO users get individual toggles, FREE users see list only
    if (licenseStatus.isPro && licenseStatus.isActive) {
      // PRO: Individual toggle for each rule
      rulesList.innerHTML = activeRules.map(rule => `
        <div class="flex items-center gap-4 bg-background-light dark:bg-[#2d243d] px-4 min-h-[64px] py-3 justify-between rounded-xl border border-transparent hover:border-[#d7cfe7] dark:hover:border-[#43365a] transition-all">
          <div class="flex flex-col justify-center flex-1">
            <p class="text-[#120d1b] dark:text-white text-[15px] font-bold leading-none mb-1">${escapeHtml(rule.name)}</p>
            <p class="text-[#664c9a] dark:text-[#a68fd8] text-xs font-normal leading-tight">${escapeHtml(rule.description || 'No description')}</p>
          </div>
          <div class="relative inline-block w-11 h-6 flex-shrink-0">
            <input ${rule.isActive ? 'checked' : ''} 
              class="rule-toggle-checkbox absolute block w-5 h-5 top-0.5 rounded-full bg-white border border-gray-300 appearance-none cursor-pointer focus:ring-0 focus:ring-offset-0 transition-all duration-300 ease-in-out" 
              id="rule-${rule.id}" 
              type="checkbox" 
              data-rule-id="${rule.id}">
            <label class="rule-toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 bg-gray-300" for="rule-${rule.id}"></label>
          </div>
        </div>
      `).join('');
      
      // Add toggle event listeners for PRO users
      rulesList.querySelectorAll('.rule-toggle-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', async (e) => {
          const ruleId = e.target.dataset.ruleId;
          await toggleIndividualRule(ruleId, e.target.checked);
        });
      });
    } else {
      // FREE: Display only, no individual toggles
      rulesList.innerHTML = activeRules.map(rule => `
        <div class="flex items-center gap-4 bg-background-light dark:bg-[#2d243d] px-4 min-h-[64px] py-3 justify-between rounded-xl border border-transparent hover:border-[#d7cfe7] dark:hover:border-[#43365a] transition-all">
          <div class="flex flex-col justify-center">
            <p class="text-[#120d1b] dark:text-white text-[15px] font-bold leading-none mb-1">${escapeHtml(rule.name)}</p>
            <p class="text-[#664c9a] dark:text-[#a68fd8] text-xs font-normal leading-tight">${escapeHtml(rule.description || 'No description')}</p>
          </div>
        </div>
      `).join('');
    }
  }
  
  // Toggle individual rule (PRO only)
  async function toggleIndividualRule(ruleId, isActive) {
    const data = await chrome.storage.sync.get(['rules']);
    const rules = data.rules || [];
    
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      rule.isActive = isActive;
      await chrome.storage.sync.set({ rules });
      
      // Update label styling
      const label = document.querySelector(`label[for="rule-${ruleId}"]`);
      if (label) {
        if (isActive) {
          label.classList.add('bg-primary');
          label.classList.remove('bg-gray-300');
        } else {
          label.classList.remove('bg-primary');
          label.classList.add('bg-gray-300');
        }
      }
    }
  }

  // XSS 방지용 HTML 이스케이프
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 스토리지 변경 감지
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      loadSettings();
    }
  });
});
