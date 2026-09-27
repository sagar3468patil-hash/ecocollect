import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw, Inbox, Calendar, MapPin, Scale } from 'lucide-react'
import AppShell from '../../layouts/AppShell'
import { citizenNav } from '../../layouts/navItems'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import PriorityBadge from '../../components/ui/PriorityBadge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import { useToast } from '../../components/ui/Toast'
import { getRequests, getRequestsByIds } from '../../services/requestService'

export default function MyRequestsPage() {
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
      toast({ message: 'Failed to load requests.', type: 'error' })
      return
    }
    setRequests(res.data ?? [])
  }

  useEffect(() => {
    load(scope)
  }, [scope])

  return (
    <AppShell navItems={citizenNav}>
      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="font-display text-3xl text-ink"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              My requests
            </h1>
            <p className="text-sm text-ink/60 mt-0.5">
              Track the status of your pickup requests
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
            My submissions ({localIds.length})
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

        {/* Content */}
        {loading ? (
          <LoadingState text="Loading requests…" />
        ) : !requests.length ? (
          <EmptyState
            icon={Inbox}
            title={scope === 'my' ? 'No personal requests yet' : 'No requests found'}
            description={
              scope === 'my'
                ? 'Submit your first waste pickup request and track it here from submission to collection.'
                : 'No waste collection requests exist in the database yet.'
            }
            action={
              <Link to="/citizen/new">
                <Button variant="primary">Request a pickup</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((r) => (
              <Link
                key={r.id}
                to={`/citizen/requests/${r.id}`}
                className="block group"
              >
                <div className="bg-white rounded-lg border border-sage-line p-4 hover:border-forest/40 hover:shadow-sm transition-all duration-150 group-hover:bg-sage/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-forest">
                          {r.request_code}
                        </span>
                        <StatusBadge status={r.status} />
                        <PriorityBadge priority={r.priority} />
                      </div>

                      <p className="text-base text-ink font-semibold mb-1">
                        {r.waste_category}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-ink/70 mb-1">
                        <MapPin size={13} className="text-ink/40 shrink-0" />
                        <span className="truncate">{r.pickup_address}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-ink/50 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="shrink-0" />
                          Pickup: {r.pickup_date} at {r.pickup_time || '09:00'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Scale size={12} className="shrink-0" />
                          {r.quantity_kg} kg
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-ink/45 block">
                        Created {new Date(r.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-xs text-forest group-hover:underline font-medium mt-3 block">
                        View details
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
