import { useState, useCallback, useEffect } from 'react'
import { Video, VideoOff, RotateCw, TriangleAlert } from 'lucide-react'
import { severityOf, formatTime } from '../lib/severity'
import { VIDEO_FEED_URL, VIDEOS_URL } from '../lib/config'

const FEED_COPY = {
  connecting: { label: 'CONNECTING…', dotClass: 'bg-signal-amber animate-pulseDot' },
  live: { label: 'FEED ACTIVE', dotClass: 'bg-signal-green animate-pulseDot' },
  offline: { label: 'FEED OFFLINE', dotClass: 'bg-signal-red' },
}

export default function CameraFeed({ liveAlerts }) {
  const [feedStatus, setFeedStatus] = useState('connecting') // connecting | live | offline
  const [reloadNonce, setReloadNonce] = useState(0)
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState('')
  const [videoStatus, setVideoStatus] = useState('loading')

  useEffect(() => {
    fetch(VIDEOS_URL)
      .then((response) => response.json())
      .then(({ videos: availableVideos, selected }) => {
        setVideos(availableVideos)
        setSelectedVideo(selected || '')
        setVideoStatus(availableVideos.length ? 'ready' : 'empty')
      })
      .catch(() => setVideoStatus('offline'))
  }, [])

  async function handleVideoChange(event) {
    const videoName = event.target.value
    setSelectedVideo(videoName)
    setFeedStatus('connecting')

    try {
      await fetch(`${VIDEOS_URL}/${encodeURIComponent(videoName)}`, { method: 'POST' })
      setReloadNonce((nonce) => nonce + 1)
    } catch {
      setFeedStatus('offline')
    }
  }

  const handleLoad = useCallback(() => setFeedStatus('live'), [])
  const handleError = useCallback(() => setFeedStatus('offline'), [])
  const handleReconnect = useCallback(() => {
    setFeedStatus('connecting')
    setReloadNonce((n) => n + 1) // forces a fresh <img> src, reopening the MJPEG connection
  }, [])

  // Real bounding boxes are already burned into the stream by detect_track.py.
  // The zone-line / critical banner here are still driven by genuine alert data.
  const zoneBreached = liveAlerts.slice(0, 5).some((a) => severityOf(a.alert_type) === 'critical')
  const status = FEED_COPY[feedStatus]

  return (
    <div className="flex h-full flex-col rounded border border-ops-border bg-ops-panel">
      <div className="flex items-center justify-between border-b border-ops-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-slate-300">
          <Video size={15} />
          <span className="font-mono text-xs tracking-wide">CAM-04 · NORTH PERIMETER (LIVE DETECTION)</span>
        </div>
        <div className="flex items-center gap-3">
          {videoStatus === 'ready' && (
            <label className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Source</span>
              <select
                value={selectedVideo}
                onChange={handleVideoChange}
                className="max-w-[180px] rounded border border-ops-border bg-ops-panel2 px-2 py-1 font-mono text-[10px] text-slate-300 outline-none focus:border-signal-green/50"
                aria-label="Select video source"
              >
                {videos.map((video) => (
                  <option key={video} value={video}>{video}</option>
                ))}
              </select>
            </label>
          )}
          <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
          <span className="font-mono text-[11px] text-slate-500">{status.label}</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden bg-[#060a0e]">
        {feedStatus !== 'offline' && (
          <img
            key={reloadNonce}
            src={`${VIDEO_FEED_URL}?stream=${reloadNonce}`}
            onLoad={handleLoad}
            onError={handleError}
            alt="Live annotated CCTV feed from detect_track.py"
            className="absolute inset-0 h-full w-full object-contain bg-black"
          />
        )}

        {feedStatus === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600">
            <Video size={26} className="animate-pulse" />
            <p className="font-mono text-xs">CONNECTING TO /video_feed…</p>
          </div>
        )}

        {feedStatus === 'offline' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-600">
            <VideoOff size={26} />
            <p className="font-mono text-xs text-center px-6">
              NO SIGNAL — is detect_track.py running against a video in backend/data?
            </p>
            <button
              onClick={handleReconnect}
              className="flex items-center gap-1.5 rounded border border-ops-border px-3 py-1.5 text-slate-400 hover:border-signal-green/40 hover:text-signal-green transition-colors"
            >
              <RotateCw size={12} />
              <span className="font-mono text-[10px] tracking-wider">RETRY</span>
            </button>
          </div>
        )}

        {/* zone status overlay — real data, not decoration */}
        <div className="pointer-events-none absolute right-3 top-3">
          <span
            className={`rounded px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider ${
              zoneBreached
                ? 'bg-signal-red/15 text-signal-red border border-signal-red/40'
                : 'bg-signal-green/10 text-signal-green border border-signal-green/30'
            }`}
          >
            ZONE LINE — {zoneBreached ? 'BREACHED' : 'SECURE'}
          </span>
        </div>

        <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] text-slate-500">
          <p className="font-mono-nums">{formatTime(new Date())}</p>
        </div>

        {zoneBreached && (
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded border border-signal-red/40 bg-signal-red/10 px-2 py-1 text-signal-red">
            <TriangleAlert size={13} />
            <span className="font-mono text-[10px] font-medium tracking-wide">CRITICAL ALERT ACTIVE</span>
          </div>
        )}
      </div>
    </div>
  )
}
