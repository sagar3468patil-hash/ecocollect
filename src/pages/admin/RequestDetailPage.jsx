import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AppShell from '../../layouts/AppShell'
import { adminNav } from '../../layouts/navItems'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import PriorityBadge from '../../components/ui/PriorityBadge'
import LoadingState from '../../components/ui/LoadingState'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { getRequestById, updateRequestStatus } from '../../services/requestService'
import { calculatePriority } from '../../utils/priorityEngine'
import { STATUS_TRANSITIONS } from '../../data/constants'

const STATUS_LABELS = {
  REVIEWED:  'Mark as reviewed',
  SCHEDULED: 'Mark as scheduled',
  COLLECTED: 'Mark as collected',
  CANCELLED: 'Cancel request',
}
const STATUS_VARIANTS = {
  REVIEWED:  'secondary',
  SCHEDULED: 'primary',
  COLLECTED: 'primary',
  CANCELLED: 'ghost',
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 text-sm border-b border-sage-line pb-2.5 last:border-0 last:pb-0">
      <span className="text-ink/60 shrink-0 min-w-[120px]">{label}</span>
      <span className="text-ink text-right">{value}</span>
    </div>
  )
}

export default function AdminRequestDetail() {
  const { id } = useParams()
  const { toast } = useToast()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null) // which status is being applied

  async function load() {
    setLoading(true)
    const { data, error } = await getRequestById(id)
    setLoading(false)
    if (error) { toast({ message: 'Failed to load request.', type: 'error' }); return }
    setRequest(data)
  }

  useEffect(() => { load() }, [id])

  async function applyStatus(newStatus) {
    setUpdating(newStatus)
    const { data, error } = await updateRequestStatus(id, newStatus)
    setUpdating(null)
    if (error) {
      toast({ message: `Failed to update status: ${error.message}`, type: 'error' })
      return
    }
    setRequest(data)
    toast({ message: `Status updated to ${newStatus.charAt(0) + newStatus.slice(1).toLowerCase()}.`, type: 'success' })
  }

  const transitions = request ? (STATUS_TRANSITIONS[request.status] ?? []) : []

  return (
    <AppShell navItems={adminNav}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/requests">
            <Button variant="ghost" size="sm"><ArrowLeft size={15} /></Button>
          </Link>
          <h1 className="font-display text-2xl text-ink"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Request details
          </h1>
        </div>

        {loading ? <LoadingState text="Loading request…" /> : !request ? (
          <p className="text-sm text-ink/60">Request not found.</p>
        ) : (
          <div className="flex flex-col gap-4">

            {/* Status + Update Actions */}
            <Card>
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-medium text-forest">{request.request_code}</span>
                  <StatusBadge status={request.status} />
                  <PriorityBadge priority={request.priority} />
                </div>
              </div>

              {transitions.length > 0 ? (
                <div>
                  <p className="text-xs text-ink/60 mb-2.5 font-medium">Update status:</p>
                  <div className="flex flex-wrap gap-2">
                    {transitions.map(s => (
                      <Button
                        key={s}
                        id={`status-btn-${s.toLowerCase()}`}
                        variant={s === 'CANCELLED' ? 'ghost' : STATUS_VARIANTS[s]}
                        size="sm"
                        disabled={updating !== null}
                        onClick={() => applyStatus(s)}
                        className={s === 'CANCELLED' ? 'text-clay hover:bg-clay-bg border-clay/30' : ''}
                      >
                        {updating === s ? 'Updating…' : STATUS_LABELS[s]}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-ink/50 italic">
                  {request.status === 'COLLECTED' ? 'This request has been collected — no further actions.' : 'This request is cancelled.'}
                </p>
              )}
            </Card>

            {/* Citizen info */}
            <Card title="Citizen">
              <div className="space-y-2.5">
                <Row label="Name"  value={request.user_name} />
                <Row label="Email" value={request.user_email} />
              </div>
            </Card>

            {/* Waste details */}
            <Card title="Waste details">
              <div className="space-y-2.5">
                <Row label="Category"    value={request.waste_category} />
                <Row label="Quantity"    value={`${request.quantity_kg} kg`} />
                <Row label="Address"     value={request.pickup_address} />
                <Row label="Pickup"      value={`${request.pickup_date} at ${request.pickup_time}`} />
                {request.notes && <Row label="Notes" value={request.notes} />}
              </div>
            </Card>

            {/* Meta */}
            {(() => {
              const ruleResult = calculatePriority(request.waste_category, request.quantity_kg)
              return (
                <Card title="Priority (rule-based engine — not AI)">
                  <div className="space-y-2.5">
                    <Row
                      label="Assigned priority"
                      value={<PriorityBadge priority={request.priority || ruleResult.priority} />}
                    />
                    <Row
                      label="Rule explanation"
                      value={
                        <p className="text-xs text-ink/80 text-right leading-relaxed max-w-sm">
                          {ruleResult.reason}
                        </p>
                      }
                    />
                    <Row label="Submitted"    value={new Date(request.created_at).toLocaleString('en-IN')} />
                    <Row label="Last updated" value={new Date(request.updated_at).toLocaleString('en-IN')} />
                  </div>
                </Card>
              )
            })()}

          </div>
        )}
      </div>
    </AppShell>
  )
}
