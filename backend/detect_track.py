# backend/detect_track.py
import cv2
import json
import os
from datetime import datetime
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort

# Config
VIDEO_PATH = "data/test_video.mp4"  # Put your CCTV clip here
OUTPUT_FILE = "data/tracking_output.jsonl"
WINDOW_NAME = "CCTV Tracking (Press 'q' to quit)"
BOUNDARY_Y = 1400  # The Y-coordinate for the restricted border

# Live frame hand-off to the FastAPI backend, so the frontend can show the
# same annotated feed in the browser. main.py's /video_feed endpoint just
# re-reads this file and streams it out as MJPEG.
FRAME_FILE = "data/latest_frame.jpg"
FRAME_TMP_FILE = "data/.latest_frame.tmp.jpg"
SHOW_LOCAL_WINDOW = True  # set False to run headless (frontend-only viewing)

def write_live_frame(frame):
    """Encode + atomically swap in the latest annotated frame.

    Writing to a temp file then os.replace()-ing it avoids the frontend
    (or main.py's stream generator) ever reading a half-written JPEG.
    """
    ok, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    if not ok:
        return
    with open(FRAME_TMP_FILE, "wb") as f:
        f.write(buf.tobytes())
    os.replace(FRAME_TMP_FILE, FRAME_FILE)

def run_tracker():
    # Initialize YOLO and DeepSORT
    model = YOLO("yolov8n.pt")     # Will download weights automatically on first run
    tracker = DeepSort(max_age=30)  # max_age caps how long it remembers a lost ID
    
    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        print(f"Error: Could not open {VIDEO_PATH}. Make sure the file exists.")
        return

    # Clear previous run data
    open(OUTPUT_FILE, 'w').close()

    print("Starting detection and tracking...")
    
    if SHOW_LOCAL_WINDOW:
        # Configure resizable window so it doesn't look zoomed in
        cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(WINDOW_NAME, 960, 540)
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Run YOLO detection - added conf=0.5 to stop false positives (ghost detections)
        results = model(frame, stream=True, verbose=False, conf=0.5)
        detections = []
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # Class 0 is 'person' in COCO dataset
                if int(box.cls[0]) == 0:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = box.conf[0].item()
                    # DeepSORT expects [left, top, width, height]
                    detections.append(([x1, y1, x2 - x1, y2 - y1], conf, 'person'))

        # Update tracker
        tracks = tracker.update_tracks(detections, frame=frame)
        
        # Write to JSONL & annotate
        with open(OUTPUT_FILE, 'a') as f:
            for track in tracks:
                if not track.is_confirmed():
                    continue
                
                track_id = track.track_id
                ltrb = track.to_ltrb()  # Left, Top, Right, Bottom
                cx = (ltrb[0] + ltrb[2]) / 2  # Center X
                cy = (ltrb[1] + ltrb[3]) / 2  # Center Y
                
                data = {
                    "track_id": str(track_id),
                    "cx": cx,
                    "cy": cy,
                    "class": "person",
                    "timestamp": datetime.now().isoformat()
                }
                f.write(json.dumps(data) + "\n")
                
                # Draw boxes and IDs for visual debugging
                cv2.rectangle(frame, (int(ltrb[0]), int(ltrb[1])), (int(ltrb[2]), int(ltrb[3])), (0, 255, 0), 2)
                cv2.putText(frame, f"ID: {track_id}", (int(ltrb[0]), int(ltrb[1]) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Draw the boundary line too, so the browser feed shows it same as the debug window
        cv2.line(frame, (0, BOUNDARY_Y), (frame.shape[1], BOUNDARY_Y), (0, 0, 255), 2)

        # Hand the annotated frame off to main.py for /video_feed
        write_live_frame(frame)

        if SHOW_LOCAL_WINDOW:
            cv2.imshow(WINDOW_NAME, frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    cap.release()
    if SHOW_LOCAL_WINDOW:
        cv2.destroyAllWindows()

if __name__ == "__main__":
    run_tracker()
