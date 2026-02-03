// Configuration for Lemon Squeezy Integration
// Copy this file to config.js and fill in your actual values

const CONFIG = {
  LEMON_SQUEEZY: {
    // Get these from your Lemon Squeezy dashboard
    STORE_ID: 'YOUR_STORE_ID',
    PRODUCT_ID: 'YOUR_PRODUCT_ID',
    
    // Payment page URL - only needs STORE_ID and PRODUCT_ID (no API key required)
    // Format: https://{STORE_ID}.lemonsqueezy.com/checkout/buy/{PRODUCT_ID}
    PAYMENT_URL: 'https://cliprefine.lemonsqueezy.com/checkout/buy/YOUR_PRODUCT_ID'
    
    // NOTE: License validation also doesn't require API key
    // /licenses/validate is a public endpoint - safe to use client-side
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
