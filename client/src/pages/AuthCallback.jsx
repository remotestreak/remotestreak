import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Completing sign in...')

  useEffect(() => {
    console.log('AuthCallback loaded')
    console.log('Full URL:', window.location.href)
    console.log('Hash:', window.location.hash)
    console.log('Search:', window.location.search)

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Session:', session)
      console.log('Error:', error)

      if (session) {
        const plan = localStorage.getItem('remotestreak_selected_plan')
        console.log('Plan from localStorage:', plan)
        localStorage.setItem('remotestreak_token', session.access_token)

        fetch('/api/auth/google-user', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` }
        }).then(() => {
          if (plan) {
            window.location.href = `/signup?plan=${plan}&authenticated=true`
          } else {
            window.location.href = '/dashboard'
          }
        })
      } else {
        supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth event:', event, session)
          if (event === 'SIGNED_IN' && session) {
            const plan = localStorage.getItem('remotestreak_selected_plan')
            localStorage.setItem('remotestreak_token', session.access_token)

            fetch('/api/auth/google-user', {
              method: 'POST',
              headers: { Authorization: `Bearer ${session.access_token}` }
            }).then(() => {
              if (plan) {
                window.location.href = `/signup?plan=${plan}&authenticated=true`
              } else {
                window.location.href = '/dashboard'
              }
            })
          }
        })
      }
    })
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
