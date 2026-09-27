import { useState } from 'react'
import {
  LayoutDashboard, Inbox, Settings, Package,
  BarChart2, Leaf,
} from 'lucide-react'
import AppShell from '../layouts/AppShell'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import FormField from '../components/ui/FormField'
import Table from '../components/ui/Table'
import { useToast } from '../components/ui/Toast'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'

const NAV_ITEMS = [
  { path: '/design',    label: 'Design system', icon: LayoutDashboard },
  { path: '/design/x', label: 'Requests',       icon: Inbox },
  { path: '/design/y', label: 'Analytics',      icon: BarChart2 },
  { path: '/design/z', label: 'Settings',       icon: Settings },
]

const TABLE_COLS = [
  { key: 'id',       label: 'ID' },
  { key: 'category', label: 'Category' },
  { key: 'status',   label: 'Status',   render: (v) => <StatusBadge status={v} /> },
  { key: 'priority', label: 'Priority', render: (v) => <PriorityBadge priority={v} /> },
  { key: 'date',     label: 'Submitted' },
]

const TABLE_DATA = [
  { id: 'ECO-001', category: 'Plastic',      status: 'SUBMITTED',  priority: 'HIGH',   date: '27 Sep 2026' },
  { id: 'ECO-002', category: 'E-Waste',      status: 'REVIEWED',   priority: 'MEDIUM', date: '26 Sep 2026' },
  { id: 'ECO-003', category: 'Organic',      status: 'SCHEDULED',  priority: 'LOW',    date: '25 Sep 2026' },
  { id: 'ECO-004', category: 'Glass',        status: 'COLLECTED',  priority: 'LOW',    date: '24 Sep 2026' },
  { id: 'ECO-005', category: 'Metal',        status: 'CANCELLED',  priority: 'HIGH',   date: '23 Sep 2026' },
]

