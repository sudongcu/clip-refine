// Options page script
let rules = [];
let editingRuleId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
  // 토스트 설정
  document.getElementById('showToast').addEventListener('change', saveSettings);

  // 규칙 추가 버튼
  document.getElementById('addRuleBtn').addEventListener('click', () => {
    openModal();
  });

  // 모달 제어
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('saveRuleBtn').addEventListener('click', saveRule);

  // 모달 외부 클릭 시 닫기
  document.getElementById('ruleModal').addEventListener('click', (e) => {
    if (e.target.id === 'ruleModal') {
      closeModal();
    }
  });

  // Import/Export
  document.getElementById('exportBtn').addEventListener('click', exportRules);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', importRules);
}

// 설정 로드
async function loadSettings() {
  const data = await chrome.storage.sync.get(['settings', 'rules']);
  
  // 토스트 설정
  if (data.settings) {
    document.getElementById('showToast').checked = data.settings.showToast !== false;
  }

  // 규칙 목록
  rules = data.rules || [];
  displayRules();
}

// 설정 저장
async function saveSettings() {
  const showToast = document.getElementById('showToast').checked;
  
  const data = await chrome.storage.sync.get(['settings']);
  const settings = data.settings || {};
  settings.showToast = showToast;
  
  await chrome.storage.sync.set({ settings });
  showNotification('Settings saved');
}

