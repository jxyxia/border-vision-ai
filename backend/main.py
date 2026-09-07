# backend/main.py
import os
import time
from pathlib import Path
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="AI Border Surveillance API")

# Allow frontend to connect without CORS issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (skipping SQLite to save time as planned)
alerts_db = []
connected_clients = []

class Alert(BaseModel):
    track_id: str
    alert_type: str
    timestamp: str

@app.post("/alerts")
async def create_alert(alert: Alert):
    alerts_db.append(alert.dict())
    
    # Broadcast to any connected frontend WebSockets
    for client in connected_clients:
        await client.send_json(alert.dict())
        
    return {"status": "success", "message": "Alert logged"}

@app.get("/alerts")
async def get_alerts():
    return {"alerts": alerts_db}

@app.websocket("/live")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except Exception:
        connected_clients.remove(websocket)

# --- Live video feed ------------------------------------------------------
# detect_track.py writes each annotated frame (real bounding boxes already
# drawn on it) to FRAME_FILE, atomically. This endpoint just re-reads that
# file in a loop and streams it out as MJPEG (multipart/x-mixed-replace),
# which a plain <img> tag in the browser can play natively.

FRAME_FILE = "data/latest_frame.jpg"
FRAME_INTERVAL_SECONDS = 0.05  # ~20 fps cap on the outgoing stream
VIDEO_DIR = Path("data")
SELECTED_VIDEO_FILE = VIDEO_DIR / ".selected_video"

def available_videos():
    return sorted(
        path.name for path in VIDEO_DIR.glob("*.mp4") if path.is_file()
    )

@app.get("/videos")
def get_videos():
    videos = available_videos()
    selected = SELECTED_VIDEO_FILE.read_text().strip() if SELECTED_VIDEO_FILE.exists() else None
    if selected not in videos:
        selected = videos[0] if videos else None
    return {"videos": videos, "selected": selected}

@app.post("/videos/{video_name}")
def select_video(video_name: str):
    videos = available_videos()
    if video_name not in videos:
        raise HTTPException(status_code=404, detail="Video not found")
    SELECTED_VIDEO_FILE.write_text(video_name)
    return {"status": "success", "selected": video_name}

def _mjpeg_generator():
    boundary = b"--frame\r\n"
    while True:
        if os.path.exists(FRAME_FILE):
            try:
                with open(FRAME_FILE, "rb") as f:
                    frame_bytes = f.read()
                if frame_bytes:
                    yield boundary + b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            except OSError:
                pass  # detect_track.py mid-write (os.replace) — just skip this tick
        time.sleep(FRAME_INTERVAL_SECONDS)

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(
        _mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )
