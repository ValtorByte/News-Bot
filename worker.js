// ════════════════════════════════════════════════════════════
//
//  NewsBot  —  Cloudflare Worker
//
// ─────────────────────────────────────────────────────────────
//  ⚙️  پیکربندی — اینجا رو ویرایش کن
// ─────────────────────────────────────────────────────────────

const CONFIG = {
  telegram: {
    token:      "YOUR_TELEGRAM_BOT_TOKEN",
    recipients: ["CHAT_ID_1"],              // آیدی گیرنده‌های تلگرام
    admins:     ["YOUR_TELEGRAM_USER_ID"],  // کاربرانی که می‌تونن دستور بدن
  },
  bale: {
    token:      "YOUR_BALE_BOT_TOKEN",
    recipients: ["CHAT_ID_1", "CHAT_ID_2"], // آیدی گیرنده‌های بله
  },
  // چند ثانیه بین هر خبر (جلوگیری از محدودیت ارسال)
  sendDelay:  900,
  // حداکثر کاراکتر در هر پیام
  msgLimit:   3800,
  // مدت نگهداری اخبار دیده‌شده (ثانیه) — 14 روز
  kvTTL:      60 * 60 * 24 * 14,
};


// ─────────────────────────────────────────────────────────────
//  📰  منابع خبری — از فایل  sources.config.js  انتخاب کن
//  یا همینجا اضافه/حذف کن
// ─────────────────────────────────────────────────────────────

const SOURCES = [

  // ── اخبار ایران ──────────────────────────────────────────
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

  // ── اخبار جهان ──────────────────────────────────────────
  {
    name:  "Reuters",
    group: "world",
    kind:  "page",
    lang:  "en",
    max:   4,
    url:   "https://www.reuters.com/world/",
    matchHref: /reuters\.com\/world\/.+-\d{4}-\d{2}-\d{2}/i,
  },
  {
    name:  "AP News",
    group: "world",
    kind:  "rss",
    lang:  "en",
    max:   4,
    url:   "https://apnews.com/hub/apf-topnews?output=rss",
  },
  {
    name:  "Al Jazeera",
    group: "world",
    kind:  "page",
    lang:  "en",
    max:   3,
    url:   "https://www.aljazeera.com/",
    matchHref: /aljazeera\.com\/(news|economy|features|opinions)\//i,
  },
  {
    name:  "BBC World",
    group: "world",
    kind:  "rss",
    lang:  "en",
    max:   3,
    url:   "https://feeds.bbci.co.uk/news/world/rss.xml",
  },

  // ── تکنولوژی ────────────────────────────────────────────
  {
    name:  "TechCrunch",
    group: "tech",
    kind:  "rss",
    lang:  "en",
    max:   3,
    url:   "https://techcrunch.com/feed/",
  },
  {
    name:  "The Verge",
    group: "tech",
    kind:  "rss",
    lang:  "en",
    max:   3,
    url:   "https://www.theverge.com/rss/index.xml",
  },

  // ── اقتصاد ──────────────────────────────────────────────
  {
    name:  "Reuters Business",
    group: "economy",
    kind:  "page",
    lang:  "en",
    max:   3,
    url:   "https://www.reuters.com/business/",
    matchHref: /reuters\.com\/business\/.+-\d{4}-\d{2}-\d{2}/i,
  },

];


// ─────────────────────────────────────────────────────────────
//  ⛔  دست نزن — منطق اصلی از اینجا شروع می‌شه
// ─────────────────────────────────────────────────────────────

const ROUTES = {
  TELEGRAM: "/telegram",
  BALE:     "/bale",
  REG:      "/registerWebhook",
  RUN:      "/run",
  HEALTH:   "/health",
  LATEST:   "/latest",
};

const tgBase   = () => `https://api.telegram.org/bot${CONFIG.telegram.token}`;
const baleBase = () => `https://tapi.bale.ai/bot${CONFIG.bale.token}`;
const apiOf    = (p) => p === "telegram" ? tgBase() : baleBase();


