/* ==========================================================
   SnowCow.com — Site configuration
   Edit this ONE file to switch on monetization and payments.
   ========================================================== */
window.SC_CONFIG = {
  siteName: "SnowCow",
  // Google AdSense — paste your publisher ID (e.g. "ca-pub-1234567890123456").
  // While empty, ad slots render as "Advertise here" house ads linking to /advertise.html.
  adsenseClient: "",
  adsenseSlots: { leaderboard: "", inArticle: "", sidebar: "", footer: "" },

  // Google Analytics 4 measurement ID (e.g. "G-XXXXXXX"). Loaded only after cookie consent.
  ga4: "",

  // Donation / payment links. Any link left empty falls back to the pledge form (which emails the owner).
  donate: {
    paypal: "",        // e.g. https://www.paypal.com/donate/?hosted_button_id=XXXX
    stripe: "",        // e.g. https://donate.stripe.com/XXXX
    buymeacoffee: "",  // e.g. https://www.buymeacoffee.com/snowcow
    kofi: "",          // e.g. https://ko-fi.com/snowcow
    patreon: ""        // e.g. https://www.patreon.com/snowcow
  },
  donationGoal: { label: "Season fund", goal: 5000, raised: 0 },

  // Owner interest link shown at the top of every page
  ownerContactUrl: "https://web.works/contact",

  // Social profiles (leave "" to hide)
  social: { youtube: "", instagram: "", tiktok: "", x: "", facebook: "", pinterest: "" },

  // Contest end date (ISO). Countdown on contests page uses this.
  contestEnds: "2027-03-31T23:59:59",

  // Form delivery. The destination inbox is stored encoded (never shown on the site).
  // Delivery service: FormSubmit (free, no backend). First submission triggers a one-time activation email.
  _k: [116,118,106,53,115,112,104,116,110,71,56,104,122,114,121,118,126,105,108,126],
  formEndpoint: "https://formsubmit.co/ajax/"
};
