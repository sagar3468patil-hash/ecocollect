import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import AppShell from '../../layouts/AppShell'
import { citizenNav } from '../../layouts/navItems'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import PriorityBadge from '../../components/ui/PriorityBadge'
import LoadingState from '../../components/ui/LoadingState'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { getRequestById, updateRequestStatus } from '../../services/requestService'
import { calculatePriority } from '../../utils/priorityEngine'

const STATUS_ORDER = ['SUBMITTED', 'REVIEWED', 'SCHEDULED', 'COLLECTED']

function StatusTimeline({ current }) {
  const isCancelled = current === 'CANCELLED'
  return (
    <div className="flex items-start gap-0 mt-4">
      {STATUS_ORDER.map((s, i) => {
        const idx = STATUS_ORDER.indexOf(current)
        const done = isCancelled ? false : i <= idx
        const active = !isCancelled && s === current
        return (
          <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
            <div className={[
              'w-3 h-3 rounded-full border-2 transition-colors',
              active ? 'bg-forest border-forest' :
              done   ? 'bg-sage-line border-sage-line' :
                       'bg-white border-sage-line',
            ].join(' ')} />
            {i < STATUS_ORDER.length - 1 && (
              <div className={[
                'absolute h-0.5 w-full translate-x-1/2',
              ].join(' ')} />
            )}
            <span className="text-[10px] font-sans text-center text-ink/60 leading-tight">
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 text-sm border-b border-sage-line pb-2.5 last:border-0 last:pb-0">
      <span className="text-ink/60 shrink-0">{label}</span>
      <span className="text-ink text-right">{value}</span>
    </div>
  )
}

export default function CitizenRequestDetail() {
  const { id } = useParams()
  const { toast } = useToast()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await getRequestById(id)
    setLoading(false)
    if (error) { toast({ message: 'Failed to load request.', type: 'error' }); return }
    setRequest(data)
  }

  async function handleCancel() {
    if (!window.confirm('Are you sure you want to cancel this pickup request?')) return
    setCancelling(true)
    const { data, error } = await updateRequestStatus(id, 'CANCELLED')
    setCancelling(false)
    if (error) {
      toast({ message: `Cancellation failed: ${error.message}`, type: 'error' })
      return
    }
    setRequest(data)
    toast({ message: 'Request cancelled successfully.', type: 'info' })
  }

  useEffect(() => { load() }, [id])

  return (
    <AppShell navItems={citizenNav}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/citizen/requests">
            <Button variant="ghost" size="sm"><ArrowLeft size={15} /></Button>
          </Link>
          <h1 className="font-display text-2xl text-ink"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Request details
          </h1>
          <Button variant="ghost" size="sm" onClick={load} title="Refresh status">
            <RefreshCw size={14} />
          </Button>
        </div>

        {loading ? (
          <LoadingState text="Loading request…" />
        ) : !request ? (
          <p className="text-sm text-ink/60">Request not found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Status card */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm font-medium text-forest">
                  {request.request_code}
                </span>
                <div className="flex gap-2">
                  <StatusBadge status={request.status} />
                  <PriorityBadge priority={request.priority} />
                </div>
              </div>
              <StatusTimeline current={request.status} />
              {request.status === 'CANCELLED' && (
                <p className="text-xs text-clay mt-3">This request has been cancelled.</p>
              )}
              {request.status === 'SUBMITTED' && (
                <div className="mt-4 pt-3.5 border-t border-sage-line flex items-center justify-between gap-3">
                  <p className="text-xs text-ink/60">
                    Need to cancel? You can cancel while the request is still pending review.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleCancel}
                    loading={cancelling}
                    disabled={cancelling}
                  >
                    Cancel request
                  </Button>
                </div>
              )}
            </Card>

            {/* Details */}
            <Card title="Request details">
              <div className="space-y-2.5">
                <Row label="Name"         value={request.user_name} />
                <Row label="Email"        value={request.user_email} />
                <Row label="Category"     value={request.waste_category} />
                <Row label="Quantity"     value={`${request.quantity_kg} kg`} />
                <Row label="Address"      value={request.pickup_address} />
                <Row label="Pickup date"  value={`${request.pickup_date} at ${request.pickup_time}`} />
                {request.notes && <Row label="Notes" value={request.notes} />}
                <Row label="Submitted"    value={new Date(request.created_at).toLocaleString('en-IN')} />
                <Row label="Last updated" value={new Date(request.updated_at).toLocaleString('en-IN')} />
              </div>
            </Card>

            {/* Priority Assessment (Rule-based engine — not AI) */}
            {(() => {
              const ruleResult = calculatePriority(request.waste_category, request.quantity_kg)
              return (
                <Card title="Priority assessment (rule-based engine — not AI)">
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
