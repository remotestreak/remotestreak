import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        navigate('/login')
        return
      }

      const token = session.access_token
      localStorage.setItem('remotestreak_token', token)

      try {
        const res = await axios.get('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setData(res.data)
        setLoading(false)
      } catch {
        navigate('/login')
      }
    }
    loadDashboard()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#00E5A0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#8A9BB0] font-mono text-sm">Loading your agent...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00E5A0] rounded-lg flex items-center justify-center">
            <span className="text-[#0A0F1E] font-bold text-sm font-mono">RS</span>
          </div>
          <span className="font-syne font-bold text-xl">RemoteStreak</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00E5A0] rounded-full pulse-green"></div>
            <span className="text-[#8A9BB0] text-sm font-mono">Agent Active</span>
          </div>
          <div className="flex items-center gap-2 bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2">
            <span className="text-[#00E5A0] font-mono font-bold">{data?.streak?.current_streak || 0}</span>
            <span className="text-[#8A9BB0] text-sm">day streak</span>
          </div>
          <button
            onClick={() => { localStorage.clear(); navigate('/') }}
            className="text-[#8A9BB0] hover:text-white text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Agent Strength */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
            <p className="text-[#8A9BB0] text-sm mb-2">Agent Strength</p>
            <div className="flex items-end gap-2">
              <span className="font-syne font-bold text-4xl text-[#00E5A0]">{data?.agent_strength || 0}%</span>
            </div>
            <div className="mt-3 h-2 bg-[#1E293B] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00E5A0] rounded-full transition-all"
                style={{ width: `${data?.agent_strength || 0}%` }}
              ></div>
            </div>
            <p className="text-[#8A9BB0] text-xs mt-2">
              {data?.agent_strength < 50 ? 'Complete your profile to strengthen your agent' : 'Your agent is well trained'}
            </p>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
            <p className="text-[#8A9BB0] text-sm mb-2">Credits Remaining</p>
            <span className="font-syne font-bold text-4xl text-white">{data?.credits_remaining || 0}</span>
            <p className="text-[#8A9BB0] text-xs mt-2">applications this month</p>
            <button className="mt-3 text-[#00E5A0] text-xs hover:underline">
              Buy top-up →
            </button>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
            <p className="text-[#8A9BB0] text-sm mb-2">Applications Sent</p>
            <span className="font-syne font-bold text-4xl text-white">
              {data?.applications?.length || 0}
            </span>
            <p className="text-[#8A9BB0] text-xs mt-2">total this month</p>
          </div>
        </div>

        {/* Strength Profile */}
        {data?.strength && (
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 mb-8">
            <h2 className="font-syne font-bold text-lg mb-4">How your agent pitches you</h2>
            <div className="bg-[#0A0F1E] rounded-xl p-4 mb-4">
              <p className="text-[#00E5A0] text-sm font-mono mb-1">Primary Strength</p>
              <p className="text-white">{data.strength.primary_strength}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.strength.strength_tags?.map((tag, i) => (
                <span key={i} className="bg-[#1E293B] text-[#8A9BB0] text-xs px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Complete Profile Prompt */}
        {data?.agent_strength < 80 && (
          <div className="bg-[#111827] border border-[#00E5A0] border-opacity-30 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-syne font-bold text-lg mb-1">Strengthen your agent</h3>
                <p className="text-[#8A9BB0] text-sm">The more you build your agent, the better it represents you while you are away</p>
              </div>
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-[#00E5A0] text-[#0A0F1E] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-all whitespace-nowrap ml-4"
              >
                Build Agent →
              </button>
            </div>
          </div>
        )}

        {/* Applications */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
          <h2 className="font-syne font-bold text-lg mb-6">Applications</h2>
          {data?.applications?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-[#1E293B] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <p className="text-[#8A9BB0] mb-2">Your agent hasn't applied yet</p>
              <p className="text-[#8A9BB0] text-sm">Complete your profile to activate automatic applications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.applications.map((app, i) => (
                <div key={i} className="flex items-center justify-between bg-[#0A0F1E] rounded-xl p-4">
                  <div>
                    <p className="font-semibold text-sm">{app.email_subject}</p>
                    <p className="text-[#8A9BB0] text-xs mt-1">{new Date(app.sent_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-mono ${
                    app.status === 'Replied' 
                      ? 'bg-green-900 bg-opacity-30 text-[#00E5A0]'
                      : app.status === 'Follow-up Sent'
                      ? 'bg-blue-900 bg-opacity-30 text-blue-400'
                      : 'bg-[#1E293B] text-[#8A9BB0]'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
