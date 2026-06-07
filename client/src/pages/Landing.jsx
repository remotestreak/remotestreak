import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00E5A0] rounded-lg flex items-center justify-center">
            <span className="text-[#0A0F1E] font-bold text-sm font-mono">RS</span>
          </div>
          <span className="font-syne font-bold text-xl">RemoteStreak</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-[#8A9BB0] hover:text-white transition-colors text-sm">Login</button>
          <button onClick={() => navigate('/signup')} className="bg-[#00E5A0] text-[#0A0F1E] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all">Start Free</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[#111827] border border-[#1E293B] rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 bg-[#00E5A0] rounded-full pulse-green"></div>
          <span className="text-[#8A9BB0] text-sm font-mono">Agent active — applying while you sleep</span>
        </div>

        <h1 className="font-syne font-bold text-5xl md:text-6xl leading-tight mb-6">
          Your AI agent applies to
          <span className="text-[#00E5A0]"> remote jobs</span>
          <br />while you focus on living
        </h1>

        <p className="text-[#8A9BB0] text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Build your agent once. It discovers remote roles, writes personalised applications,
          and sends them on your behalf — 24 hours a day, 7 days a week.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button onClick={() => navigate('/signup')} className="bg-[#00E5A0] text-[#0A0F1E] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all">
            Launch Your Agent
          </button>
          <button className="border border-[#1E293B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:border-[#00E5A0] transition-all">
            See How It Works
          </button>
        </div>
        <p className="text-[#8A9BB0] text-sm mt-6">Starting at $12/month · Cancel anytime · Remote roles only</p>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="grid grid-cols-3 gap-6">
          {[
            { number: '100%', label: 'Remote roles only' },
            { number: '24/7', label: 'Agent always working' },
            { number: '3x', label: 'More replies than manual' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 text-center card-hover">
              <div className="font-syne font-bold text-3xl text-[#00E5A0] mb-2">{stat.number}</div>
              <div className="text-[#8A9BB0] text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <h2 className="font-syne font-bold text-3xl text-center mb-12">How RemoteStreak works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Build Your Agent', desc: 'Upload your CV, record a Loom intro, and answer a few questions. The more you share, the better your agent represents you.' },
            { step: '02', title: 'Agent Discovers Jobs', desc: 'Your agent monitors Telegram channels, job boards, and funded startups — finding remote roles that match your profile 24/7.' },
            { step: '03', title: 'Applications Sent', desc: 'Personalised emails go out automatically. You wake up to replies — not to-do lists.' }
          ].map((item, i) => (
            <div key={i} className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 card-hover">
              <div className="font-mono text-[#00E5A0] text-sm mb-3">{item.step}</div>
              <h3 className="font-syne font-bold text-xl mb-3">{item.title}</h3>
              <p className="text-[#8A9BB0] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <h2 className="font-syne font-bold text-3xl text-center mb-4">Simple pricing</h2>
        <p className="text-[#8A9BB0] text-center mb-12">Start your streak today. Upgrade anytime.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {[
            {
              name: 'Streak Starter', price: '$12',
              features: ['40 job applications/month', '2 cold founder outreach/day', 'Email + Google Form applications', 'Agent Strength Score', 'Auto follow-up after 7 days', 'Top-up credits available'],
              cta: 'Start Streak', highlight: false
            },
            {
              name: 'Streak Core', price: '$25',
              features: ['120 job applications/month', '3 cold founder outreach/day', 'Full Agent Vault', 'Reply tracking', 'Application analytics', 'Priority slot matching'],
              cta: 'Go Core', highlight: true
            }
          ].map((plan, i) => (
            <div key={i} className={`rounded-2xl p-6 border ${plan.highlight ? 'border-[#00E5A0] bg-[#111827]' : 'border-[#1E293B] bg-[#111827]'}`}>
              {plan.highlight && <div className="text-[#00E5A0] text-xs font-mono mb-3">MOST POPULAR</div>}
              <div className="font-syne font-bold text-xl mb-1">{plan.name}</div>
              <div className="font-syne font-bold text-4xl text-[#00E5A0] mb-6">{plan.price}<span className="text-[#8A9BB0] text-base font-normal">/mo</span></div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-[#8A9BB0]">
                    <span className="text-[#00E5A0]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')} className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.highlight ? 'bg-[#00E5A0] text-[#0A0F1E] hover:bg-opacity-90' : 'border border-[#1E293B] text-white hover:border-[#00E5A0]'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-[#1E293B] px-8 py-8 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#00E5A0] rounded flex items-center justify-center">
              <span className="text-[#0A0F1E] font-bold text-xs font-mono">RS</span>
            </div>
            <span className="font-syne font-bold text-sm">RemoteStreak</span>
          </div>
          <p className="text-[#8A9BB0] text-xs">© 2026 RemoteStreak. Built for remote professionals worldwide.</p>
        </div>
      </footer>
    </div>
  )
}
