🌐 Language: English | [فارسی](README.fa.md)

# 📡 NewsBot — Cloudflare Worker News Bot

A lightweight news aggregator built on **Cloudflare Workers** that fetches articles from multiple sources, translates them to Persian, and delivers them to **Telegram** and/or **Bale** messenger — automatically, on a schedule you set.

No servers. No maintenance. Runs entirely on Cloudflare's free tier.

---

## ✨ Features

- Fetches news from RSS feeds and web pages
- Auto-translates English articles to Persian (via Google Translate)
- Sends full article text + image + summary to Telegram and Bale
- Skips duplicate articles (via Cloudflare KV)
- Bridges messages between Bale and Telegram groups
- 30+ pre-configured news sources across 8 categories
- Runs on a schedule (every 15 minutes by default)
- Completely free to host

---

## 🗂️ File Overview

```
newsbot/
├── worker.js          ← Main Worker file (paste into Cloudflare)
├── sources.config.js  ← All available news sources (reference)
└── README.md
```

---

## 🚀 Setup Guide (No Coding Required)

### Step 1 — Create a Cloudflare Account

Go to [cloudflare.com](https://cloudflare.com) and sign up for a free account.

---

### Step 2 — Create a KV Namespace

KV is a key-value storage used to remember which articles have already been sent.

1. In the Cloudflare dashboard, go to **Workers & Pages → KV**
2. Click **Create namespace**
3. Name it exactly: `NEWS_KV`
4. Click **Add**

---

### Step 3 — Create a Worker

1. Go to **Workers & Pages → Overview**
2. Click **Create application → Create Worker**
3. Give it any name (e.g. `newsbot`)
4. Click **Deploy**, then click **Edit code**
5. **Delete all existing code** in the editor
6. Open `worker.js` from this repository, copy everything, paste it in
7. Click **Save and Deploy**

---

### Step 4 — Fill in Your Tokens & IDs

At the top of `worker.js`, find the `CONFIG` object and fill in:

```js
const CONFIG = {
  telegram: {
    token:      "YOUR_TELEGRAM_BOT_TOKEN",   // from @BotFather on Telegram
    recipients: ["123456789"],               // Telegram chat IDs to receive news
    admins:     ["YOUR_USER_ID"],            // your personal Telegram ID
  },
  bale: {
    token:      "YOUR_BALE_BOT_TOKEN",       // from Bale developer panel
    recipients: ["111111", "222222"],        // Bale chat IDs to receive news
  },
};
```

**How to get a Telegram bot token:**
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the steps
3. Copy the token it gives you

**How to find your Telegram chat ID:**
1. Send a message to `@userinfobot`
2. It will reply with your user ID

**How to get a Bale bot token:**
1. Open Bale and search for `@BotFather`
2. Send `/newbot` and follow the steps
3. Copy the token it gives you

**How to find your Bale chat ID:**
1. Send a message to `@userinfobot`
2. It will reply with your user ID

---

### Step 5 — Bind the KV Namespace to the Worker

1. Go to your Worker → **Settings → Variables**
2. Scroll to **KV Namespace Bindings**
3. Click **Add binding**
4. Variable name: `NEWS_KV`
5. KV Namespace: select the `NEWS_KV` you created
6. Click **Save and Deploy**

---

### Step 6 — Set Up a Cron Schedule

This makes the bot run automatically every 15 minutes.

1. Go to your Worker → **Triggers → Cron Triggers**
2. Click **Add Cron Trigger**
3. Enter: `*/15 * * * *`
4. Click **Add**

---

### Step 7 — Register Webhooks

This step connects your Telegram and Bale bots to the Worker.

1. Find your Worker's URL — it looks like `https://newsbot.yourname.workers.dev`
2. Open this URL in your browser: `https://newsbot.yourname.workers.dev/registerWebhook`
3. You should see a JSON response confirming both webhooks were set

You only need to do this once.

---

### Step 8 — Test It

Open: `https://newsbot.yourname.workers.dev/run`

This triggers a manual news check. Within a minute or two you should receive the first batch of news in your Telegram/Bale chats.

You can also check the bot's health at: `/health`

---

## 📰 Customising News Sources

Open `sources.config.js` to browse all available sources grouped by category:

| Category     | Examples                              |
|--------------|---------------------------------------|
| `iran`       | Iran International, BBC Persian, RFE  |
| `world`      | Reuters, AP, BBC World, Al Jazeera    |
| `tech`       | TechCrunch, The Verge, Wired          |
| `economy`    | Reuters Business, Bloomberg, FT       |
| `science`    | NASA, Nature, Science Daily           |
| `ai`         | OpenAI Blog, Google AI, VentureBeat   |
| `gaming`     | IGN, Kotaku, PC Gamer                 |
| `health`     | WHO, Medical News Today               |

Copy the sources you want from that file and paste them into the `SOURCES` array inside `worker.js`.

---

## 🔗 Endpoints

| URL                 | Description                          |
|---------------------|--------------------------------------|
| `/health`           | Check if the bot and KV are working  |
| `/run`              | Trigger a manual news check          |
| `/latest?limit=20`  | Preview latest news (no sending)     |
| `/registerWebhook`  | Register Telegram & Bale webhooks    |

---

## ⚠️ Important Notes

- The free Cloudflare Workers plan allows 100,000 requests/day — more than enough.
- KV free tier allows 100,000 reads and 1,000 writes/day.
- If you add too many sources, you might hit the Worker's 30-second CPU limit. Keep it under 15 sources for safety.
- Image translation uses Google Translate's free endpoint — no API key needed.

---

## 📝 License

MIT License — free to use, modify, and share.

---

*❤️Made With Love by ValtorByte❤️*