/* ─── Section wrapper to keep the page tidy ─── */
function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-base font-medium text-ink mb-3 pb-2 border-b border-sage-line">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  const { toast } = useToast()
  const [selectVal, setSelectVal] = useState('')

  return (
    <AppShell navItems={NAV_ITEMS}>
      <div className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-10">

        {/* Header */}
        <div>
          <p className="text-xs font-sans text-ink/50 mb-1 tracking-normal">Phase 2</p>
          <h1
            className="text-4xl text-ink mb-1"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
          >
            Design System
          </h1>
          <p className="text-sm text-ink/60">
            EcoCollect shared component library — scratch test page
          </p>
        </div>

        {/* ── Color tokens ──────────────────────────────── */}
        <Section title="Color tokens">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { name: 'paper',       hex: '#F6F4EE', tw: 'bg-paper',       border: true },
              { name: 'ink',         hex: '#22271F', tw: 'bg-ink',          border: false },
              { name: 'forest',      hex: '#1E4432', tw: 'bg-forest',       border: false },
              { name: 'forest-dark', hex: '#14301F', tw: 'bg-forest-dark',  border: false },
              { name: 'sage',        hex: '#DCE6DA', tw: 'bg-sage',         border: true },
              { name: 'sage-line',   hex: '#B8CBB4', tw: 'bg-sage-line',    border: true },
              { name: 'amber',       hex: '#B8791F', tw: 'bg-amber',        border: false },
              { name: 'amber-bg',    hex: '#F3E6CC', tw: 'bg-amber-bg',     border: true },
              { name: 'clay',        hex: '#A8422F', tw: 'bg-clay',         border: false },
              { name: 'clay-bg',     hex: '#F1DCD6', tw: 'bg-clay-bg',      border: true },
            ].map((s) => (
              <div key={s.name}>
                <div className={`h-10 rounded-lg ${s.tw} ${s.border ? 'border border-sage-line' : ''}`} />
                <p className="text-xs font-sans text-ink/70 mt-1.5 font-medium">--{s.name}</p>
                <p className="text-xs text-ink/40 font-mono">{s.hex}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Typography ───────────────────────────────── */}
        <Section title="Typography">
          <Card>
            <p
              className="text-5xl text-ink leading-tight mb-1"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Fraunces
            </p>
            <p
              className="text-xl text-ink/50 mb-5"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
            >
              Display &amp; major headings only
            </p>
            <p className="font-sans font-medium text-ink text-base mb-0.5">Inter — UI &amp; body</p>
            <p className="font-sans text-sm text-ink/60 mb-4">
              Regular body text for all forms, tables, navigation, labels, and UI copy.
              Two weights active: 400 (regular) and 500 (medium).
            </p>
            <div className="flex flex-wrap gap-2">
              {['14px', '16px', '18px', '24px', '32px', '48px'].map((sz) => (
                <span key={sz} className="text-xs font-mono text-ink/50 bg-sage px-2 py-1 rounded-sm">
                  {sz}
                </span>
              ))}
            </div>
          </Card>
        </Section>

        {/* ── Buttons ──────────────────────────────────── */}
        <Section title="Buttons">
          <Card>
            <div className="flex flex-wrap gap-3 mb-4">
              <Button variant="primary">Request a pickup</Button>
              <Button variant="secondary">Admin dashboard</Button>
              <Button variant="ghost">Cancel</Button>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <Button variant="primary" size="sm">Small primary</Button>
              <Button variant="secondary" size="sm">Small secondary</Button>
              <Button variant="ghost" size="sm">Small ghost</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="lg">Large primary</Button>
              <Button variant="secondary" disabled>Disabled</Button>
            </div>
          </Card>
        </Section>

        {/* ── Status badges ────────────────────────────── */}
        <Section title="Status badges (sentence case in UI, UPPER in data)">
          <Card>
            <div className="flex flex-wrap gap-2">
              {['SUBMITTED', 'REVIEWED', 'SCHEDULED', 'COLLECTED', 'CANCELLED'].map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          </Card>
        </Section>

        {/* ── Priority badges ──────────────────────────── */}
        <Section title="Priority badges (rule-based engine — not ML)">
          <Card>
            <div className="flex flex-wrap gap-2">
              {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                <PriorityBadge key={p} priority={p} />
              ))}
            </div>
          </Card>
        </Section>

        {/* ── Form fields ──────────────────────────────── */}
        <Section title="Form fields">
          <Card>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Full name" id="ds-name" placeholder="Jane Smith" />
              <FormField
                label="Waste category"
                id="ds-cat"
                type="select"
                value={selectVal}
                onChange={(e) => setSelectVal(e.target.value)}
                options={['Plastic', 'Paper', 'Organic', 'E-Waste', 'Glass', 'Metal', 'Mixed Waste']}
              />
              <FormField
                label="Field with error"
                id="ds-err"
                defaultValue=""
                error="This field is required"
                placeholder="Triggers error state"
              />
              <FormField
                label="Description"
                id="ds-desc"
                type="textarea"
                rows={3}
                placeholder="Describe what needs to be collected…"
                hint="Maximum 500 characters."
              />
            </div>
          </Card>
        </Section>

        {/* ── Table ────────────────────────────────────── */}
        <Section title="Table (resize viewport narrow to see mobile layout)">
          <Table columns={TABLE_COLS} data={TABLE_DATA} />
        </Section>

        {/* ── Toast ────────────────────────────────────── */}
        <Section title="Toast notifications">
          <Card>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => toast({ message: 'Pickup request submitted successfully.', type: 'success' })}
              >
                Success
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast({ message: 'Something went wrong. Please try again.', type: 'error' })}
              >
                Error
              </Button>
              <Button
                variant="ghost"
                onClick={() => toast({ message: 'Your session expires in 5 minutes.', type: 'warning' })}
              >
                Warning
              </Button>
              <Button
                variant="ghost"
                onClick={() => toast({ message: 'A new update is available.', type: 'info' })}
              >
                Info
              </Button>
            </div>
          </Card>
        </Section>

        {/* ── Empty state ───────────────────────────────── */}
        <Section title="Empty state">
          <Card>
            <EmptyState
              icon={Package}
              title="No pickup requests yet"
              description="When citizens submit waste collection requests, they'll appear here for you to review and schedule."
              action={<Button variant="secondary" size="sm">Create a request</Button>}
            />
          </Card>
        </Section>

        {/* ── Loading state ─────────────────────────────── */}
        <Section title="Loading state">
          <Card>
            <LoadingState text="Fetching pickup requests…" />
          </Card>
        </Section>

      </div>
    </AppShell>
  )
}
