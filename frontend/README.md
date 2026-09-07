# Border Watch — Surveillance Console

SIH prototype frontend for an AI-based border video surveillance system.
React + Vite + Tailwind CSS + lucide-react.

## Setup

```bash
npm install
npm run dev
```

Runs at http://localhost:5173.

## Backend contract

Matched to `backend/main.py` (FastAPI, in-memory store):

- `GET http://localhost:8000/alerts` — returns `{ "alerts": [...] }`, each entry shaped:
  ```json
  { "track_id": "4", "alert_type": "Boundary Crossed", "timestamp": "2026-09-08T10:22:31.123456" }
  ```
- `ws://localhost:8000/live` — the server only pushes a frame when something
  `POST`s to `/alerts` (that's `backend/behaviour.py`, which watches
  `detect_track.py`'s tracking output and calls `send_alert()` for
  `"Loitering Detected"` and `"Boundary Crossed"`). The socket otherwise sits
  idle waiting on the server's `receive_text()` loop — the frontend never
  needs to send anything on it. The UI auto-reconnects every 3s if the
  connection drops.

Known `alert_type` values today are `"Loitering Detected"` (warning) and
`"Boundary Crossed"` (critical) — see the substring matching in
`lib/severity.js` if you add more in `behaviour.py`.

No backend running yet? The console still loads — the camera feed shows
"NO TRACKED OBJECTS IN FRAME", the alert stream shows "AWAITING
TRANSMISSION…", and history shows a fetch-failed state with a retry button.

## Structure

```
src/
  main.jsx              entry point
  App.jsx                layout + wires useAlerts() into the three panels
  hooks/
    useAlerts.js          REST fetch + WebSocket subscription, reconnect logic
  lib/
    severity.js           alert_type -> severity (critical/warning/nominal) + colors
  components/
    Header.jsx             top bar, connection status pill
    CameraFeed.jsx          simulated feed, bounding-box overlays, zone line
    AlertStream.jsx         live-scrolling WebSocket alert sidebar
    HistoryPanel.jsx        REST-backed history table with severity filter
```

## Notes

- `CameraFeed` derives mock bounding-box positions from each `track_id`
  (deterministic hash, so a given track stays in place across renders).
  Swap `positionFor()` for real detector coordinates once the backend
  sends bbox data.
- Severity classification (`lib/severity.js`) currently pattern-matches on
  `alert_type` strings like `intrusion`, `breach`, `loitering`. Extend the
  `CRITICAL` / `WARNING` arrays as your backend's alert taxonomy grows.
