import { useMemo, useState } from 'react'
import { History, RefreshCw, AlertCircle } from 'lucide-react'
import { severityOf, SEVERITY_STYLES, formatDateTime } from '../lib/severity'

export default function HistoryPanel({ history, status, onRefetch }) {
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return history
    return history.filter((a) => severityOf(a.alert_type) === filter)
  }, [history, filter])

  return (
    <div className="flex h-full flex-col rounded border border-ops-border bg-ops-panel">
      <div className="flex items-center justify-between border-b border-ops-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-slate-300">
          <History size={14} />
          <span className="font-mono text-xs tracking-wide">ALERT HISTORY</span>
        </div>
        <div className="flex items-center gap-2">
          <FilterPill label="ALL" active={filter === 'all'} onClick={() => setFilter('all')} />
          <FilterPill label="CRIT" active={filter === 'critical'} onClick={() => setFilter('critical')} tone="text-signal-red" />
          <FilterPill label="WARN" active={filter === 'warning'} onClick={() => setFilter('warning')} tone="text-signal-amber" />
          <button
            onClick={onRefetch}
            className="ml-1 flex items-center gap-1 rounded border border-ops-border px-2 py-1 text-slate-400 hover:border-signal-green/40 hover:text-signal-green transition-colors"
          >
            <RefreshCw size={12} className={status === 'loading' ? 'animate-spin' : ''} />
            <span className="font-mono text-[10px]">REFRESH</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-signal-red">
            <AlertCircle size={20} />
            <p className="font-mono text-xs">FAILED TO REACH /alerts — retry when backend is up</p>
          </div>
        )}

        {status !== 'error' && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-600">
            <History size={20} />
            <p className="font-mono text-xs">
              {status === 'loading' ? 'LOADING HISTORY…' : 'NO HISTORICAL ALERTS'}
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 bg-ops-panel2">
              <tr className="border-b border-ops-border text-slate-500">
                <th className="px-4 py-2 font-mono text-[10px] font-medium tracking-wider">TRACK ID</th>
                <th className="px-4 py-2 font-mono text-[10px] font-medium tracking-wider">ALERT TYPE</th>
                <th className="px-4 py-2 font-mono text-[10px] font-medium tracking-wider">SEVERITY</th>
                <th className="px-4 py-2 font-mono text-[10px] font-medium tracking-wider">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert, i) => {
                const sev = severityOf(alert.alert_type)
                const style = SEVERITY_STYLES[sev]
                return (
                  <tr
                    key={`${alert.track_id}-${alert.timestamp}-${i}`}
                    className="border-b border-ops-border/60 hover:bg-ops-panel2/60 transition-colors"
                  >
                    <td className="px-4 py-2 font-mono text-xs text-slate-300">{alert.track_id}</td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-300">{alert.alert_type}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ${style.text} ${style.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {sev.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-500 font-mono-nums">
                      {formatDateTime(alert.timestamp)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function FilterPill({ label, active, onClick, tone = 'text-signal-green' }) {
  return (
    <button
      onClick={onClick}
      className={`rounded border px-2 py-1 font-mono text-[10px] tracking-wider transition-colors ${
        active
          ? `border-current ${tone} bg-white/5`
          : 'border-ops-border text-slate-500 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  )
}
