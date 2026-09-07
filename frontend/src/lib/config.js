// Single source of truth for backend endpoints, matched to backend/main.py.
export const API_BASE = 'http://localhost:8000'
export const ALERTS_URL = `${API_BASE}/alerts`
export const LIVE_WS_URL = 'ws://localhost:8000/live'
export const VIDEO_FEED_URL = `${API_BASE}/video_feed`