// 규칙 표시
function displayRules() {
  const container = document.getElementById('rulesList');
  
  if (rules.length === 0) {
    container.innerHTML = '<p class="text-center py-8 text-gray-400">No rules yet. Add a new rule to get started.</p>';
    return;
  }

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 dark:bg-[#251b3d] border-b border-[#d7cfe7] dark:border-[#332a4a]">
            <th class="px-6 py-4 text-[#120d1b] dark:text-gray-200 text-xs font-bold uppercase tracking-wider">Rule Name</th>
            <th class="px-6 py-4 text-[#120d1b] dark:text-gray-200 text-xs font-bold uppercase tracking-wider">Pattern</th>
            <th class="px-6 py-4 text-[#120d1b] dark:text-gray-200 text-xs font-bold uppercase tracking-wider">Replacement</th>
            <th class="px-6 py-4 text-[#120d1b] dark:text-gray-200 text-xs font-bold uppercase tracking-wider text-center">Regex</th>
            <th class="px-6 py-4 text-[#120d1b] dark:text-gray-200 text-xs font-bold uppercase tracking-wider text-center">Active</th>
            <th class="px-6 py-4 text-[#120d1b] dark:text-gray-200 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#d7cfe7] dark:divide-[#332a4a]">
          ${rules.map(rule => `
            <tr class="hover:bg-gray-50/50 dark:hover:bg-[#251b3d]/50 transition-colors ${!rule.isActive ? 'opacity-60 grayscale-[0.5]' : ''}">
              <td class="px-6 py-5">
                <div class="flex flex-col">
                  <span class="text-[#120d1b] dark:text-white font-bold text-sm">${escapeHtml(rule.name)}</span>
                  <span class="text-xs text-gray-400">${escapeHtml(rule.description || 'No description')}</span>
                </div>
              </td>
              <td class="px-6 py-5">
                <code class="bg-background-light dark:bg-[#2d2344] px-2 py-1 rounded text-[#5A2EB0] dark:text-[#a389d4] text-xs font-mono border border-primary/10">${escapeHtml(rule.findPattern)}</code>
              </td>
              <td class="px-6 py-5">
                ${rule.replacePattern ? `<code class="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-green-600 dark:text-green-400 text-xs font-mono border border-green-200 dark:border-green-800">${escapeHtml(rule.replacePattern)}</code>` : '<span class="text-gray-400 dark:text-gray-600 text-sm italic">—</span>'}
              </td>
              <td class="px-6 py-5 text-center">
                ${rule.isRegex ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">REGEX</span>' : '<span class="text-gray-300 dark:text-gray-700 material-symbols-outlined text-sm">close</span>'}
              </td>
              <td class="px-6 py-5">
                <div class="flex justify-center items-center">
                  <div class="relative inline-block w-11 h-6">
                    <input ${rule.isActive ? 'checked' : ''} class="small-toggle-checkbox absolute block w-5 h-5 top-0.5 rounded-full bg-white border border-gray-300 appearance-none cursor-pointer focus:ring-0 focus:ring-offset-0 transition-all duration-300 ease-in-out" id="rule-${rule.id}-status" type="checkbox" data-rule-id="${rule.id}">
                    <label class="small-toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300" for="rule-${rule.id}-status"></label>
                  </div>
                </div>
              </td>
              <td class="px-6 py-5 text-right">
                <div class="flex justify-end gap-1">
                  <button class="btn-edit p-2 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-all" title="Edit" data-rule-id="${rule.id}">
                    <span class="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button class="btn-delete p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 transition-all" title="Delete" data-rule-id="${rule.id}">
                    <span class="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // 이벤트 리스너 추가 (이벤트 위임 방식)
  container.querySelectorAll('.small-toggle-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => toggleRule(checkbox.dataset.ruleId));
  });
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => editRule(btn.dataset.ruleId));
  });
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteRule(btn.dataset.ruleId));
  });
}

// 모달 열기
function openModal(rule = null) {
  editingRuleId = rule ? rule.id : null;
  
  const modal = document.getElementById('ruleModal');
  const title = document.getElementById('modalTitle');
  
  if (rule) {
    title.textContent = 'Edit Rule';
    document.getElementById('ruleName').value = rule.name;
    document.getElementById('ruleDescription').value = rule.description || '';
    document.getElementById('findPattern').value = rule.findPattern;
    document.getElementById('replacePattern').value = rule.replacePattern;
    document.getElementById('isRegex').checked = rule.isRegex;
    document.getElementById('targetDomains').value = (rule.targetDomains || []).join(', ');
    document.getElementById('isActive').checked = rule.isActive;
  } else {
    title.textContent = 'Add New Rule';
    document.getElementById('ruleName').value = '';
    document.getElementById('ruleDescription').value = '';
    document.getElementById('findPattern').value = '';
    document.getElementById('replacePattern').value = '';
    document.getElementById('isRegex').checked = false;
    document.getElementById('targetDomains').value = '';
    document.getElementById('isActive').checked = true;
  }
  
  modal.style.display = 'flex';
}

// 모달 닫기
function closeModal() {
  document.getElementById('ruleModal').style.display = 'none';
  editingRuleId = null;
}

// 규칙 저장
async function saveRule() {
  const name = document.getElementById('ruleName').value.trim();
  const description = document.getElementById('ruleDescription').value.trim();
  const findPattern = document.getElementById('findPattern').value;
  const replacePattern = document.getElementById('replacePattern').value;
  const isRegex = document.getElementById('isRegex').checked;
  const targetDomainsStr = document.getElementById('targetDomains').value.trim();
  const isActive = document.getElementById('isActive').checked;

  if (!name || !findPattern) {
    alert('Rule name and pattern are required.');
    return;
  }

  // 정규식 검증
  if (isRegex) {
    try {
      new RegExp(findPattern);
    } catch (e) {
      alert('Invalid regular expression: ' + e.message);
      return;
    }
  }

  const targetDomains = targetDomainsStr 
    ? targetDomainsStr.split(',').map(d => d.trim()).filter(d => d)
    : [];

  const rule = {
    id: editingRuleId || `rule_user_${Date.now()}`,
    name,
    description,
    findPattern,
    replacePattern,
    isRegex,
    isActive,
    targetDomains
  };

  if (editingRuleId) {
    // 편집
    const index = rules.findIndex(r => r.id === editingRuleId);
    if (index !== -1) {
      rules[index] = rule;
    }
  } else {
    // 추가
    rules.push(rule);
  }

  await chrome.storage.sync.set({ rules });
  closeModal();
  displayRules();
  showNotification('Rule saved successfully');
}

// 규칙 토글
async function toggleRule(ruleId) {
  const rule = rules.find(r => r.id === ruleId);
  if (rule) {
    rule.isActive = !rule.isActive;
    await chrome.storage.sync.set({ rules });
    displayRules();
    showNotification(`Rule ${rule.isActive ? 'enabled' : 'disabled'}`);
  }
}

// 규칙 편집
function editRule(ruleId) {
  const rule = rules.find(r => r.id === ruleId);
  if (rule) {
    openModal(rule);
  }
}

// 규칙 삭제
async function deleteRule(ruleId) {
  if (!confirm('Are you sure you want to delete this rule?')) {
    return;
  }
  
  rules = rules.filter(r => r.id !== ruleId);
  await chrome.storage.sync.set({ rules });
  displayRules();
  showNotification('Rule deleted');
}

// 규칙 내보내기
function exportRules() {
  const dataStr = JSON.stringify(rules, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cliprefine-rules-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showNotification('Rules exported successfully');
}

// 규칙 가져오기
function importRules(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedRules = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedRules)) {
        alert('Invalid file format.');
        return;
      }

      // 기존 규칙과 병합 (ID 중복 방지)
      const existingIds = new Set(rules.map(r => r.id));
      const newRules = importedRules.filter(r => !existingIds.has(r.id));
      
      rules = [...rules, ...newRules];
      await chrome.storage.sync.set({ rules });
      displayRules();
      showNotification(`Imported ${newRules.length} rule(s)`);
    } catch (error) {
      alert('Error reading file: ' + error.message);
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // 파일 선택 초기화
}

// 알림 표시
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-5 right-5 bg-[#333] text-white px-5 py-3 rounded-lg shadow-lg z-[10000] transition-all duration-300';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(-10px)';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// HTML 이스케이프
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
