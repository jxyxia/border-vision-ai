# backend/behaviour.py
import json
import time
import requests
import os
from datetime import datetime

# Config
TRACKING_FILE = "data/tracking_output.jsonl"
API_URL = "http://localhost:8000/alerts"
BOUNDARY_Y = 1400 # Match this with detect_track.py
LOITER_LIMIT = 50 # Number of frames/readings before tagging as loitering

def analyze_behaviour():
    history = {}
    alerted_ids = set()
    last_pos = 0
    
    print("Waiting for live tracking data...")
    
    while True:
        # 1. Wait until file exists
        if not os.path.exists(TRACKING_FILE):
            time.sleep(0.1)
            continue
            
        # 2. If detect_track.py clears the file, reset our reading position
        current_size = os.path.getsize(TRACKING_FILE)
        if current_size < last_pos:
            last_pos = 0
            history.clear()
            alerted_ids.clear()
            print("Detected new video stream. Resetting tracker...")

        # 3. Read the file robustly
        with open(TRACKING_FILE, 'r') as f:
            f.seek(last_pos)
            line = f.readline()
            
            if not line:
                time.sleep(0.1)
                continue
                
            # Update position for the next loop
            last_pos = f.tell()
            
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
    open(TRACKING_FILE, 'a').close()
    analyze_behaviour()