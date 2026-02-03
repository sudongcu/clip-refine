// Options page script
let rules = [];
let editingRuleId = null;
let licenseStatus = { isPro: false, isActive: false };

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
  setupNavigation();
});

// Setup navigation between tabs
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.dataset.tab;
      switchTab(tabName);
    });
  });
}

// Switch between tabs
function switchTab(tabName) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  if (tabName === 'dashboard') {
    document.getElementById('dashboardTab').style.display = 'block';
  } else if (tabName === 'license') {
    document.getElementById('licenseTab').style.display = 'block';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Toast settings
  document.getElementById('showToast').addEventListener('change', saveSettings);
  document.getElementById('showConsoleLog').addEventListener('change', saveSettings);

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
    if (!licenseStatus.isPro) {
      switchTab('license');
      showNotification('⭐ Import feature requires PRO version');
      return;
    }
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', importRules);

  // License actions
  document.getElementById('upgradeBtn').addEventListener('click', handleUpgrade);
  document.getElementById('activateLicenseBtn').addEventListener('click', handleActivateLicense);
}

// Load settings
async function loadSettings() {
  const data = await chrome.storage.sync.get(['settings', 'rules', 'license']);
  
  // License status
  licenseStatus = data.license || { isPro: false, isActive: false };
  updateLicenseUI();
  
  // Toast settings
  if (data.settings) {
    document.getElementById('showToast').checked = data.settings.showToast !== false;
    document.getElementById('showConsoleLog').checked = data.settings.showConsoleLog === true;
  }

  // Rules list
  rules = data.rules || [];
  displayRules();
}

// Save settings
async function saveSettings() {
  const showToast = document.getElementById('showToast').checked;
  const showConsoleLog = document.getElementById('showConsoleLog').checked;
  
  const data = await chrome.storage.sync.get(['settings']);
  const settings = data.settings || {};
  settings.showToast = showToast;
  settings.showConsoleLog = showConsoleLog;
  
  await chrome.storage.sync.set({ settings });
  showNotification('Settings saved');
}

// Display rules
function displayRules() {
  const container = document.getElementById('rulesList');
  
  if (rules.length === 0) {
    container.innerHTML = '<p class="text-center py-8 text-gray-400">No rules yet. Add a new rule to get started.</p>';
    return;
  }
  
  // Update Add Rule button to show limit for FREE users
  updateAddRuleButton();

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
                <code class="bg-background-light dark:bg-[#2d2344] px-2 py-1 rounded text-[#6B40C8] dark:text-[#a389d4] text-xs font-mono border border-primary/10">${escapeHtml(rule.findPattern)}</code>
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

// Open modal
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

// Close modal
function closeModal() {
  document.getElementById('ruleModal').style.display = 'none';
  editingRuleId = null;
}

// Save rule
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
  
  // Check rule limit for FREE users
  if (!editingRuleId && !licenseStatus.isPro) {
    const MAX_RULES_FREE = 5;
    if (rules.length >= MAX_RULES_FREE) {
      closeModal();
      switchTab('license');
      showNotification(`⭐ FREE version allows maximum ${MAX_RULES_FREE} rules. Upgrade to PRO for unlimited rules.`);
      return;
    }
  }

  // Validate regex
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
  
  // Check domain limit for FREE users
  if (!licenseStatus.isPro) {
    const MAX_DOMAINS_FREE = 3;
    if (targetDomains.length > MAX_DOMAINS_FREE) {
      alert(`FREE version allows maximum ${MAX_DOMAINS_FREE} domains per rule. Upgrade to PRO for unlimited domains.`);
      return;
    }
  }

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
    // Edit
    const index = rules.findIndex(r => r.id === editingRuleId);
    if (index !== -1) {
      rules[index] = rule;
    }
  } else {
    // Add
    rules.push(rule);
  }

  await chrome.storage.sync.set({ rules });
  closeModal();
  displayRules();
  showNotification('Rule saved successfully');
}

// Toggle rule
async function toggleRule(ruleId) {
  const rule = rules.find(r => r.id === ruleId);
  if (rule) {
    rule.isActive = !rule.isActive;
    await chrome.storage.sync.set({ rules });
    displayRules();
    showNotification(`Rule ${rule.isActive ? 'enabled' : 'disabled'}`);
  }
}

// Edit rule
function editRule(ruleId) {
  const rule = rules.find(r => r.id === ruleId);
  if (rule) {
    openModal(rule);
  }
}

// Delete rule
async function deleteRule(ruleId) {
  if (!confirm('Are you sure you want to delete this rule?')) {
    return;
  }
  
  rules = rules.filter(r => r.id !== ruleId);
  await chrome.storage.sync.set({ rules });
  displayRules();
  showNotification('Rule deleted');
}

