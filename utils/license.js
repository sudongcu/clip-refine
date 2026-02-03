// License management utility for FREE/PRO version control
// [BETA] 현재 BETA 버전에서는 PRO 기능이 비활성화되어 있습니다.
// PRO 버전 출시 시 이 파일의 함수들이 활성화됩니다.
const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1';

// Feature limits for FREE version
const LIMITS = {
  FREE: {
    MAX_RULES: 5,
    MAX_DOMAINS_PER_RULE: 3,
    IMPORT_EXPORT: false,
    INDIVIDUAL_TOGGLE: false,
    MULTI_PROFILE: false
  },
  PRO: {
    MAX_RULES: Infinity,
    MAX_DOMAINS_PER_RULE: Infinity,
    IMPORT_EXPORT: true,
    INDIVIDUAL_TOGGLE: true,
    MULTI_PROFILE: true
  }
};

/**
 * Get current license status from storage
 * @returns {Promise<Object>} License status object
 */
async function getLicenseStatus() {
  const data = await chrome.storage.sync.get(['license']);
  return data.license || {
    isPro: false,
    licenseKey: null,
    activatedAt: null,
    expiresAt: null,
    isActive: false
  };
}

/**
 * Check if user has PRO version
 * @returns {Promise<boolean>}
 */
async function isPro() {
  const license = await getLicenseStatus();
  return license.isPro && license.isActive;
}

/**
 * Get feature limits based on user's license type
 * @returns {Promise<Object>} Limits object
 */
async function getFeatureLimits() {
  const pro = await isPro();
  return pro ? LIMITS.PRO : LIMITS.FREE;
}

/**
 * Check if a feature is available for the current user
 * @param {string} feature - Feature name
 * @returns {Promise<boolean>}
 */
async function hasFeature(feature) {
  const limits = await getFeatureLimits();
  const featureMap = {
    'import_export': limits.IMPORT_EXPORT,
    'individual_toggle': limits.INDIVIDUAL_TOGGLE,
    'multi_profile': limits.MULTI_PROFILE
  };
  return featureMap[feature] !== undefined ? featureMap[feature] : false;
}

/**
 * Validate license key with Lemon Squeezy API
 * NOTE: /licenses/validate is a public endpoint and doesn't require API key
 * Safe to call directly from client-side (Chrome extension)
 * 
 * @param {string} licenseKey - License key to validate
 * @returns {Promise<Object>} Validation result
 */
async function validateLicenseKey(licenseKey) {
  try {
    // Validate license key format first
    if (!licenseKey || licenseKey.length < 10) {
      return {
        valid: false,
        error: 'Invalid license key format'
      };
    }

    // Call Lemon Squeezy public API to validate (no API key required)
    const response = await fetch(`${LEMON_SQUEEZY_API_URL}/licenses/validate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        license_key: licenseKey,
        instance_name: 'cliprefine-extension'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        valid: false,
        error: errorData.message || 'License validation failed'
      };
    }

    const data = await response.json();
    
    // Check if license is valid and active
    if (data.valid && data.license_key) {
      return {
        valid: true,
        license: {
          key: licenseKey,
          status: data.license_key.status,
          expiresAt: data.license_key.expires_at,
          customerId: data.license_key.customer_id
        }
      };
    }

    return {
      valid: false,
      error: 'License key is not valid or has been disabled'
    };
  } catch (error) {
    console.error('License validation error:', error);
    return {
      valid: false,
      error: error.message || 'Failed to validate license key'
    };
  }
}

/**
 * Activate PRO license
 * @param {string} licenseKey - License key to activate
 * @returns {Promise<Object>} Activation result
 */
async function activateLicense(licenseKey) {
  const validation = await validateLicenseKey(licenseKey);
  
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }

  // Save license to storage
  const license = {
    isPro: true,
    licenseKey: validation.license.key,
    activatedAt: new Date().toISOString(),
    expiresAt: validation.license.expiresAt,
    isActive: validation.license.status === 'active',
    customerId: validation.license.customerId
  };

  await chrome.storage.sync.set({ license });

  return {
    success: true,
    license
  };
}

/**
 * Deactivate PRO license
 * @returns {Promise<void>}
 */
async function deactivateLicense() {
  const defaultLicense = {
    isPro: false,
    licenseKey: null,
    activatedAt: null,
    expiresAt: null,
    isActive: false
  };
  
  await chrome.storage.sync.set({ license: defaultLicense });
}

/**
 * Check if user can add more rules
 * @param {number} currentRuleCount - Current number of rules
 * @returns {Promise<Object>} Check result
 */
async function canAddRule(currentRuleCount) {
  const limits = await getFeatureLimits();
  const canAdd = currentRuleCount < limits.MAX_RULES;
  
  return {
    allowed: canAdd,
    limit: limits.MAX_RULES,
    current: currentRuleCount,
    remaining: limits.MAX_RULES - currentRuleCount
  };
}

/**
 * Check if user can add more domains to a rule
 * @param {number} currentDomainCount - Current number of domains
 * @returns {Promise<Object>} Check result
 */
async function canAddDomain(currentDomainCount) {
  const limits = await getFeatureLimits();
  const canAdd = currentDomainCount < limits.MAX_DOMAINS_PER_RULE;
  
  return {
    allowed: canAdd,
    limit: limits.MAX_DOMAINS_PER_RULE,
    current: currentDomainCount,
    remaining: limits.MAX_DOMAINS_PER_RULE - currentDomainCount
  };
}

/**
 * Show upgrade modal for blocked features
 * @param {string} featureName - Name of the blocked feature
 * @returns {void}
 */
function showUpgradeModal(featureName) {
  // This will be implemented in the UI layer
  console.log(`Feature "${featureName}" requires PRO version`);
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getLicenseStatus,
    isPro,
    getFeatureLimits,
    hasFeature,
    validateLicenseKey,
    activateLicense,
    deactivateLicense,
    canAddRule,
    canAddDomain,
    showUpgradeModal,
    LIMITS
  };
}
