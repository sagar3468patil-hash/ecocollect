import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw, Inbox, Calendar, MapPin, ArrowRight } from 'lucide-react'
import AppShell from '../../layouts/AppShell'
import { citizenNav } from '../../layouts/navItems'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import PriorityBadge from '../../components/ui/PriorityBadge'
import Button from '../../components/ui/Button'
import LoadingState from '../../components/ui/LoadingState'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/Toast'
import { getRequests, getRequestsByIds } from '../../services/requestService'

function StatCard({ label, value, sub, highlight }) {
  return (
    <div
      className={[
        'rounded-lg border p-4 transition-all duration-150',
        highlight
          ? 'bg-sage/40 border-forest/30'
          : 'bg-white border-sage-line',
      ].join(' ')}
    >
      <p className="text-xs text-ink/60 font-sans mb-1 font-medium">{label}</p>
      <p
        className="text-3xl font-display text-ink"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-ink/50 mt-1">{sub}</p>}
    </div>
  )
}

export default function CitizenDashboardPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const localIds = JSON.parse(localStorage.getItem('eco_my_requests') || '[]')
  const [scope, setScope] = useState(() => (localIds.length > 0 ? 'my' : 'all'))

  async function load(targetScope = scope) {
    setLoading(true)
    const ids = JSON.parse(localStorage.getItem('eco_my_requests') || '[]')

    let res
    if (targetScope === 'my') {
      if (!ids.length) {
        setRequests([])
        setLoading(false)
        return
      }
      res = await getRequestsByIds(ids)
    } else {
      res = await getRequests()
    }

    setLoading(false)
    if (res.error) {
      toast({ message: 'Failed to load dashboard.', type: 'error' })
      return
    }
    setRequests(res.data ?? [])
  }

  useEffect(() => {
    load(scope)
  }, [scope])

  // Compute stats from real Supabase data
  const total = requests.length
  const pending = requests.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'REVIEWED'
  ).length
  const scheduled = requests.filter((r) => r.status === 'SCHEDULED').length
  const collected = requests.filter((r) => r.status === 'COLLECTED').length
  const cancelled = requests.filter((r) => r.status === 'CANCELLED').length
  const recent = requests.slice(0, 5)

  return (
    <AppShell navItems={citizenNav}>
      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="font-display text-3xl text-ink"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Citizen Dashboard
            </h1>
            <p className="text-sm text-ink/60 mt-0.5">
              Overview of waste pickup requests and collection progress
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => load(scope)}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </Button>
            <Link to="/citizen/new">
              <Button variant="primary" size="sm">
                <Plus size={15} />
                New request
              </Button>
            </Link>
          </div>
        </div>

        {/* Scope selector tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-sage-line pb-3">
          <button
            onClick={() => setScope('my')}
            className={[
              'text-xs font-sans px-3 py-1.5 rounded-full transition-colors font-medium',
              scope === 'my'
                ? 'bg-forest text-white'
                : 'bg-sage/50 text-ink/70 hover:bg-sage',
            ].join(' ')}
          >
            My requests ({localIds.length})
          </button>
          <button
            onClick={() => setScope('all')}
            className={[
              'text-xs font-sans px-3 py-1.5 rounded-full transition-colors font-medium',
              scope === 'all'
                ? 'bg-forest text-white'
                : 'bg-sage/50 text-ink/70 hover:bg-sage',
            ].join(' ')}
          >
            All community requests (Demo)
          </button>
        </div>

        {loading ? (
          <LoadingState text="Loading dashboard…" />
        ) : total === 0 ? (
          <EmptyState
            icon={Inbox}
            title={scope === 'my' ? 'No personal requests yet' : 'No requests found'}
            description={
              scope === 'my'
                ? 'Submit your first waste pickup request to see real-time updates and stats.'
                : 'No requests found in the database.'
            }
            action={
              <Link to="/citizen/new">
                <Button variant="primary">Request a pickup</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Stat cards — computed from real Supabase query */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="Total requests"
                value={total}
                sub={scope === 'my' ? 'Submitted by you' : 'In community'}
              />
              <StatCard
                label="Pending"
                value={pending}
                sub="Awaiting pickup plan"
              />
              <StatCard
                label="Scheduled"
                value={scheduled}
                sub="Assigned for collection"
                highlight={scheduled > 0}
              />
              <StatCard
                label="Collected"
                value={collected}
                sub="Successfully recycled"
              />
            </div>

            {cancelled > 0 && (
              <p className="text-xs text-ink/50 -mt-2">
                Note: {cancelled} request{cancelled !== 1 ? 's' : ''} have been cancelled.
              </p>
            )}

            {/* Recent requests */}
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span>Recent requests</span>
                  <Link
                    to="/citizen/requests"
                    className="text-xs text-forest hover:underline font-normal font-sans"
                  >
                    View all ({total})
                  </Link>
                </div>
              }
              className="p-0 overflow-hidden"
            >
              <div className="divide-y divide-sage-line">
                {recent.map((r) => (
                  <Link
                    key={r.id}
                    to={`/citizen/requests/${r.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-sage/10 transition-colors gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-semibold text-forest">
                          {r.request_code}
                        </span>
                        <StatusBadge status={r.status} />
                        <PriorityBadge priority={r.priority} />
                      </div>
                      <p className="text-xs text-ink/70 truncate">
                        <span className="font-medium text-ink">
                          {r.waste_category}
                        </span>{' '}
                        · {r.quantity_kg} kg · {r.pickup_address}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-ink/50 block">
                        {r.pickup_date}
                      </span>
                      <span className="text-[11px] text-forest group-hover:underline font-medium">
                        Details →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Quick Action Banner */}
            <div className="bg-sage/30 border border-sage-line rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3
                  className="font-display text-lg text-ink font-semibold"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  Have recyclable waste to dispose?
                </h3>
                <p className="text-xs text-ink/65 mt-1">
                  Submit a pickup in under 60 seconds with automated priority scoring.
                </p>
              </div>
              <Link to="/citizen/new" className="shrink-0">
                <Button variant="primary" size="md">
                  <Plus size={16} />
                  New request
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
