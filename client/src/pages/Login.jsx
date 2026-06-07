import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/auth/login', form)
      localStorage.setItem('remotestreak_token', res.data.session.access_token)
      localStorage.setItem('remotestreak_user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#00E5A0] rounded-lg flex items-center justify-center">
              <span className="text-[#0A0F1E] font-bold text-sm font-mono">RS</span>
            </div>
            <span className="font-syne font-bold text-xl">RemoteStreak</span>
          </div>
          <h1 className="font-syne font-bold text-3xl mb-2">Welcome back</h1>
          <p className="text-[#8A9BB0]">Your agent missed you</p>
        </div>

        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-8">
          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-500 border-opacity-30 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#8A9BB0] mb-2 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0] transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm text-[#8A9BB0] mb-2 block">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0] transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#00E5A0] text-[#0A0F1E] py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <p className="text-center text-[#8A9BB0] text-sm mt-6">
            No account?{' '}
            <span
              onClick={() => navigate('/signup')}
              className="text-[#00E5A0] cursor-pointer hover:underline"
            >
              Sign up free
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
