import { useNavigate } from 'react-router-dom'
import { Leaf, ArrowRight, Recycle, ClipboardList } from 'lucide-react'
import { useRole } from '../contexts/RoleContext'
import { ROLES } from '../data/constants'
import Button from '../components/ui/Button'

export default function LandingPage() {
  const { selectRole } = useRole()
  const navigate = useNavigate()

  function enter(role) {
    selectRole(role)
    navigate(role === ROLES.ADMIN ? '/admin/dashboard' : '/citizen/dashboard')
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-sage-line">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-forest flex items-center justify-center">
            <Leaf size={14} className="text-white" />
          </div>
          <span className="font-display font-semibold text-ink text-[17px]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            EcoCollect
          </span>
        </div>
        <span className="text-xs text-ink/50 font-sans">Pune Smart Waste Initiative</span>
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

          {/* Headline — Fraunces, specific problem statement */}
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
              onClick={() => enter(ROLES.CITIZEN)}
              className="w-full sm:w-auto gap-2"
            >
              <ClipboardList size={18} />
              Request a pickup
            </Button>
            <Button
              id="cta-admin"
              variant="secondary"
              size="lg"
              onClick={() => enter(ROLES.ADMIN)}
              className="w-full sm:w-auto gap-2"
            >
              Admin dashboard
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </main>

      {/* Feature strip */}
      <section className="border-t border-sage-line bg-sage/30">
        <div className="max-w-3xl mx-auto px-6 py-8 grid sm:grid-cols-3 gap-6">
          {[
            {
              label: 'Submit in 60 seconds',
              desc: 'Select category, quantity, and address. Done.',
            },
            {
              label: 'Track every step',
              desc: 'From Submitted → Reviewed → Scheduled → Collected.',
            },
            {
              label: 'Rule-based priority',
              desc: 'Automatic prioritisation — deterministic, not guesswork.',
            },
          ].map((f) => (
            <div key={f.label}>
              <p className="font-sans font-medium text-ink text-sm mb-1">{f.label}</p>
              <p className="font-sans text-xs text-ink/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
