import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Completing sign in...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          setStatus('Sign in failed. Redirecting...')
          setTimeout(() => navigate('/signup'), 2000)
          return
        }

        localStorage.setItem('remotestreak_token', session.access_token)
        localStorage.setItem('remotestreak_user', JSON.stringify(session.user))

        await fetch('/api/auth/google-user', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })

        const cookies = document.cookie.split(';').reduce((acc, c) => {
          const [k, v] = c.trim().split('=')
          acc[k] = v
          return acc
        }, {})

        const plan = cookies['rs_plan']

        if (plan) {
          localStorage.setItem('remotestreak_selected_plan', plan)
          document.cookie = 'rs_plan=;path=/;max-age=0'
          navigate(`/signup?plan=${plan}&authenticated=true`)
        } else {
          navigate('/dashboard')
        }
      } catch (err) {
        navigate('/signup')
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#00E5A0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#8A9BB0] font-mono text-sm">{status}</p>
      </div>
    </div>
  )
}
