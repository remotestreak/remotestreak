import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [step1, setStep1] = useState({
    linkedin_url: '',
    current_title: '',
    years_experience: '',
    target_role_types: [],
    timezone: '',
    contract_type: '',
    salary_min: 500,
    salary_max: 3000,
    industries_to_avoid: []
  })

  const [step2, setStep2] = useState({
    daily_tools: [],
    main_tasks: '',
    hired_for: '',
    proudest_result: '',
    superpower: '',
    work_style: '',
    culture_fit: ''
  })

  const token = localStorage.getItem('remotestreak_token')

  const roleTypes = [
    'Executive VA', 'Social Media VA', 'Appointment Setter',
    'Admin VA', 'Project Coordinator', 'Customer Support VA',
    'Research VA', 'Other'
  ]

  const tools = [
    'Notion', 'Asana', 'HubSpot', 'Calendly', 'Buffer',
    'Apollo', 'GoHighLevel', 'Trello', 'Slack', 'Zoom',
    'Google Workspace', 'Canva', 'Monday.com', 'ClickUp'
  ]

  const toggleItem = (arr, item) =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]

  const submitStep1 = async () => {
    if (!step1.linkedin_url.includes('linkedin.com/in/')) {
      return setError('Please enter a valid LinkedIn profile URL')
    }
    setLoading(true)
    setError('')
    try {
      await axios.post('/api/onboarding/step1', step1, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving step 1')
    }
    setLoading(false)
  }

  const submitStep2 = async () => {
    if (!step2.proudest_result || !step2.superpower) {
      return setError('Please fill in your proudest result and superpower')
    }
    setLoading(true)
    setError('')
    try {
      await axios.post('/api/onboarding/step2', step2, {
        headers: { Authorization: `Bearer ${token}` }
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving step 2')
    }
    setLoading(false)
  }

  const strengthScore = step === 1 ? 20 : 50

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00E5A0] rounded-lg flex items-center justify-center">
            <span className="text-[#0A0F1E] font-bold text-sm font-mono">RS</span>
          </div>
          <span className="font-syne font-bold text-xl">RemoteStreak</span>
        </div>
        <div className="text-[#8A9BB0] text-sm font-mono">Step {step} of 4</div>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Agent Strength Meter */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[#8A9BB0]">Agent Strength</p>
            <span className="font-mono font-bold text-[#00E5A0]">{strengthScore}%</span>
          </div>
          <div className="h-3 bg-[#1E293B] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00E5A0] rounded-full transition-all duration-500"
              style={{ width: `${strengthScore}%` }}
            ></div>
          </div>
          <p className="text-[#8A9BB0] text-xs mt-2">
            The more you build your agent, the better it represents you while you are away
          </p>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 border-opacity-30 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="fade-in">
            <h1 className="font-syne font-bold text-3xl mb-2">The Basics</h1>
            <p className="text-[#8A9BB0] mb-8">Tell your agent who you are and what you are looking for</p>

            <div className="space-y-6">
              <div>
                <label className="text-sm text-[#8A9BB0] mb-2 block">
                  LinkedIn Profile URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={step1.linkedin_url}
                  onChange={e => setStep1({...step1, linkedin_url: e.target.value})}
                  className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0] transition-colors"
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>

              <div>
                <label className="text-sm text-[#8A9BB0] mb-2 block">Current Job Title</label>
                <input
                  type="text"
                  value={step1.current_title}
                  onChange={e => setStep1({...step1, current_title: e.target.value})}
                  className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0] transition-colors"
                  placeholder="Virtual Assistant"
                />
              </div>

              <div>
                <label className="text-sm text-[#8A9BB0] mb-2 block">Years of Experience</label>
                <select
                  value={step1.years_experience}
                  onChange={e => setStep1({...step1, years_experience: e.target.value})}
                  className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0] transition-colors"
                >
                  <option value="">Select...</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-3">1 to 3 years</option>
                  <option value="3-5">3 to 5 years</option>
                  <option value="5-10">5 to 10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[#8A9BB0] mb-3 block">Target Role Types</label>
                <div className="flex flex-wrap gap-2">
                  {roleTypes.map(role => (
                    <button
                      key={role}
                      onClick={() => setStep1({
                        ...step1,
                        target_role_types: toggleItem(step1.target_role_types, role)
                      })}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        step1.target_role_types.includes(role)
                          ? 'bg-[#00E5A0] text-[#0A0F1E] font-semibold'
                          : 'bg-[#1E293B] text-[#8A9BB0] hover:border-[#00E5A0] border border-transparent'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-[#8A9BB0] mb-2 block">Preferred Contract Type</label>
                <div className="flex gap-3">
                  {['Remote Contract', 'Remote Full-time', 'Either'].map(type => (
                    <button
                      key={type}
                      onClick={() => setStep1({...step1, contract_type: type})}
                      className={`flex-1 py-3 rounded-xl text-sm transition-all ${
                        step1.contract_type === type
                          ? 'bg-[#00E5A0] text-[#0A0F1E] font-semibold'
                          : 'bg-[#1E293B] text-[#8A9BB0]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-[#8A9BB0] mb-2 block">
                  Monthly Salary Expectation (USD): ${step1.salary_min} — ${step1.salary_max}
                </label>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={step1.salary_max}
                  onChange={e => setStep1({...step1, salary_max: parseInt(e.target.value)})}
                  className="w-full accent-[#00E5A0]"
                />
              </div>

              <button
                onClick={submitStep1}
                disabled={loading}
                className="w-full bg-[#00E5A0] text-[#0A0F1E] py-4 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Continue to Career Story →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="fade-in">
            <h1 className="font-syne font-bold text-3xl mb-2">Your Career Story</h1>
            <p className="text-[#8A9BB0] mb-8">This is what your agent uses to pitch you — be specific and honest</p>

            <div className="space-y-6">
              <div>
                <label className="text-sm text-[#8A9BB0] mb-3 block">Tools You Use Daily</label>
                <div className="flex flex-wrap gap-2">
                  {tools.map(tool => (
                    <button
                      key={tool}
                      onClick={() => setStep2({
                        ...step2,
                        daily_tools: toggleItem(step2.daily_tools, tool)
                      })}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        step2.daily_tools.includes(tool)
                          ? 'bg-[#00E5A0] text-[#0A0F1E] font-semibold'
                          : 'bg-[#1E293B] text-[#8A9BB0]'
                      }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-[#8A9BB0] mb-2 block">What tasks do you spend most working time on?</label>
                <textarea
                  value={step2.main_tasks}
                  onChange={e => setStep2({...step2, main_tasks: e.target.value})}
                  rows={3}
                  className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0] transition-colors resize-none"
                  placeholder="e.g. Managing founder calendars, drafting emails, scheduling social posts..."
                />
              </div>

              <div>
                <label className="text-sm text-[#8A9BB0] mb-2 block">What have clients hired you specifically for most often?</label>
                <textarea
                  value={step2.hired_for}
                  onChange={e => setStep2({...step2, hired_for: e.target.value})}
                  rows={3}
                  className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0] transition-colors resize-none"
                  placeholder="e.g. Appointment setting, inbox management, social media scheduling..."
                />
              </div>

              <div>
                <label className="text-sm text-[#8A9BB0] mb-2 block">
                  Your proudest result delivered for a client <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={step2.proudest_result}
                  onChange={e => setStep2({...step2, proudest_result: e.target.value})}
                  rows={4}
                  className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0] transition-colors resize-none"
                  placeholder="Be specific — numbers, outcomes, and timeframes make your agent's pitch far stronger. e.g. Booked 45 qualified sales calls in one month for a B2B SaaS client using Apollo..."
                />
              </div>

              <div>
                <label className="text-sm text-[#8A9BB0] mb-2 block">
                  What would your best client say is your superpower? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={step2.superpower}
                  onChange={e => setStep2({...step2, superpower: e.target.value})}
                  rows={3}
                  className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0] transition-colors resize-none"
                  placeholder="e.g. I anticipate needs before they are asked, communicate clearly across time zones..."
                />
              </div>

              <div>
                <label className="text-sm text-[#8A9BB0] mb-3 block">Preferred Work Style</label>
                <div className="flex flex-wrap gap-3">
                  {['Async-first', 'Collaborative', 'Self-directed', 'Flexible'].map(style => (
                    <button
                      key={style}
                      onClick={() => setStep2({...step2, work_style: style})}
                      className={`px-4 py-2 rounded-xl text-sm transition-all ${
                        step2.work_style === style
                          ? 'bg-[#00E5A0] text-[#0A0F1E] font-semibold'
                          : 'bg-[#1E293B] text-[#8A9BB0]'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-[#8A9BB0] mb-3 block">Culture Preference</label>
                <div className="flex flex-wrap gap-3">
                  {['Early-stage startup', 'Agency', 'Scaleup', 'Corporate', 'No preference'].map(culture => (
                    <button
                      key={culture}
                      onClick={() => setStep2({...step2, culture_fit: culture})}
                      className={`px-4 py-2 rounded-xl text-sm transition-all ${
                        step2.culture_fit === culture
                          ? 'bg-[#00E5A0] text-[#0A0F1E] font-semibold'
                          : 'bg-[#1E293B] text-[#8A9BB0]'
                      }`}
                    >
                      {culture}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-[#1E293B] text-[#8A9BB0] py-4 rounded-xl font-semibold hover:border-[#00E5A0] transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={submitStep2}
                  disabled={loading}
                  className="flex-2 flex-grow bg-[#00E5A0] text-[#0A0F1E] py-4 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Analysing your profile...' : 'Build My Agent →'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
