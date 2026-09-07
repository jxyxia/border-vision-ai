# backend/main.py
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from datetime import datetime

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