// Export rules
function exportRules() {
  if (!licenseStatus.isPro) {
    switchTab('license');
    showNotification('⭐ Export feature requires PRO version');
    return;
  }
  
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

// Import rules
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

      // Merge with existing rules (prevent ID duplicates)
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
  event.target.value = ''; // Reset file input
}

// Show notification
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

// Update license UI
function updateLicenseUI() {
  const navBadge = document.querySelector('[data-tab="license"] .ml-auto');
  const headerBadge = document.querySelector('#licenseTab header span');
  
  if (licenseStatus.isPro && licenseStatus.isActive) {
    // PRO version
    if (navBadge) {
      navBadge.textContent = 'PRO';
      navBadge.className = 'ml-auto px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-primary to-purple-600 text-white rounded';
    }
    if (headerBadge) {
      headerBadge.textContent = 'PRO';
      headerBadge.className = 'px-5 py-2 text-lg font-bold bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl';
    }
    
    // Show deactivate button instead of upgrade card
    const upgradeCard = document.querySelector('#licenseTab section:first-of-type');
    if (upgradeCard) {
      upgradeCard.innerHTML = `
        <div class="bg-white dark:bg-[#1c142e] rounded-2xl border border-[#d7cfe7] dark:border-[#332a4a] overflow-hidden shadow-sm p-8">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white mb-4">
              <span class="material-symbols-outlined text-3xl">verified</span>
            </div>
            <h3 class="text-2xl font-black text-[#120d1b] dark:text-white mb-2">PRO License Active</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">You have full access to all PRO features!</p>
            <div class="bg-gray-50 dark:bg-[#251b3d] rounded-lg p-4 mb-6">
              <p class="text-sm text-gray-600 dark:text-gray-400">License Key: <span class="font-mono text-primary">${licenseStatus.licenseKey?.substring(0, 8)}...${licenseStatus.licenseKey?.slice(-8)}</span></p>
              <p class="text-xs text-gray-500 mt-2">Activated: ${new Date(licenseStatus.activatedAt).toLocaleDateString()}</p>
            </div>
            <button id="deactivateLicenseBtn" class="text-red-500 hover:text-red-600 text-sm font-medium underline">
              Deactivate License
            </button>
          </div>
        </div>
      `;
      document.getElementById('deactivateLicenseBtn').addEventListener('click', handleDeactivateLicense);
    }
  } else {
    // FREE version
    if (navBadge) {
      navBadge.textContent = 'FREE';
      navBadge.className = 'ml-auto px-2 py-0.5 text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded';
    }
    if (headerBadge) {
      headerBadge.textContent = 'FREE';
      headerBadge.className = 'px-5 py-2 text-lg font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl';
    }
  }
  
  // Update import/export buttons
  updateImportExportButtons();
}

// Update import/export buttons based on license
function updateImportExportButtons() {
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  
  if (!licenseStatus.isPro) {
    // Disable for FREE users
    exportBtn.classList.add('opacity-50', 'cursor-not-allowed', 'relative');
    importBtn.classList.add('opacity-50', 'cursor-not-allowed', 'relative');
    
    // Add PRO badge
    if (!exportBtn.querySelector('.pro-badge')) {
      const badge = document.createElement('span');
      badge.className = 'pro-badge absolute -top-2 right-8 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold';
      badge.textContent = 'PRO';
      exportBtn.style.position = 'relative';
      exportBtn.appendChild(badge);
    }
    
    if (!importBtn.querySelector('.pro-badge')) {
      const badge = document.createElement('span');
      badge.className = 'pro-badge absolute -top-2 right-8 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold';
      badge.textContent = 'PRO';
      importBtn.style.position = 'relative';
      importBtn.appendChild(badge);
    }
  } else {
    exportBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    importBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    const exportBadge = exportBtn.querySelector('.pro-badge');
    const importBadge = importBtn.querySelector('.pro-badge');
    if (exportBadge) exportBadge.remove();
    if (importBadge) importBadge.remove();
  }
}

// Update Add Rule button to show limit
function updateAddRuleButton() {
  const addBtn = document.getElementById('addRuleBtn');
  const existingCounter = addBtn.querySelector('.rule-counter');
  
  if (!licenseStatus.isPro) {
    const MAX_RULES_FREE = 5;
    const remaining = MAX_RULES_FREE - rules.length;
    
    if (!existingCounter) {
      const counter = document.createElement('span');
      counter.className = 'rule-counter ml-1 text-xs opacity-80';
      counter.textContent = `(${rules.length}/${MAX_RULES_FREE})`;
      addBtn.querySelector('span:last-child').appendChild(counter);
    } else {
      existingCounter.textContent = `(${rules.length}/${MAX_RULES_FREE})`;
    }
    
    if (remaining <= 0) {
      addBtn.classList.add('opacity-60', 'cursor-not-allowed');
    } else {
      addBtn.classList.remove('opacity-60', 'cursor-not-allowed');
    }
  } else {
    if (existingCounter) {
      existingCounter.remove();
    }
    addBtn.classList.remove('opacity-60', 'cursor-not-allowed');
  }
}

