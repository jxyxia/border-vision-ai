# backend/behaviour.py
import json
import time
import requests
from datetime import datetime

# Config
TRACKING_FILE = "data/tracking_output.jsonl"
API_URL = "http://localhost:8000/alerts"
BOUNDARY_Y = 300 # Adjust this based on your camera angle (Y-coordinate line)
LOITER_LIMIT = 50 # Number of frames/readings before tagging as loitering

def analyze_behaviour():
    history = {}
    alerted_ids = set()
    
    print("Waiting for tracking data...")
    
    # Simple tail -f equivalent in Python
    with open(TRACKING_FILE, 'r') as f:
        while True:
            line = f.readline()
            if not line:
                time.sleep(0.1) # Wait for new data
                continue
                
            try:
                data = json.loads(line.strip())
            except:
                continue
                
            track_id = data["track_id"]
            cy = data["cy"]
            
            # Skip if we already alerted heavily for this person to prevent spam
            if track_id in alerted_ids:
                continue

            # 1. Update History for Loitering
            if track_id not in history:
                history[track_id] = 1
            else:
                history[track_id] += 1
                
            # 2. Check Loitering
            if history[track_id] > LOITER_LIMIT:
                send_alert(track_id, "Loitering Detected")
                alerted_ids.add(track_id)
                
            # 3. Check Boundary Crossing
            if cy > BOUNDARY_Y:
                send_alert(track_id, "Boundary Crossed")
                alerted_ids.add(track_id)

def send_alert(track_id, alert_type):
    payload = {
        "track_id": track_id,
        "alert_type": alert_type,
        "timestamp": datetime.now().isoformat()
    }
    try:
        requests.post(API_URL, json=payload)
        print(f"🚨 ALERT SENT: {alert_type} for ID {track_id}")
    except Exception as e:
        print(f"Failed to send alert: API might be down. ({e})")

if __name__ == "__main__":
    # Ensure file exists before reading
    open(TRACKING_FILE, 'a').close()
    analyze_behaviour()