import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CheckCircle } from 'lucide-react'
import AppShell from '../../layouts/AppShell'
import { citizenNav } from '../../layouts/navItems'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import FormField from '../../components/ui/FormField'
import PriorityBadge from '../../components/ui/PriorityBadge'
import { useToast } from '../../components/ui/Toast'
import { CATEGORIES } from '../../data/constants'
import { calculatePriority } from '../../utils/priorityEngine'
import { generateRequestCode } from '../../utils/requestCode'
import { createRequest } from '../../services/requestService'

const TIMES = [
  '07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00',
]

const today = new Date().toISOString().split('T')[0]

function PriorityPreview({ category, qty }) {
  if (!category || !qty) return null
  const { priority, reason } = calculatePriority(category, qty)
  return (
    <div className="flex items-start gap-3 p-3 bg-sage/40 rounded-md border border-sage-line mt-1">
      <PriorityBadge priority={priority} />
      <p className="text-xs text-ink/70 font-sans leading-snug">
        <span className="font-medium text-ink">Rule-based priority engine: </span>
        {reason}
      </p>
    </div>
  )
}

export default function NewRequestPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    user_name: '', user_email: '', waste_category: '', quantity_kg: '',
    pickup_address: '', pickup_date: '', pickup_time: '', notes: '',
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function validate() {
    const e = {}
    if (!form.user_name.trim())       e.user_name      = 'Name is required'
    if (!form.user_email.trim())      e.user_email     = 'Email is required'
    if (!form.waste_category)         e.waste_category = 'Select a category'
    if (!form.quantity_kg || Number(form.quantity_kg) <= 0)
                                      e.quantity_kg    = 'Enter a valid quantity'
    if (!form.pickup_address.trim())  e.pickup_address = 'Address is required'
    if (!form.pickup_date)            e.pickup_date    = 'Select a date'
    if (!form.pickup_time)            e.pickup_time    = 'Select a time'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)

    const { priority } = calculatePriority(form.waste_category, form.quantity_kg)
    const request_code = generateRequestCode()

    const { data, error } = await createRequest({
      ...form,
      quantity_kg: Number(form.quantity_kg),
      priority,
      status: 'SUBMITTED',
      request_code,
    })

    setSubmitting(false)

    if (error) {
      toast({ message: `Submission failed: ${error.message}`, type: 'error' })
      return
    }

    // Store in localStorage so "My Requests" can find it
    const existing = JSON.parse(localStorage.getItem('eco_my_requests') || '[]')
    localStorage.setItem('eco_my_requests', JSON.stringify([...existing, data.id]))

    setSuccess(data)
  }

  if (success) {
    const { priority, reason } = calculatePriority(success.waste_category, success.quantity_kg)
    return (
      <AppShell navItems={citizenNav}>
        <div className="max-w-lg mx-auto px-5 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-sage flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={28} className="text-forest" />
          </div>
          <h1 className="font-display text-3xl text-ink mb-2"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Request submitted
          </h1>
          <p className="text-sm text-ink/60 mb-6">
            We've received your request. The collection team will review it shortly.
          </p>

          <Card className="text-left mb-6">
            <div className="space-y-2.5">
              <Row label="Request code"  value={<span className="font-mono font-medium text-forest">{success.request_code}</span>} />
              <Row label="Category"      value={success.waste_category} />
              <Row label="Quantity"      value={`${success.quantity_kg} kg`} />
              <Row label="Pickup date"   value={`${success.pickup_date} at ${success.pickup_time}`} />
              <Row label="Status"        value="Submitted" />
              <Row label="Priority (rule-based)"
                value={
                  <div className="flex flex-col gap-1">
                    <PriorityBadge priority={priority} />
                    <span className="text-xs text-ink/50">{reason}</span>
                  </div>
                }
              />
            </div>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate('/citizen/requests')}>
              View my requests
            </Button>
            <Button variant="ghost" onClick={() => { setSuccess(null); setForm({ user_name:'',user_email:'',waste_category:'',quantity_kg:'',pickup_address:'',pickup_date:'',pickup_time:'',notes:'' }) }}>
              Submit another
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell navItems={citizenNav}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl text-ink"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Request a pickup
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            Fill in the details below and we'll arrange collection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Contact */}
          <Card title="Your details">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Full name" id="rq-name" required
                value={form.user_name} onChange={set('user_name')} error={errors.user_name}
                placeholder="Priya Desai" />
              <FormField label="Email address" id="rq-email" type="email" required
                value={form.user_email} onChange={set('user_email')} error={errors.user_email}
                placeholder="priya@example.com" />
            </div>
          </Card>

          {/* Waste */}
          <Card title="Waste details">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Waste category" id="rq-cat" type="select" required
                value={form.waste_category} onChange={set('waste_category')}
                error={errors.waste_category} options={CATEGORIES} />
              <FormField label="Estimated quantity (kg)" id="rq-qty" type="number" required
                value={form.quantity_kg} onChange={set('quantity_kg')}
                error={errors.quantity_kg} placeholder="e.g. 5" min="0.1" step="0.1" />
            </div>
            <PriorityPreview category={form.waste_category} qty={form.quantity_kg} />
          </Card>

          {/* Pickup */}
          <Card title="Pickup details">
            <div className="flex flex-col gap-4">
              <FormField label="Pickup address" id="rq-addr" required
                value={form.pickup_address} onChange={set('pickup_address')}
                error={errors.pickup_address}
                placeholder="Flat/House number, Building, Area, Pune" />
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Preferred date" id="rq-date" type="date" required
                  value={form.pickup_date} onChange={set('pickup_date')}
                  error={errors.pickup_date} min={today} />
                <FormField label="Preferred time" id="rq-time" type="select" required
                  value={form.pickup_time} onChange={set('pickup_time')}
                  error={errors.pickup_time}
                  options={TIMES.map(t => ({ value: t, label: t }))} />
              </div>
              <FormField label="Notes (optional)" id="rq-notes" type="textarea" rows={3}
                value={form.notes} onChange={set('notes')}
                placeholder="Any special instructions for the collection team…" />
            </div>
          </Card>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => navigate('/citizen/requests')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              <Plus size={16} />
              {submitting ? 'Submitting…' : 'Submit request'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
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
