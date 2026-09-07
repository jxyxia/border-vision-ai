import { ShieldAlert, Wifi, WifiOff, Loader2 } from 'lucide-react'

const STATUS_COPY = {
  connecting: { label: 'CONNECTING', icon: Loader2, tone: 'text-signal-amber', spin: true },
  online: { label: 'LIVE', icon: Wifi, tone: 'text-signal-green', spin: false },
  offline: { label: 'RECONNECTING', icon: WifiOff, tone: 'text-signal-red', spin: false },
}

export default function Header({ connectionStatus, liveCount, onLogout }) {
  const status = STATUS_COPY[connectionStatus] ?? STATUS_COPY.connecting
  const StatusIcon = status.icon

  return (
    <header className="flex items-center justify-between border-b border-ops-border bg-ops-panel px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded border border-signal-green/40 bg-signal-green/10">
          <ShieldAlert size={18} className="text-signal-green" />
        </div>
        <div>
          <h1 className="font-mono text-sm font-semibold tracking-wide text-slate-100">
            BORDER WATCH
          </h1>
          <p className="text-xs text-slate-500">AI Surveillance Console</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden text-right sm:block">
          <p className="text-xs text-slate-500">Alerts this session</p>
          <p className="font-mono text-sm font-semibold text-slate-200">{liveCount}</p>
        </div>
        <div className={`flex items-center gap-2 rounded border border-ops-border bg-ops-panel2 px-3 py-1.5 ${status.tone}`}>
          <StatusIcon size={14} className={status.spin ? 'animate-spin' : ''} />
          <span className="font-mono text-xs font-medium tracking-wider">{status.label}</span>
        </div>
        <button
          onClick={onLogout}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 transition hover:border-red-400 hover:text-red-300"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
