import { useEffect, useState, useCallback } from 'react'
import { VIDEOS_URL } from '../lib/config'

/**
 * Lists the annotated clips detect_track.py has written to
 * backend/data/processed/, served by main.py's GET /videos.
 * Each entry: { name, filename, url }.
 */
export function useVideos() {
  const [videos, setVideos] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | ready | error

  const refetch = useCallback(async () => {
    setStatus('loading')
    try {
      const res = await fetch(VIDEOS_URL)
      if (!res.ok) throw new Error(`GET /videos ${res.status}`)
      const data = await res.json()
      setVideos(data.videos ?? [])
      setStatus('ready')
    } catch (err) {
      console.error('[videos] fetch failed:', err)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { videos, status, refetch }
}
