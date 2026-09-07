import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'

const VALID_USERNAME = 'admin'
const VALID_PASSWORD = 'Border@2026'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const storage = rememberDevice ? localStorage : sessionStorage
      storage.setItem('border-watch-authenticated', 'true')
      onLogin()
      return
    }

    setNotice('')
    setError('Invalid username or password')
  }

  function handleRecovery() {
    setError('')
    setNotice('For this demonstration, please contact the system administrator.')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1118] px-4 py-8 text-white sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700/60 bg-[#111923] shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-emerald-400 p-10 text-slate-950 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[36px] border-slate-950/10" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border-[48px] border-slate-950/10" />

          <div className="relative">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 font-bold text-emerald-400">
              BW
            </div>
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-slate-800">
              Border intelligence platform
            </p>
            <h1 className="max-w-sm text-4xl font-bold leading-tight tracking-tight">
              See the perimeter. Stay ahead of the risk.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-800/80">
              A secure command console for real-time detection, tracking, and incident awareness.
            </p>
          </div>

          <div className="relative space-y-4">
            {['Real-time AI video monitoring', 'Intelligent boundary alerts', 'Protected operator access'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 size={18} />
                {item}
              </div>
            ))}
            <p className="pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-800/70">
              Operations console / v1.0
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mb-8 lg:hidden">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 font-bold text-slate-950">
              BW
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-400">Border Watch</p>
          </div>

          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2 text-emerald-400">
              <ShieldCheck size={18} />
              <span className="font-mono text-xs uppercase tracking-[0.2em]">Secure access</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Sign in to access your surveillance console.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Username</span>
            <input
              value={username}
              onChange={(event) => {
                setUsername(event.target.value)
                setError('')
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-emerald-400"
              placeholder="Enter username"
              autoComplete="username"
              required
            />
            </label>

            <label className="block">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Password</span>
                <button type="button" onClick={handleRecovery} className="text-xs text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <LockKeyhole size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError('')
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 py-3 pl-11 pr-12 outline-none transition focus:border-emerald-400"
              placeholder="Enter password"
              autoComplete="current-password"
              required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-400">
              <input type="checkbox" checked={rememberDevice} onChange={(event) => setRememberDevice(event.target.checked)} className="h-4 w-4 accent-emerald-400" />
              Remember this device
            </label>

          {error && (
            <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          {notice && (
            <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
              {notice}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-400 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Enter console
          </button>
        </form>

          <div className="mt-8 border-t border-slate-800 pt-5 text-center">
            <p className="text-xs text-slate-500">Authorized personnel only</p>
            <p className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-600">
              <LockKeyhole size={12} /> Your session is protected and monitored.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
