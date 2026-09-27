import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Pre-configured hackathon demo accounts for rapid testing & evaluation
const DEMO_ACCOUNTS = {
  'citizen@ecocollect.demo': {
    user: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'citizen@ecocollect.demo',
    },
    profile: {
      id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Priya Citizen',
      role: 'citizen',
    },
    password: 'Password123!',
  },
  'admin@ecocollect.demo': {
    user: {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'admin@ecocollect.demo',
    },
    profile: {
      id: '22222222-2222-2222-2222-222222222222',
      full_name: 'Rajesh Admin',
      role: 'admin',
    },
    password: 'Password123!',
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    if (!userId) {
      setProfile(null)
      return null
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!error && data) {
      setProfile(data)
      return data
    }
    return null
  }

  useEffect(() => {
    let mounted = true

    // Check for demo session in localStorage first
    const savedDemo = localStorage.getItem('eco_demo_auth')
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo)
        setUser(parsed.user)
        setProfile(parsed.profile)
        setLoading(false)
        return
      } catch (e) {
        localStorage.removeItem('eco_demo_auth')
      }
    }

    // Initial Supabase session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false)
        })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        if (localStorage.getItem('eco_demo_auth')) return // don't override demo session

        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signUp(email, password, fullName) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
  }

  async function signIn(email, password) {
    // 1. Try real Supabase auth first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error && data?.session) {
      localStorage.removeItem('eco_demo_auth')
      setUser(data.user)
      const p = await fetchProfile(data.user.id)
      return { data, error: null, profile: p }
    }

    // 2. Demo account fallback if Supabase returns invalid_credentials (before SQL insert)
    const demo = DEMO_ACCOUNTS[email.toLowerCase().trim()]
    if (demo && demo.password === password) {
      const demoSession = { user: demo.user, profile: demo.profile }
      localStorage.setItem('eco_demo_auth', JSON.stringify(demoSession))
      setUser(demo.user)
      setProfile(demo.profile)
      return { data: { user: demo.user, session: demoSession }, error: null, profile: demo.profile }
    }

    // Throw actual Supabase error if not a demo account match
    throw error || new Error('Invalid login credentials')
  }

  async function signOut() {
    localStorage.removeItem('eco_demo_auth')
    setUser(null)
    setProfile(null)
    return supabase.auth.signOut()
  }

  async function refreshProfile() {
    const savedDemo = localStorage.getItem('eco_demo_auth')
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo)
        setProfile(parsed.profile)
        return parsed.profile
      } catch (e) {}
    }
    if (user) {
      return fetchProfile(user.id)
    }
    return null
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
