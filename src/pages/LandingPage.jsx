import { useNavigate, Link } from 'react-router-dom'
import { Leaf, ArrowRight, Recycle, ClipboardList, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'

export default function LandingPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  function handleCitizenClick() {
    if (user) {
      navigate('/citizen/dashboard')
    } else {
      navigate('/login')
    }
  }

  function handleAdminClick() {
    if (user && profile?.role === 'admin') {
      navigate('/admin/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-sage-line">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-forest flex items-center justify-center">
            <Leaf size={14} className="text-white" />
          </div>
          <span
            className="font-display font-semibold text-ink text-[17px]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            EcoCollect
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-xs text-ink/50 font-sans">
            Pune Smart Waste Initiative
          </span>
          {user ? (
            <Link
              to={profile?.role === 'admin' ? '/admin/dashboard' : '/citizen/dashboard'}
              className="text-xs font-medium text-forest hover:underline"
            >
              My Dashboard →
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-xs font-medium text-forest hover:underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sage rounded-sm border border-sage-line mb-8">
            <Recycle size={13} className="text-forest" />
            <span className="text-xs font-sans text-forest font-medium">
              Smart waste collection &amp; recycling
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl text-ink leading-[1.08] mb-6"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
          >
            Waste piles up when
            <br />
            <span className="text-forest">no one knows it's there.</span>
          </h1>

          {/* Problem copy */}
          <p className="font-sans text-lg text-ink/70 leading-relaxed max-w-xl mx-auto mb-10">
            Citizens don't know how to request a pickup. Collection teams can't
            see what's waiting across the city. EcoCollect closes that gap —
            one trackable request at a time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              id="cta-citizen"
              variant="primary"
              size="lg"
              onClick={handleCitizenClick}
              className="w-full sm:w-auto gap-2"
            >
              <ClipboardList size={18} />
              Request a pickup
            </Button>
            <Button
              id="cta-admin"
              variant="secondary"
              size="lg"
              onClick={handleAdminClick}
              className="w-full sm:w-auto gap-2"
            >
              <ShieldCheck size={18} />
              Admin portal
            </Button>
          </div>

          {/* Trust strip */}
          <div className="mt-16 pt-8 border-t border-sage-line grid grid-cols-3 gap-4 text-center">
            <div>
              <p
                className="font-display text-2xl text-ink"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                100%
              </p>
              <p className="text-xs text-ink/50 font-sans mt-0.5">Trackable pickups</p>
            </div>
            <div>
              <p
                className="font-display text-2xl text-ink"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                &lt; 60s
              </p>
              <p className="text-xs text-ink/50 font-sans mt-0.5">To request</p>
            </div>
            <div>
              <p
                className="font-display text-2xl text-ink"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Rule-based
              </p>
              <p className="text-xs text-ink/50 font-sans mt-0.5">Automated triage</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-sage-line flex items-center justify-between text-xs text-ink/40 font-sans">
        <span>EcoCollect · Pune Smart Waste Coordination</span>
        <Link to="/design" className="hover:text-ink transition-colors">
          Design system
        </Link>
      </footer>
    </div>
  )
}
