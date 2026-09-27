import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Leaf, ArrowRight, Lock, Mail, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import { useToast } from '../components/ui/Toast'

export default function LoginPage() {
  const { signIn, signUp, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
  })

  const set = (k) => (e) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }))
    if (errorMessage) setErrorMessage('')
  }

  function mapError(err) {
    const msg = (err?.message || '').toLowerCase()
    if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
      return 'Incorrect email or password.'
    }
    if (msg.includes('user already registered')) {
      return 'An account with this email already exists. Try signing in.'
    }
    if (msg.includes('password should be at least')) {
      return 'Password must be at least 6 characters long.'
    }
    if (msg.includes('rate limit')) {
      return 'Rate limit reached. Please disable "Confirm email" in Supabase Authentication settings.'
    }
    return err?.message || 'Authentication failed. Please check your credentials.'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage('')

    if (mode === 'signup' && !form.fullName.trim()) {
      setErrorMessage('Full name is required.')
      return
    }
    if (!form.email.trim() || !form.password) {
      setErrorMessage('Please fill in both email and password.')
      return
    }

    setSubmitting(true)

    try {
      if (mode === 'signin') {
        const { data, error } = await signIn(form.email, form.password)
        if (error) throw error

        toast({ message: 'Welcome back!', type: 'success' })

        // Fetch user's real profile from Supabase to redirect correctly
        const userProfile = await refreshProfile()
        const targetRole = userProfile?.role || 'citizen'

        const from = location.state?.from?.pathname
        if (from && (targetRole === 'admin' || !from.startsWith('/admin'))) {
          navigate(from, { replace: true })
        } else {
          navigate(targetRole === 'admin' ? '/admin/dashboard' : '/citizen/dashboard', {
            replace: true,
          })
        }
      } else {
        // Sign Up Mode
        const { data, error } = await signUp(form.email, form.password, form.fullName.trim())
        if (error) throw error

        toast({
          message: 'Account created successfully! Welcome to EcoCollect.',
          type: 'success',
        })

        // Wait for profile trigger to register
        await new Promise((r) => setTimeout(r, 600))
        const userProfile = await refreshProfile()
        const targetRole = userProfile?.role || 'citizen'

        navigate(targetRole === 'admin' ? '/admin/dashboard' : '/citizen/dashboard', {
          replace: true,
        })
      }
    } catch (err) {
      const friendly = mapError(err)
      setErrorMessage(friendly)
      toast({ message: friendly, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-md bg-forest flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <span
            className="font-display font-semibold text-ink text-2xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            EcoCollect
          </span>
        </Link>
        <h2
          className="text-2xl font-display font-semibold text-ink"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {mode === 'signin' ? 'Sign in to your account' : 'Create a citizen account'}
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          {mode === 'signin'
            ? 'Track your waste pickups and neighborhood recycling'
            : 'Join the smart recycling initiative in Pune'}
        </p>
      </div>

      {/* Main Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-6 sm:p-8 bg-white border border-sage-line shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-md bg-clay/10 border border-clay/30 text-xs text-clay">
                {errorMessage}
              </div>
            )}

            {mode === 'signup' && (
              <FormField
                id="auth-name"
                label="Full name"
                required
                value={form.fullName}
                onChange={set('fullName')}
                placeholder="Priya Desai"
              />
            )}

            <FormField
              id="auth-email"
              type="email"
              label="Email address"
              required
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
            />

            <FormField
              id="auth-password"
              type="password"
              label="Password"
              required
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              hint={mode === 'signup' ? 'Must be at least 6 characters' : undefined}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={submitting}
              disabled={submitting}
            >
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {/* Quick Hackathon Demo Credentials */}
          <div className="mt-5 p-3 rounded-lg bg-sage/30 border border-sage-line text-left">
            <p className="text-xs font-semibold text-forest mb-2">
              Hackathon Quick-Fill Credentials
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setForm({ fullName: '', email: 'citizen@ecocollect.demo', password: 'Password123!' })
                  setErrorMessage('')
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white border border-sage-line hover:border-forest/40 transition-colors text-left text-xs"
              >
                <div>
                  <span className="font-medium text-ink">Citizen: </span>
                  <span className="font-mono text-ink/70">citizen@ecocollect.demo</span>
                </div>
                <span className="text-[11px] text-forest font-medium">Use →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setForm({ fullName: '', email: 'admin@ecocollect.demo', password: 'Password123!' })
                  setErrorMessage('')
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white border border-sage-line hover:border-forest/40 transition-colors text-left text-xs"
              >
                <div>
                  <span className="font-medium text-ink">Admin: </span>
                  <span className="font-mono text-ink/70">admin@ecocollect.demo</span>
                </div>
                <span className="text-[11px] text-forest font-medium">Use →</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher Link */}
          <div className="mt-5 text-center pt-4 border-t border-sage-line">
            {mode === 'signin' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setErrorMessage('')
                }}
                className="text-sm text-forest hover:underline font-medium"
              >
                New here? Create an account
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setErrorMessage('')
                }}
                className="text-sm text-forest hover:underline font-medium"
              >
                Already have an account? Sign in
              </button>
            )}
          </div>
        </Card>

        {/* Guest Return Link */}
        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-ink/50 hover:text-ink">
            ← Return to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
