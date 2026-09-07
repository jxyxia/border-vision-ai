import { useEffect, useRef, useState, useCallback } from 'react'
import { ALERTS_URL, LIVE_WS_URL } from '../lib/config'

const RECONNECT_DELAY_MS = 3000
const LIVE_FEED_CAP = 200

/**
 * Owns both data sources for the console:
 *  - REST fetch of historical alerts (for the analytics/history panel)
 *  - WebSocket stream of live alert payloads (for the sidebar + camera overlay)
 *
 * Shape of a payload from either source:
 *   { track_id: string, alert_type: string, timestamp: string }
 */
export function useAlerts() {
  const [history, setHistory] = useState([])
  const [historyStatus, setHistoryStatus] = useState('idle') // idle | loading | ready | error
  const [liveAlerts, setLiveAlerts] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('connecting') // connecting | online | offline

  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)
  const mountedRef = useRef(true)

  const fetchHistory = useCallback(async () => {
    setHistoryStatus('loading')
    try {
      const res = await fetch(ALERTS_URL)
      if (!res.ok) throw new Error(`REST ${res.status}`)
      const data = await res.json()
      if (!mountedRef.current) return
      setHistory(Array.isArray(data) ? data : data.alerts ?? [])
      setHistoryStatus('ready')
    } catch (err) {
      if (!mountedRef.current) return
      console.error('[alerts] history fetch failed:', err)
      setHistoryStatus('error')
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    fetchHistory()

    function connect() {
      setConnectionStatus('connecting')
      const socket = new WebSocket(LIVE_WS_URL)
      wsRef.current = socket

      socket.onopen = () => {
        if (!mountedRef.current) return
        setConnectionStatus('online')
      }

      socket.onmessage = (event) => {
        if (!mountedRef.current) return
        try {
          const payload = JSON.parse(event.data)
          const alert = {
            track_id: payload.track_id,
            alert_type: payload.alert_type,
            timestamp: payload.timestamp ?? new Date().toISOString(),
            _receivedAt: Date.now(),
          }
          setLiveAlerts((prev) => [alert, ...prev].slice(0, LIVE_FEED_CAP))
        } catch (err) {
          console.error('[alerts] malformed WS payload:', err)
        }
      }

      socket.onclose = () => {
        if (!mountedRef.current) return
        setConnectionStatus('offline')
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS)
      }

      socket.onerror = () => {
        socket.close()
      }
    }

    connect()

    return () => {
      mountedRef.current = false
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [fetchHistory])

  return {
    history,
    historyStatus,
    refetchHistory: fetchHistory,
    liveAlerts,
    connectionStatus,
  }
}
