# NFA Mobile Match Centre

A cross-platform React Native (Expo) app that consumes a Node.js/Express bridge server connected to the existing PHP + MySQL football management system. The Node server exposes REST APIs and Socket.IO streams for fixtures, results, reports, users, announcements, and live match events so referees, players, fans, and admins can stay informed in real time.

## Project Structure

```
├── App.js                # React Native root with navigation + providers
├── backend/              # Node.js bridge/API server
│   ├── package.json
│   └── src/
│       ├── config/db.js
│       ├── services/dataService.js
│       ├── routes/*.js   # fixtures, results, reports, users, announcements, webhooks
│       └── app.js/index.js
└── src/
    ├── api/              # Axios + Socket.IO client helpers
    ├── config/
    ├── context/          # DataProvider hydrates UI from backend
    ├── hooks/            # Notifications/push registration
    ├── components/       # Reusable UI blocks
    └── screens/          # Dashboard, Matches, News, Alerts, People
```

## Backend (Node.js + Express)

### 1. Configure environment

```
cd backend
copy env.example .env  # Windows
# or: cp env.example .env  # macOS/Linux
```

Edit `.env` to match your local WAMP MySQL database. Defaults:

```
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=12345
DB_NAME=football
PHP_WEBHOOK_SECRET=change_me
ALLOW_ORIGIN=http://localhost:19006
```

### 2. Install dependencies & run

```
cd backend
npm install
npm run dev
```

The server exposes:

- `GET /api/fixtures`
- `GET /api/results`
- `GET /api/reports`
- `GET /api/users?role=referee`
- `POST /api/users/notification-token`
- `GET /api/announcements`
- `POST /api/webhooks/live-updates` (PHP pushes JSON `{ matchId, payload }` with header `x-php-signature`)
- `GET /health`

Socket.IO broadcasts `live-events:update` whenever a webhook payload arrives, so connected mobile clients update instantly.

## Frontend (React Native / Expo)

### 1. Environment variables

Set Expo runtime variables for API + WebSocket endpoints (defaults target localhost). You can create an `.env` file or pass through CLI:

```
set EXPO_PUBLIC_API_URL=http://localhost:4000/api
set EXPO_PUBLIC_WS_URL=http://localhost:4000
```

On macOS/Linux:

```
export EXPO_PUBLIC_API_URL=http://localhost:4000/api
export EXPO_PUBLIC_WS_URL=http://localhost:4000
```

### 2. Install & run

```
npm install
npm run start
```

Use the Expo Go app or an emulator to load the experience. The UI includes:

- **Dashboard** – upcoming fixture, latest result, stats overview, announcement highlights.
- **Matches** – toggles between fixtures, results, and reports with pull-to-refresh.
- **News** – fully fledged announcement feed.
- **Alerts** – live Socket.IO stream + push notification opt-in (Expo Notifications).
- **People** – filterable directory for referees, players, fans, and admins synced from PHP.

Push notifications are registered via `expo-notifications`; tokens are POSTed to `/api/users/notification-token` so the existing PHP system (or the new Node bridge) can fan out alerts through Expo's push service.

## PHP → Node Integration

1. Configure the PHP system to issue an HTTP `POST` to `http://<node-host>:4000/api/webhooks/live-updates`.
2. Include header `x-php-signature: <PHP_WEBHOOK_SECRET>` to authenticate.
3. Payload example:

```json
{
  "matchId": 42,
  "payload": {
    "status": "LIVE",
    "minute": 63,
    "home_score": 1,
    "away_score": 0,
    "last_event": "Yellow card for #6"
  }
}
```

Every webhook request persists the event in MySQL (`live_events` table) and emits `live-events:update` to socket clients so the React Native app updates without polling.

## Next Steps

- Map exact MySQL table/column names from the PHP system and adjust the SQL queries in `backend/src/services/dataService.js` if they differ.
- Secure the `/api/webhooks/live-updates` endpoint behind HTTPS and rotate `PHP_WEBHOOK_SECRET`.
- Extend the Node backend with RBAC + authentication once the PHP system can issue API tokens.
- Build admin/referee forms for submitting reports directly from the app if desired.

