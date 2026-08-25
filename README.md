# ⚡ Nexora

**Webhook Automation Platform** — receive, process, retry, and replay webhook events with a live monitoring dashboard.

![Status](https://img.shields.io/badge/status-in--development-orange)
![Node](https://img.shields.io/badge/node.js-server-339933)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748)
![SQLite](https://img.shields.io/badge/database-SQLite-003B57)

---

## 📖 Overview

Nexora is a lightweight webhook automation platform. It ingests incoming webhook events, tracks their processing status, automatically retries failed deliveries, and moves permanently failing events into a **dead-letter queue** for manual inspection and replay — all visible in real time through a built-in dashboard.

---

## 📊 Dashboard

The dashboard gives an at-a-glance view of every event flowing through the system.

| Metric | Description |
|---|---|
| **Total Events** | All events received by the platform |
| **Success** | Events processed successfully |
| **Pending** | Events currently being processed or awaiting retry |
| **Failed** | Events that failed a delivery attempt |
| **Dead Letter** | Events that exhausted all retry attempts and need manual review |

Each event row shows its **Event ID**, **Type**, **Status**, number of **Attempts**, and **Time** received. Dead-lettered events include a one-click **Replay** button to re-trigger processing.

**Example view:**

```
⚡ Nexora Dashboard — Webhook Automation Platform
Endpoint: http://localhost:4000

┌───────────────┬─────────────┬───────────┬────────────┐
│ Total Events  │  Success    │  Pending  │   Failed   │  Dead Letter
│      6        │     3       │     0     │     0      │      3
└───────────────┴─────────────┴───────────┴────────────┘

Event ID              Type              Status         Attempts   Time
evt_1787664662202      payment.success   SUCCESS           0      7:01:02 pm
evt_1787664658451      payment.success   SUCCESS           0      7:00:58 pm
evt_1787664655629      payment.success   SUCCESS           0      7:00:55 pm
evt_1787664630824      force.fail        DEAD_LETTER       3      7:00:30 pm   [Replay]
evt_1787664629021      force.fail        DEAD_LETTER       3      7:00:29 pm   [Replay]
evt_1787664625437      force.fail        DEAD_LETTER       3      7:00:25 pm   [Replay]
```

> Add an actual screenshot here once the repo is public:
> `![Nexora Dashboard](./docs/dashboard-screenshot.png)`

---

## ✨ Features

- 📥 **Webhook ingestion** — accepts incoming events via HTTP
- 🔁 **Automatic retries** — failed events are retried with attempt tracking
- ☠️ **Dead-letter queue** — events that exhaust retries are quarantined instead of silently dropped
- ♻️ **Manual replay** — re-trigger any dead-lettered event straight from the dashboard
- 📈 **Live dashboard** — real-time counts for total, success, pending, failed, and dead-letter events
- 🗄️ **Persistent storage** — event history stored via Prisma + SQLite

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Server | Node.js (nodemon for dev) |
| ORM / Database | Prisma + SQLite |
| Dashboard | HTML/CSS/JS (static, served from `dashboard/`) |
| Testing utilities | Node & PowerShell test-webhook scripts |

---

## 📁 Project Structure

```
Nexora/
├── dashboard/
│   └── index.html          # Live monitoring dashboard
└── server/
    ├── prisma/              # Prisma schema & migrations
    ├── src/                 # Server source code
    ├── .env / .env.example  # Environment configuration
    ├── nodemon.json         # Dev server config
    ├── package.json
    ├── send-test-webhook.js   # Send a test webhook (Node)
    └── send-test-webhook.ps1  # Send a test webhook (PowerShell)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- npm

### Installation

```bash
cd server
npm install
```

### Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

### Set Up the Database

```bash
npx prisma migrate dev --name init
```

This creates the SQLite database and applies migrations.

### Run the Server

```bash
npm run dev
```

The server starts on `http://localhost:4000` (configurable via `.env`).

### Open the Dashboard

Open `dashboard/index.html` in your browser and point it at your running server (default: `http://localhost:4000`).

### Send a Test Webhook

**Node:**
```bash
node send-test-webhook.js
```

**PowerShell:**
```powershell
./send-test-webhook.ps1
```

---

## 🧪 Testing Failure & Replay Flow

To see the retry and dead-letter system in action, send an event with a type that triggers a failure (e.g. `force.fail`). After the configured number of retry attempts, the event will appear in the dashboard with a **DEAD_LETTER** status and a **Replay** button.

---

## 🗺️ Roadmap

- [ ] Configurable retry backoff strategy
- [ ] Webhook signature verification
- [ ] Event filtering/search on the dashboard
- [ ] Deployment guide (Docker)

---

## 📄 License

Add your license of choice here (MIT, Apache 2.0, etc.).
