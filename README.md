# Lead Automation

A lightweight lead capture system that collects form submissions, validates and stores them, and sends real-time notifications to Discord.

## Overview

When a visitor submits the contact form, the server validates the input, saves the lead to a local JSON file, and fires a Discord webhook notification. A honeypot field silently drops bot submissions.

## Tech Stack

- **Backend:** Node.js (ES modules), Express v5
- **Frontend:** Vanilla HTML + Fetch API
- **Storage:** JSON file (`server/data/leads.json`)
- **Notifications:** Discord webhooks

## Project Structure

```
lead-automation/
├── client/
│   └── index.html          # Contact form
└── server/
    ├── index.js            # Express server & routes
    ├── validate.js         # Input validation
    ├── storage.js          # File-based lead persistence
    ├── notifyDiscord.js    # Discord webhook integration
    ├── package.json
    ├── nodemon.json
    ├── .env
    └── data/
        └── leads.json      # Stored leads
```

## Setup

**Prerequisites:** Node.js 18+

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=3000
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

`DISCORD_WEBHOOK_URL` is optional — the server runs without it, just without notifications.

## Running

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

The app is served at `http://localhost:3000`.

## API

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Serves the contact form |
| `POST` | `/api/leads` | Submits a new lead |
| `GET` | `/health` | Health check |

### POST `/api/leads`

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "I'd like to learn more."
}
```

**Success (201):**
```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "I'd like to learn more.",
  "createdAt": "2026-04-03T10:00:00.000Z"
}
```

**Validation error (400):**
```json
{ "errors": ["Email is invalid"] }
```

## Validation Rules

| Field | Rule |
|-------|------|
| `name` | Minimum 2 characters |
| `email` | Valid email format |
| `message` | Minimum 5 characters |

## Spam Protection

The form includes a hidden `companyWebsite` honeypot field. If it is filled in (as bots tend to do), the request is silently accepted but discarded — no lead is saved and no notification is sent.
