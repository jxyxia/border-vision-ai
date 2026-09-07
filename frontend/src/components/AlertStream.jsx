import { Radio, Fingerprint, Clock } from 'lucide-react'
import { severityOf, SEVERITY_STYLES, formatTime } from '../lib/severity'

export default function AlertStream({ liveAlerts }) {
  return (
    <div className="flex h-full flex-col rounded border border-ops-border bg-ops-panel">
      <div className="flex items-center justify-between border-b border-ops-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-slate-300">
          <Radio size={14} />
          <span className="font-mono text-xs tracking-wide">LIVE ALERT STREAM</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">{liveAlerts.length} EVENTS</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {liveAlerts.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-slate-600">
            <Radio size={20} />
            <p className="font-mono text-xs">AWAITING TRANSMISSION…</p>
          </div>
        )}

        <ul className="space-y-1.5">
          {liveAlerts.map((alert, i) => {
            const sev = severityOf(alert.alert_type)
            const style = SEVERITY_STYLES[sev]
            return (
              <li
                key={`${alert.track_id}-${alert.timestamp}-${i}`}
                className={`rounded border ${style.border} ${style.bg} px-3 py-2 animate-[fadeIn_0.2s_ease-out]`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[11px] font-semibold tracking-wide ${style.text}`}>
                    {alert.alert_type.toUpperCase()}
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                </div>
                <div className="mt-1 flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Fingerprint size={11} />
                    {alert.track_id}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] font-mono-nums">
                    <Clock size={11} />
                    {formatTime(alert.timestamp)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
