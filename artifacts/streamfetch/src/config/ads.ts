// ============================================================
//  GOOGLE ADSENSE CONFIGURATION
//  Paste your details from your AdSense account here.
//  AdSense dashboard → Ads → By ad unit
// ============================================================

export const ADS_CONFIG = {
  // Your publisher ID — looks like: ca-pub-1234567890123456
  // Found in AdSense → Account → Account information
  publisherId: "",

  // Ad slot IDs for each placement on the page.
  // Create ad units in AdSense → Ads → By ad unit → New ad unit.
  // Copy the numeric slot ID (e.g. "1234567890") for each one.
  slots: {
    // Top banner shown below the hero URL input
    topBanner: "",

    // Banner shown between the video info and the download list
    resultsBanner: "",
  },
};

// ============================================================
//  HOW TO ACTIVATE
//  1. Fill in publisherId above with your ca-pub-... ID
//  2. Fill in each slot ID from your AdSense ad units
//  3. Save — ads will automatically replace the placeholders
// ============================================================
