import { useState } from 'react'
import Header from './components/Header'
import Login from './components/Login'
import CameraFeed from './components/CameraFeed'
import AlertStream from './components/AlertStream'
import HistoryPanel from './components/HistoryPanel'
import { useAlerts } from './hooks/useAlerts'

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    sessionStorage.getItem('border-watch-authenticated') === 'true' ||
      localStorage.getItem('border-watch-authenticated') === 'true',
  )

  const { history, historyStatus, refetchHistory, liveAlerts, connectionStatus } = useAlerts()

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />
  }

  function handleLogout() {
    sessionStorage.removeItem('border-watch-authenticated')
    localStorage.removeItem('border-watch-authenticated')
    setAuthenticated(false)
  }

  return (
    <div className="flex h-screen flex-col bg-ops-bg">
      <Header
        connectionStatus={connectionStatus}
        liveCount={liveAlerts.length}
        onLogout={handleLogout}
      />

      <main className="grid flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-rows-[1fr_260px] gap-3 overflow-hidden">
          <CameraFeed liveAlerts={liveAlerts} connectionStatus={connectionStatus} />
          <HistoryPanel history={history} status={historyStatus} onRefetch={refetchHistory} />
        </div>

        <div className="overflow-hidden">
          <AlertStream liveAlerts={liveAlerts} />
        </div>
      </main>
    </div>
  )
}