// Show upgrade modal
function showUpgradeModal(feature) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 flex items-center justify-center p-4 z-[10001]';
  modal.id = 'upgradeModal';
  modal.style.cssText = 'background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);';
  
  modal.innerHTML = `
    <div class="bg-white dark:bg-[#1f1631] w-full max-w-[560px] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-white/10">
      <!-- Modal Header -->
      <div class="px-8 py-10 text-center bg-[#111827]">
        <h2 class="text-white text-3xl font-black mb-3">Upgrade to Pro Lifetime</h2>
        <p class="text-gray-300 text-base mb-2">Unlimited rules, no domain limits, smart macros, and more.</p>
        <p class="text-gray-400 text-sm">One-time payment. No monthly fees.</p>
      </div>

      <!-- Modal Body -->
      <div class="p-8 bg-white dark:bg-[#1c142e]">
        <div class="text-center mb-6">
          <p class="text-4xl font-black text-[#120d1b] dark:text-white mb-2">$9.99</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Lifetime License</p>
        </div>

        <div class="space-y-2.5 mb-8">
          <div class="flex items-center gap-3 text-sm">
            <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
            <span class="text-[#120d1b] dark:text-white">Unlimited rules & domains</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
            <span class="text-[#120d1b] dark:text-white">Import/Export rules (backup & share)</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
            <span class="text-[#120d1b] dark:text-white">Individual rule toggles in popup</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
            <span class="text-[#120d1b] dark:text-white">Multi-profile system (coming soon)</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button id="maybeLaterBtn" class="flex-1 px-6 py-3 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/20 transition-all">
            Maybe Later
          </button>
          <button id="upgradeNowBtn" class="flex-1 px-6 py-3 rounded-lg text-sm font-semibold text-white hover:opacity-90 shadow-lg transition-all active:scale-[0.98]" style="background: linear-gradient(to right, #a855f7, #8b5cf6);">
            Upgrade Now →
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners
  document.getElementById('maybeLaterBtn').addEventListener('click', () => modal.remove());
  document.getElementById('upgradeNowBtn').addEventListener('click', () => {
    modal.remove();
    document.querySelector('[data-tab="license"]').click();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// HTML 이스케이프
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle upgrade button click
function handleUpgrade() {
  // Open Lemon Squeezy payment page (no API key needed for checkout)
  // Only requires: https://{STORE_ID}.lemonsqueezy.com/checkout/buy/{PRODUCT_ID}
  const paymentUrl = 'https://cliprefine.lemonsqueezy.com/checkout/buy/YOUR_PRODUCT_ID';
  window.open(paymentUrl, '_blank');
  showNotification('Opening payment page...');
}

// Handle license activation
async function handleActivateLicense() {
  const licenseKey = document.getElementById('licenseKeyInput').value.trim();
  
  if (!licenseKey) {
    showNotification('Please enter a license key');
    return;
  }

  // Show loading state
  const activateBtn = document.getElementById('activateLicenseBtn');
  const originalHTML = activateBtn.innerHTML;
  activateBtn.disabled = true;
  activateBtn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span><span>Activating...</span>';

  try {
    // NOTE: /licenses/validate is a public API and doesn't require API key
    // Safe to call directly from Chrome extension
    if (licenseKey.length < 20) {
      throw new Error('Invalid license key format');
    }

    // TODO: Replace simulation with actual API call using validateLicenseKey() from utils/license.js
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demonstration, accept any key with correct format
    // In production, use validateLicenseKey from license.js with your API keys
    const newLicense = {
      isPro: true,
      licenseKey: licenseKey,
      activatedAt: new Date().toISOString(),
      expiresAt: null, // Lifetime license
      isActive: true
    };
    
    await chrome.storage.sync.set({ license: newLicense });
    licenseStatus = newLicense;
    
    showNotification('✨ PRO License activated successfully!');
    updateLicenseUI();
    document.getElementById('licenseKeyInput').value = '';
    
  } catch (error) {
    showNotification('❌ License activation failed: ' + error.message);
    console.error('License activation error:', error);
  } finally {
    activateBtn.disabled = false;
    activateBtn.innerHTML = originalHTML;
  }
}

// Handle license deactivation
async function handleDeactivateLicense() {
  if (!confirm('Are you sure you want to deactivate your PRO license? You will lose access to PRO features.')) {
    return;
  }
  
  const defaultLicense = {
    isPro: false,
    licenseKey: null,
    activatedAt: null,
    expiresAt: null,
    isActive: false
  };
  
  await chrome.storage.sync.set({ license: defaultLicense });
  licenseStatus = defaultLicense;
  
  showNotification('License deactivated');
  updateLicenseUI();
  
  // Reload to show upgrade card again
  setTimeout(() => {
    loadSettings();
  }, 500);
}