// ──────────────── ابزارهای کمکی ─────────────────────────────

async function hashStr(s) {
  const buf = new TextEncoder().encode(s);
  const dig = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(dig)).map(b => b.toString(16).padStart(2,"0")).join("");
}

function safeEscRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHtml(s) {
  return String(s || "")
    .replace(/&nbsp;/gi,  " ")
    .replace(/&amp;/gi,   "&")
    .replace(/&quot;/gi,  '"')
    .replace(/&#39;/gi,   "'")
    .replace(/&apos;/gi,  "'")
    .replace(/&lt;/gi,    "<")
    .replace(/&gt;/gi,    ">")
    .replace(/&#x2F;/gi,  "/")
    .replace(/&#(\d+);/g,        (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripTags(s) {
  return String(s || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi,   " ")
    .replace(/<[^>]+>/g, " ");
}

function clean(s) {
  return decodeHtml(stripTags(String(s || ""))).replace(/\s+/g, " ").trim();
}

function hasPersian(s) {
  const text = String(s || "");
  const fa = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const en = (text.match(/[A-Za-z]/g) || []).length;
  return fa >= Math.max(5, text.length * 0.18) || fa > en * 1.4;
}

function displayName(from) {
  if (!from) return "ناشناس";
  const full = [from.first_name, from.last_name].filter(Boolean).join(" ").trim();
  const un   = from.username ? `@${from.username}` : "";
  const id   = from.id       ? `(${from.id})`      : "";
  return [full || "بدون نام", un, id].filter(Boolean).join(" ");
}

function toJalali(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return String(dateStr).slice(0, 30);
    return d.toLocaleString("fa-IR", {
      timeZone: "Asia/Tehran",
      year:     "numeric",
      month:    "long",
      day:      "numeric",
      hour:     "2-digit",
      minute:   "2-digit",
    });
  } catch {
    return String(dateStr).slice(0, 30);
  }
}


// ──────────────── تقسیم متن ──────────────────────────────────

function splitMessage(text, limit = CONFIG.msgLimit) {
  const t = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!t) return [""];
  if (t.length <= limit) return [t];

  const parts = [];
  let   buf   = "";

  for (const para of t.split(/\n{2,}/)) {
    const p = para.trim();
    if (!p) continue;

    const candidate = buf ? `${buf}\n\n${p}` : p;
    if (candidate.length <= limit) { buf = candidate; continue; }

    if (buf) { parts.push(buf.trim()); buf = ""; }

    if (p.length <= limit) { buf = p; continue; }

    for (let i = 0; i < p.length; i += limit)
      parts.push(p.slice(i, i + limit).trim());
  }

  if (buf.trim()) parts.push(buf.trim());
  return parts.length ? parts : [t.slice(0, limit)];
}

function splitForTranslation(text, lim = 900) {
  const t = clean(text);
  if (!t || t.length <= lim) return [t];

  const parts = [];
  let   buf   = "";

  for (const p of t.split(/\n{2,}/).map(x => x.trim()).filter(Boolean)) {
    if (p.length > lim) {
      if (buf) { parts.push(buf.trim()); buf = ""; }
      for (let i = 0; i < p.length; i += lim)
        parts.push(p.slice(i, i + lim).trim());
      continue;
    }
    const c = buf ? `${buf}\n\n${p}` : p;
    if (c.length <= lim) { buf = c; } else { if (buf) parts.push(buf.trim()); buf = p; }
  }

  if (buf.trim()) parts.push(buf.trim());
  return parts.length ? parts : [t.slice(0, lim)];
}


// ──────────────── KV ────────────────────────────────────────

async function alreadySeen(env, key) {
  try { return !!(await env.NEWS_KV.get(key)); } catch { return false; }
}

async function markAsSeen(env, key) {
  try { await env.NEWS_KV.put(key, "1", { expirationTtl: CONFIG.kvTTL }); } catch {}
}


// ──────────────── ترجمه ─────────────────────────────────────

async function translateChunk(text) {
  const endpoint = new URL("https://translate.googleapis.com/translate_a/single");
  endpoint.searchParams.set("client", "gtx");
  endpoint.searchParams.set("sl",     "auto");
  endpoint.searchParams.set("tl",     "fa");
  endpoint.searchParams.set("dt",     "t");
  endpoint.searchParams.set("q",      text);

  try {
    const res = await fetch(endpoint.toString(), {
      headers: { "user-agent": "Mozilla/5.0" },
    });
    if (!res.ok) return text;

    const data  = await res.json();
    const parts = [];

    if (Array.isArray(data?.[0]))
      for (const seg of data[0])
        if (Array.isArray(seg) && typeof seg[0] === "string") parts.push(seg[0]);

    return parts.join("").trim() || text;
  } catch {
    return text;
  }
}

async function translate(text) {
  const t = clean(text);
  if (!t || hasPersian(t)) return t;

  const results = [];
  for (const chunk of splitForTranslation(t))
    results.push(await translateChunk(chunk));

  return results.join("\n\n").trim();
}


// ──────────────── پارسر RSS ─────────────────────────────────

function xmlTag(block, tag) {
  const re = new RegExp(`<${safeEscRe(tag)}\\b[^>]*>([\\s\\S]*?)</${safeEscRe(tag)}>`, "i");
  const m  = block.match(re);
  return m ? decodeHtml(m[1]) : "";
}

function xmlAttr(block, tag, attr) {
  const re = new RegExp(`<${safeEscRe(tag)}\\b[^>]*${safeEscRe(attr)}=(["'])(.*?)\\1[^>]*\\/?>`, "i");
  const m  = block.match(re);
  return m ? decodeHtml(m[2]) : "";
}

function parseRSS(xml) {
  const items = [];

  for (const block of [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map(m => m[0])) {
    const title   = clean(xmlTag(block, "title"));
    const link    = clean(xmlTag(block, "link") || xmlTag(block, "guid"));
    const pubDate = clean(xmlTag(block, "pubDate") || xmlTag(block, "dc:date") || "");
    const summary = clean(stripTags(xmlTag(block, "description") || xmlTag(block, "content:encoded") || ""));
    const image   = clean(
      xmlAttr(block, "media:content",   "url") ||
      xmlAttr(block, "media:thumbnail", "url") ||
      xmlAttr(block, "enclosure",       "url") || ""
    );
    if (title && link) items.push({ title, link, pubDate, summary, image });
  }

  for (const block of [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map(m => m[0])) {
    const title   = clean(xmlTag(block, "title"));
    const link    = clean((block.match(/<link\b[^>]*href=(["'])(.*?)\1/i) || [])[2] || "");
    const pubDate = clean(xmlTag(block, "published") || xmlTag(block, "updated") || "");
    const summary = clean(stripTags(xmlTag(block, "summary") || xmlTag(block, "content") || ""));
    const image   = clean(xmlAttr(block, "media:thumbnail", "url") || xmlAttr(block, "media:content", "url") || "");
    if (title && link) items.push({ title, link, pubDate, summary, image });
  }

  const seen = new Set();
  return items.filter(i => {
    if (seen.has(i.link)) return false;
    seen.add(i.link);
    return true;
  });
}


// ──────────────── اسکرپر صفحه ───────────────────────────────

async function scrapePageLinks(src) {
  const res = await fetch(src.url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "accept":     "text/html,*/*;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const found = new Set();
  const limit = (src.max || 4) * 5;

  // لینک‌های کامل
  for (const m of html.matchAll(/href=(["'])(https?:\/\/[^"'\s>]+)\1/gi)) {
    const url = m[2];
    const pattern = src.matchHref || src.match;
    if (pattern && pattern.test(url)) found.add(url.split("?")[0]);
    if (found.size >= limit) break;
  }

  // لینک‌های نسبی
  for (const m of html.matchAll(/href=(["'])(\/[^"'\s>]{8,})\1/gi)) {
    try {
      const full    = new URL(m[2], src.url).href;
      const pattern = src.matchHref || src.match;
      if (pattern && pattern.test(full)) found.add(full.split("?")[0]);
    } catch {}
    if (found.size >= limit) break;
  }

  return [...found].slice(0, src.max || 4).map(link => ({
    title: "", link, pubDate: "", summary: "", image: "",
  }));
}


// ──────────────── واکشی مقاله کامل ─────────────────────────

function getMetaTag(html, prop, key) {
  const r1 = new RegExp(`<meta\\b[^>]*${safeEscRe(prop)}=(["'])${safeEscRe(key)}\\1[^>]*content=(["'])(.*?)\\2[^>]*>`, "i");
  const r2 = new RegExp(`<meta\\b[^>]*content=(["'])(.*?)\\1[^>]*${safeEscRe(prop)}=(["'])${safeEscRe(key)}\\3[^>]*>`, "i");
  return decodeHtml((html.match(r1) || [])[3] || (html.match(r2) || [])[2] || "");
}

function extractArticleText(html) {
  const body = (
    html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i) ||
    html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) ||
    [, ""]
  )[1] || html;

  const paragraphs = [];
  const seen       = new Set();

  for (const m of body.matchAll(/<(p|h2|h3|h4|blockquote|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const t   = clean(stripTags(m[2] || ""));
    if (!t || t.length < 25) continue;

    const key = t.slice(0, 60).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    paragraphs.push(t);
    if (paragraphs.length >= 40) break;
  }

  return paragraphs.join("\n\n");
}

async function fetchFullArticle(item, sourceLang) {
  let html = "";
  try {
    const res = await fetch(item.link, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "accept":     "text/html,application/xhtml+xml,*/*;q=0.9",
      },
    });
    if (res.ok) html = await res.text();
  } catch {}

  if (!html) {
    return {
      title:    item.title   || item.link,
      pubDate:  item.pubDate || "",
      imageUrl: item.image   || "",
      body:     item.summary || "",
      summary:  item.summary || "",
    };
  }

  const title = clean(
    getMetaTag(html, "property", "og:title")         ||
    getMetaTag(html, "name",     "twitter:title")     ||
    (html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] ||
    item.title || ""
  );

  let pubDate = item.pubDate ||
    getMetaTag(html, "property", "article:published_time") ||
    getMetaTag(html, "name",     "pubdate")                ||
    getMetaTag(html, "itemprop", "datePublished")          || "";

  if (!pubDate) {
    const jsonLd = html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const s of jsonLd) {
      const m = s[0].match(/"datePublished"\s*:\s*"([^"]+)"/);
      if (m) { pubDate = m[1]; break; }
    }
  }

  let imageUrl = clean(
    getMetaTag(html, "property", "og:image")          ||
    getMetaTag(html, "name",     "twitter:image")     ||
    getMetaTag(html, "name",     "twitter:image:src") ||
    item.image || ""
  );

  if (imageUrl) {
    try { imageUrl = new URL(imageUrl, item.link).href; } catch {}
    imageUrl = imageUrl.replace(/[?&](w|h|width|height|size|resize|quality|q|fit|crop)=\d+[^&]*/gi, "").replace(/[?&]$/, "");
  }

  const body    = extractArticleText(html) || item.summary;
  const summary = clean(
    getMetaTag(html, "property", "og:description") ||
    getMetaTag(html, "name",     "description")    ||
    item.summary || ""
  );

  return { title, pubDate, imageUrl, body, summary };
}


// ──────────────── دانلود تصویر ──────────────────────────────

async function downloadImage(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept":     "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

function imageExtension(url) {
  const m = (url || "").split("?")[0].match(/\.(png|gif|webp|jpg|jpeg)$/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}


// ──────────────── ارسال پیام ────────────────────────────────

async function callAPI(platform, method, payload) {
  const res = await fetch(`${apiOf(platform)}/${method}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  try { return await res.json(); } catch { return { ok: false }; }
}

async function sendText(platform, chatId, text) {
  return callAPI(platform, "sendMessage", { chat_id: String(chatId), text });
}

async function sendLongText(platform, chatId, text) {
  for (const chunk of splitMessage(text))
    await sendText(platform, chatId, chunk);
}

async function sendPhoto(platform, chatId, buf, ext, caption) {
  const mimeMap = { png: "image/png", gif: "image/gif", webp: "image/webp" };
  const mime    = mimeMap[ext] || "image/jpeg";

  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("photo",   new Blob([buf], { type: mime }), `img.${ext || "jpg"}`);
  if (caption) form.append("caption", caption.slice(0, 900));

  const res = await fetch(`${apiOf(platform)}/sendPhoto`, { method: "POST", body: form });
  try { return await res.json(); } catch { return { ok: false }; }
}

async function sendAttachment(platform, chatId, type, buf, filename, caption) {
  const methodMap = { document: "sendDocument", photo: "sendPhoto", video: "sendVideo", audio: "sendAudio" };
  const mimeMap   = { document: "application/octet-stream", photo: "image/jpeg", video: "video/mp4", audio: "audio/mpeg" };

  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append(type, new Blob([buf], { type: mimeMap[type] || "application/octet-stream" }), filename);
  if (caption) form.append("caption", caption.slice(0, 900));

  const res = await fetch(`${apiOf(platform)}/${methodMap[type]}`, { method: "POST", body: form });
  try { return await res.json(); } catch { return { ok: false }; }
}


// ──────────────── ارسال خبر به همه ─────────────────────────

async function broadcastArticle(article) {
  const { sourceName, title, body, summary, pubDate, link, imgBuffer, ext } = article;

  const photoCaption = `📌 ${title}`.slice(0, 900);
  const headerMsg    = `📌 ${title}\n🗞 ${sourceName}${pubDate ? `\n🕐 ${pubDate}` : ""}`;
  const bodyMsg      = body    ? `📄 متن خبر:\n\n${body}`            : "";
  const footerMsg    = summary ? `📝 خلاصه:\n${summary}\n\n🔗 ${link}` : `🔗 ${link}`;

  for (const { platform, ids } of [
    { platform: "telegram", ids: CONFIG.telegram.recipients },
    { platform: "bale",     ids: CONFIG.bale.recipients     },
  ]) {
    for (const chatId of ids) {
      try {
        if (imgBuffer) await sendPhoto(platform, chatId, imgBuffer, ext || "jpg", photoCaption);
        await sendText(platform, chatId, headerMsg);
        if (bodyMsg) await sendLongText(platform, chatId, bodyMsg);
        await sendText(platform, chatId, footerMsg);
      } catch (err) {
        console.error(`[broadcast] ${platform}:${chatId} —`, err.message);
      }
    }
  }
}

async function broadcastAll(text) {
  for (const id of CONFIG.telegram.recipients) await sendText("telegram", id, text);
  for (const id of CONFIG.bale.recipients)     await sendText("bale",     id, text);
}


// ──────────────── اجرای اصلی ────────────────────────────────

async function runNewsCheck(env) {
  const stats   = { sent: 0, skipped: 0, failed: 0 };
  const startTs = new Date().toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });

  await broadcastAll(`🔄 بررسی اخبار شروع شد\n🕐 ${startTs}\n📡 تعداد منابع: ${SOURCES.length}`);

  for (const src of SOURCES) {
    let rawItems = [];

    try {
      if (src.kind === "rss") {
        const res = await fetch(src.url, {
          headers: { "user-agent": "Mozilla/5.0 (compatible; NewsBot/1.0)" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        rawItems = parseRSS(await res.text()).slice(0, src.max || 4);
      } else {
        rawItems = await scrapePageLinks(src);
      }
    } catch (err) {
      console.error(`[fetch] ${src.name}:`, err.message);
      stats.failed++;
      continue;
    }

    for (const raw of rawItems) {
      const cacheKey = await hashStr(`v1|${src.name}|${raw.link}`);
      if (await alreadySeen(env, cacheKey)) { stats.skipped++; continue; }

      const article = await fetchFullArticle(raw, src.lang);

      const needTranslate = src.lang !== "fa" && !hasPersian(article.title);
      const title   = needTranslate ? await translate(article.title)   : article.title   || raw.title;
      const body    = needTranslate ? await translate(article.body)    : article.body;
      const summary = needTranslate ? await translate(article.summary) : article.summary;
      const pubDate = toJalali(article.pubDate);

      const imgBuffer = await downloadImage(article.imageUrl);
      const ext       = imgBuffer ? imageExtension(article.imageUrl) : "jpg";

      await broadcastArticle({ sourceName: src.name, title, body, summary, pubDate, link: raw.link, imgBuffer, ext });

      await markAsSeen(env, cacheKey);
      stats.sent++;

      await new Promise(r => setTimeout(r, CONFIG.sendDelay));
    }
  }

  const endTs = new Date().toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });

  await broadcastAll(
    `✅ اجرا پایان یافت\n🕐 ${endTs}\n\n` +
    `📤 ارسال شد: ${stats.sent}\n` +
    `⏭ تکراری:  ${stats.skipped}\n` +
    `❌ خطا:     ${stats.failed}\n\n` +
    `❤️Made With Love by ValtorByte❤️` 
  );

  return stats;
}


// ──────────────── بریج بله ↔ تلگرام ────────────────────────

async function getFileBuf(platform, fileId) {
  const info  = await (await fetch(`${apiOf(platform)}/getFile?file_id=${encodeURIComponent(fileId)}`)).json();
  const path  = info?.result?.file_path;
  if (!path) return null;

  const token = platform === "telegram" ? CONFIG.telegram.token : CONFIG.bale.token;
  const host  = platform === "telegram"
    ? `https://api.telegram.org/file/bot${token}`
    : `https://tapi.bale.ai/file/bot${token}`;

  return (await fetch(`${host}/${path}`)).arrayBuffer();
}

async function handleTelegramMsg(msg) {
  const uid = String(msg?.chat?.id || "");

  if (!CONFIG.telegram.admins.includes(uid))
    return sendText("telegram", uid, "❌ شما اجازه استفاده از این ربات را ندارید.");

  if (msg.text === "/start")
    return sendText("telegram", uid, "👋 سلام! پیام یا فایل ارسال کن تا به بله فوروارد بشه.");

  if (msg.text && !msg.text.startsWith("/")) {
    for (const id of CONFIG.bale.recipients) await sendText("bale", id, msg.text);
    return;
  }

  const types = [
    ["document", msg.document],
    ["photo",    msg.photo?.[msg.photo.length - 1]],
    ["video",    msg.video],
    ["audio",    msg.audio],
  ];
  for (const [type, obj] of types) {
    if (!obj) continue;
    const buf  = await getFileBuf("telegram", obj.file_id);
    const name = obj.file_name || (type === "photo" ? "photo.jpg" : "file");
    for (const id of CONFIG.bale.recipients)
      await sendAttachment("bale", id, type, buf, name, msg.caption || null);
    return;
  }
}

async function handleBaleMsg(msg) {
  const uid    = String(msg?.chat?.id || "");
  const sender = displayName(msg.from);

  if (msg.text === "/start")
    return sendText("bale", uid, "✅ ربات فعاله!");

  if (msg.text && !msg.text.startsWith("/")) {
    const fwd = `👤 ${sender}\n\n${msg.text}`;
    for (const id of CONFIG.telegram.recipients) await sendLongText("telegram", id, fwd);
    return;
  }

  const types = [
    ["document", msg.document],
    ["photo",    msg.photo?.[msg.photo.length - 1]],
    ["video",    msg.video],
    ["audio",    msg.audio],
  ];
  for (const [type, obj] of types) {
    if (!obj) continue;
    const buf     = await getFileBuf("bale", obj.file_id);
    const name    = obj.file_name || (type === "photo" ? "photo.jpg" : "file");
    const caption = msg.caption ? `${msg.caption}\n\n👤 ${sender}` : `👤 ${sender}`;
    for (const id of CONFIG.telegram.recipients)
      await sendAttachment("telegram", id, type, buf, name, caption);
    return;
  }
}


// ──────────────── ثبت Webhook ───────────────────────────────

async function registerWebhooks(origin) {
  const [tg, bale] = await Promise.all([
    fetch(`${tgBase()}/setWebhook`,   {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ url: `${origin}${ROUTES.TELEGRAM}` }),
    }).then(r => r.json()),
    fetch(`${baleBase()}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ url: `${origin}${ROUTES.BALE}` }),
    }).then(r => r.json()),
  ]);
  return { telegram: tg, bale };
}


// ──────────────── نقطه ورود ─────────────────────────────────

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runNewsCheck(env));
  },

  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const { pathname } = url;

    // ── ثبت Webhook
    if (pathname === ROUTES.REG) {
      const result = await registerWebhooks(url.origin);
      return new Response(JSON.stringify(result, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── اجرای دستی
    if (pathname === ROUTES.RUN) {
      ctx.waitUntil(runNewsCheck(env));
      return new Response(JSON.stringify({ ok: true, message: "شروع شد" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── بررسی سلامت
    if (pathname === ROUTES.HEALTH) {
      let kvOk = false;
      try { await env.NEWS_KV.put("_ping", "1", { expirationTtl: 10 }); kvOk = true; } catch {}
      return new Response(JSON.stringify({
        ok:      true,
        kv:      kvOk ? "✅ متصل" : "❌ KV binding تنظیم نشده",
        sources: SOURCES.length,
        ts:      new Date().toISOString(),
      }, null, 2), { headers: { "Content-Type": "application/json" } });
    }

    // ── لیست آخرین اخبار (بدون ارسال)
    if (pathname === ROUTES.LATEST) {
      const limit  = Math.min(+(url.searchParams.get("limit") || 20), 50);
      const result = [];

      for (const src of SOURCES) {
        try {
          if (src.kind === "rss") {
            const r = await fetch(src.url, { headers: { "user-agent": "Mozilla/5.0" } });
            if (r.ok)
              for (const item of parseRSS(await r.text()).slice(0, src.max || 4))
                result.push({ source: src.name, ...item });
          } else {
            const items = await scrapePageLinks(src);
            for (const item of items) result.push({ source: src.name, ...item });
          }
        } catch {}
        if (result.length >= limit) break;
      }

      return new Response(JSON.stringify({
        ok:    true,
        count: result.length,
        items: result.slice(0, limit),
      }, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8" } });
    }

    // ── Webhook تلگرام
    if (pathname === ROUTES.TELEGRAM && req.method === "POST") {
      try {
        const update = await req.json();
        if (update.message) ctx.waitUntil(handleTelegramMsg(update.message));
      } catch {}
      return new Response("OK");
    }

    // ── Webhook بله
    if (pathname === ROUTES.BALE && req.method === "POST") {
      try {
        const update = await req.json();
        if (update.message) ctx.waitUntil(handleBaleMsg(update.message));
      } catch {}
      return new Response("OK");
    }

    // ── صفحه اصلی
    return new Response(JSON.stringify({
      name:      "NewsBot — ValtorByte",
      version:   "1.0.0",
      endpoints: {
        [ROUTES.HEALTH]: "GET — وضعیت سرویس",
        [ROUTES.RUN]:    "GET — اجرای دستی",
        [ROUTES.LATEST]: "GET — لیست اخبار (بدون ارسال) ?limit=N",
        [ROUTES.REG]:    "GET — ثبت Webhook",
      },
    }, null, 2), { headers: { "Content-Type": "application/json" } });
  },
};