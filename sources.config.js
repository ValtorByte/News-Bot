// ════════════════════════════════════════════════════════════
//  sources.config.js  —  فایل منابع خبری
//
//  راهنما:
//  از این فایل، منابع مورد نظرت رو کپی کن و
//  داخل آرایه SOURCES در worker.js جایگذاری کن.
//
//  هر منبع دو نوع داره:
//    kind: "rss"   → فید XML (سریع‌تر)
//    kind: "page"  → صفحه HTML (برای سایت‌هایی که RSS ندارن)
//
//  max: حداکثر تعداد خبر از این منبع در هر بار اجرا
//  lang: زبان اصلی منبع — اگه "en" باشه، خودکار ترجمه می‌شه
// ════════════════════════════════════════════════════════════


const ALL_SOURCES = {

  // ══════════════════════════════════════════════════════════
  //  🇮🇷  اخبار ایران
  // ══════════════════════════════════════════════════════════

  iran: [
    {
      name:  "ایران اینترنشنال",
      group: "iran",
      kind:  "page",
      lang:  "fa",
      max:   5,
      url:   "https://www.iranintl.com/latest",
      matchHref: /iranintl\.com\/(fa|en)\/[^"'\s?#]{10,}/i,
    },
    {
      name:  "بی‌بی‌سی فارسی",
      group: "iran",
      kind:  "page",
      lang:  "fa",
      max:   4,
      url:   "https://www.bbc.com/persian",
      matchHref: /bbc\.com\/persian\//i,
    },
    {
      name:  "رادیو فردا",
      group: "iran",
      kind:  "rss",
      lang:  "fa",
      max:   4,
      url:   "https://www.radiofarda.com/api/z-_og-qpme_a",
    },
    {
      name:  "صدای آمریکا فارسی",
      group: "iran",
      kind:  "rss",
      lang:  "fa",
      max:   3,
      url:   "https://ir.voanews.com/api/zmt_oqriqmr",
    },
    {
      name:  "رادیو زمانه",
      group: "iran",
      kind:  "rss",
      lang:  "fa",
      max:   3,
      url:   "https://www.radiozamaneh.com/feed/",
    },
    {
      name:  "دویچه‌وله فارسی",
      group: "iran",
      kind:  "rss",
      lang:  "fa",
      max:   3,
      url:   "https://rss.dw.com/rdf/rss-per-all",
    },
    {
      name:  "ایران وایر",
      group: "iran",
      kind:  "rss",
      lang:  "fa",
      max:   3,
      url:   "https://iranwire.com/fa/feed/",
    },
    {
      name:  "کمپین دفاع از حقوق بشر",
      group: "iran",
      kind:  "rss",
      lang:  "fa",
      max:   3,
      url:   "https://www.iranhumanrights.org/feed/",
    },
  ],


  // ══════════════════════════════════════════════════════════
  //  🌍  اخبار جهان
  // ══════════════════════════════════════════════════════════

  world: [
    {
      name:  "Reuters — World",
      group: "world",
      kind:  "page",
      lang:  "en",
      max:   4,
      url:   "https://www.reuters.com/world/",
      matchHref: /reuters\.com\/world\/.+-\d{4}-\d{2}-\d{2}/i,
    },
    {
      name:  "AP News — Top Stories",
      group: "world",
      kind:  "rss",
      lang:  "en",
      max:   4,
      url:   "https://apnews.com/hub/apf-topnews?output=rss",
    },
    {
      name:  "BBC World",
      group: "world",
      kind:  "rss",
      lang:  "en",
      max:   4,
      url:   "https://feeds.bbci.co.uk/news/world/rss.xml",
    },
    {
      name:  "Al Jazeera English",
      group: "world",
      kind:  "page",
      lang:  "en",
      max:   3,
      url:   "https://www.aljazeera.com/",
      matchHref: /aljazeera\.com\/(news|economy|features|opinions)\//i,
    },
    {
      name:  "CNN World",
      group: "world",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "http://rss.cnn.com/rss/edition_world.rss",
    },
    {
      name:  "The Guardian — World",
      group: "world",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.theguardian.com/world/rss",
    },
    {
      name:  "NPR News",
      group: "world",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://feeds.npr.org/1001/rss.xml",
    },
    {
      name:  "Axios",
      group: "world",
      kind:  "page",
      lang:  "en",
      max:   3,
      url:   "https://www.axios.com/",
      matchHref: /axios\.com\/\d{4}\/\d{2}\/\d{2}\//i,
    },
    {
      name:  "Associated Press — US",
      group: "world",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://apnews.com/hub/us-news?output=rss",
    },
    {
      name:  "DW News — English",
      group: "world",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://rss.dw.com/rdf/rss-en-all",
    },
    {
      name:  "France 24 — English",
      group: "world",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.france24.com/en/rss",
    },
    {
      name:  "Middle East Eye",
      group: "world",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.middleeasteye.net/rss",
    },
  ],


  // ══════════════════════════════════════════════════════════
  //  💻  تکنولوژی
  // ══════════════════════════════════════════════════════════

  tech: [
    {
      name:  "TechCrunch",
      group: "tech",
      kind:  "rss",
      lang:  "en",
      max:   4,
      url:   "https://techcrunch.com/feed/",
    },
    {
      name:  "The Verge",
      group: "tech",
      kind:  "rss",
      lang:  "en",
      max:   4,
      url:   "https://www.theverge.com/rss/index.xml",
    },
    {
      name:  "Wired",
      group: "tech",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.wired.com/feed/rss",
    },
    {
      name:  "Ars Technica",
      group: "tech",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://feeds.arstechnica.com/arstechnica/index",
    },
    {
      name:  "MIT Technology Review",
      group: "tech",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.technologyreview.com/feed/",
    },
    {
      name:  "Hacker News — Top",
      group: "tech",
      kind:  "rss",
      lang:  "en",
      max:   5,
      url:   "https://hnrss.org/frontpage",
    },
    {
      name:  "ZDNet",
      group: "tech",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.zdnet.com/news/rss.xml",
    },
    {
      name:  "9to5Mac",
      group: "tech",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://9to5mac.com/feed/",
    },
    {
      name:  "9to5Google",
      group: "tech",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://9to5google.com/feed/",
    },
    {
      name:  "Android Authority",
      group: "tech",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.androidauthority.com/feed/",
    },
  ],


  // ══════════════════════════════════════════════════════════
  //  💰  اقتصاد و بازار
  // ══════════════════════════════════════════════════════════

  economy: [
    {
      name:  "Reuters — Business",
      group: "economy",
      kind:  "page",
      lang:  "en",
      max:   4,
      url:   "https://www.reuters.com/business/",
      matchHref: /reuters\.com\/business\/.+-\d{4}-\d{2}-\d{2}/i,
    },
    {
      name:  "Bloomberg Markets",
      group: "economy",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://feeds.bloomberg.com/markets/news.rss",
    },
    {
      name:  "Financial Times",
      group: "economy",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.ft.com/world?format=rss",
    },
    {
      name:  "CNBC Economy",
      group: "economy",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258",
    },
    {
      name:  "MarketWatch",
      group: "economy",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://feeds.content.dowjones.io/public/rss/mw_topstories",
    },
    {
      name:  "Investopedia News",
      group: "economy",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.investopedia.com/feedbuilder/feed/getfeed?feedName=rss_headline",
    },
  ],


  // ══════════════════════════════════════════════════════════
  //  🔬  علم و دانش
  // ══════════════════════════════════════════════════════════

  science: [
    {
      name:  "NASA Breaking News",
      group: "science",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.nasa.gov/rss/dyn/breaking_news.rss",
    },
    {
      name:  "Science Daily",
      group: "science",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.sciencedaily.com/rss/top/science.xml",
    },
    {
      name:  "New Scientist",
      group: "science",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.newscientist.com/feed/home/?cmpid=RSS|NSNS-2012-GLOBAL|newscientist.com-rss",
    },
    {
      name:  "Nature — News",
      group: "science",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.nature.com/nature.rss",
    },
    {
      name:  "Phys.org",
      group: "science",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://phys.org/rss-feed/",
    },
    {
      name:  "Space.com",
      group: "science",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.space.com/feeds/all",
    },
  ],


  // ══════════════════════════════════════════════════════════
  //  🤖  هوش مصنوعی
  // ══════════════════════════════════════════════════════════

  ai: [
    {
      name:  "OpenAI Blog",
      group: "ai",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://openai.com/news/rss.xml",
    },
    {
      name:  "Google AI Blog",
      group: "ai",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://blog.google/technology/ai/rss/",
    },
    {
      name:  "MIT AI News",
      group: "ai",
      kind:  "page",
      lang:  "en",
      max:   3,
      url:   "https://news.mit.edu/topic/artificial-intelligence2",
      matchHref: /news\.mit\.edu\/\d{4}\//i,
    },
    {
      name:  "VentureBeat AI",
      group: "ai",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://venturebeat.com/category/ai/feed/",
    },
  ],


  // ══════════════════════════════════════════════════════════
  //  🎮  بازی و سرگرمی
  // ══════════════════════════════════════════════════════════

  gaming: [
    {
      name:  "IGN",
      group: "gaming",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://feeds.ign.com/ign/all",
    },
    {
      name:  "Kotaku",
      group: "gaming",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://kotaku.com/rss",
    },
    {
      name:  "PC Gamer",
      group: "gaming",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.pcgamer.com/rss/",
    },
  ],


  // ══════════════════════════════════════════════════════════
  //  🏥  سلامت و پزشکی
  // ══════════════════════════════════════════════════════════

  health: [
    {
      name:  "WHO News",
      group: "health",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.who.int/rss-feeds/news-english.xml",
    },
    {
      name:  "Medical News Today",
      group: "health",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.medicalnewstoday.com/rss/newsarticles.xml",
    },
    {
      name:  "Reuters — Health",
      group: "health",
      kind:  "page",
      lang:  "en",
      max:   3,
      url:   "https://www.reuters.com/business/healthcare-pharmaceuticals/",
      matchHref: /reuters\.com\/business\/healthcare.+\d{4}-\d{2}-\d{2}/i,
    },
  ],


  // ══════════════════════════════════════════════════════════
  //  🌿  محیط زیست و آب و هوا
  // ══════════════════════════════════════════════════════════

  environment: [
    {
      name:  "Reuters — Environment",
      group: "environment",
      kind:  "page",
      lang:  "en",
      max:   3,
      url:   "https://www.reuters.com/business/environment/",
      matchHref: /reuters\.com\/business\/environment.+\d{4}-\d{2}-\d{2}/i,
    },
    {
      name:  "The Guardian — Environment",
      group: "environment",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.theguardian.com/environment/rss",
    },
    {
      name:  "Carbon Brief",
      group: "environment",
      kind:  "rss",
      lang:  "en",
      max:   3,
      url:   "https://www.carbonbrief.org/feed",
    },
  ],

};


// ════════════════════════════════════════════════════════════
//  نمونه ترکیب — این بلاک رو داخل worker.js جایگذاری کن
// ════════════════════════════════════════════════════════════

/*
const SOURCES = [
  ...ALL_SOURCES.iran,
  ...ALL_SOURCES.world,
  ...ALL_SOURCES.tech,
  ...ALL_SOURCES.economy,
];
*/
