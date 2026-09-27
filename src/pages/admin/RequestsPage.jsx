import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import AppShell from '../../layouts/AppShell'
import { adminNav } from '../../layouts/navItems'
import StatusBadge from '../../components/ui/StatusBadge'
import PriorityBadge from '../../components/ui/PriorityBadge'
import LoadingState from '../../components/ui/LoadingState'
import EmptyState from '../../components/ui/EmptyState'
import FormField from '../../components/ui/FormField'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { getRequests } from '../../services/requestService'
import { CATEGORIES, STATUSES, PRIORITIES } from '../../data/constants'
import { Inbox } from 'lucide-react'

export default function AdminRequestsPage() {
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    status:   searchParams.get('status') ?? '',
    category: searchParams.get('category') ?? '',
    priority: searchParams.get('priority') ?? '',
    search:   searchParams.get('search') ?? '',
  })

  const setF = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }))

  function clearFilters() {
    setFilters({ status: '', category: '', priority: '', search: '' })
  }

  const hasFilters = Object.values(filters).some(Boolean)

  async function load(f = filters) {
    setLoading(true)
    const { data, error } = await getRequests({
      status:   f.status   || undefined,
      category: f.category || undefined,
      priority: f.priority || undefined,
      search:   f.search   || undefined,
    })
    setLoading(false)
    if (error) { toast({ message: 'Failed to load requests.', type: 'error' }); return }
    setRequests(data ?? [])
  }

  useEffect(() => { load(filters) }, [filters])

  return (
    <AppShell navItems={adminNav}>
      <div className="max-w-5xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl text-ink"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            All requests
          </h1>
          <p className="text-sm text-ink/60 mt-0.5">
            {loading ? '…' : `${requests.length} record${requests.length !== 1 ? 's' : ''}`}
            {hasFilters ? ' matching filters' : ' total'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-sage-line p-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Search */}
            <div className="col-span-2 sm:col-span-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
              <input
                id="admin-search"
                className="w-full pl-8 pr-3 py-2 rounded-md border border-sage-line text-sm font-sans focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest/30 bg-paper placeholder:text-ink/40"
                placeholder="Name, code, address…"
                value={filters.search}
                onChange={setF('search')}
              />
            </div>
            <FormField id="admin-status" type="select" label=""
              value={filters.status} onChange={setF('status')}
              options={['All statuses', ...STATUSES].map((s, i) => ({ value: i === 0 ? '' : s, label: i === 0 ? 'All statuses' : s.charAt(0) + s.slice(1).toLowerCase() }))}
            />
            <FormField id="admin-category" type="select" label=""
              value={filters.category} onChange={setF('category')}
              options={['All categories', ...CATEGORIES].map((c, i) => ({ value: i === 0 ? '' : c, label: c }))}
            />
            <FormField id="admin-priority" type="select" label=""
              value={filters.priority} onChange={setF('priority')}
              options={['All priorities', ...PRIORITIES].map((p, i) => ({ value: i === 0 ? '' : p, label: i === 0 ? 'All priorities' : p.charAt(0) + p.slice(1).toLowerCase() }))}
            />
          </div>
          {hasFilters && (
            <div className="mt-2.5 flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X size={13} />
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState text="Loading requests…" />
        ) : !requests.length ? (
          <EmptyState icon={Inbox} title="No requests found" description="Try adjusting or clearing your filters." />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-hidden rounded-lg border border-sage-line">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="bg-sage border-b border-sage-line">
                    {['Code', 'Name', 'Category', 'Qty', 'Status', 'Priority', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-ink/70">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-sage-line">
                  {requests.map(r => (
                    <tr key={r.id} className="hover:bg-paper transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <Link to={`/admin/requests/${r.id}`} className="font-mono text-xs font-medium text-forest hover:underline">
                          {r.request_code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink">{r.user_name}</td>
                      <td className="px-4 py-3 text-ink">{r.waste_category}</td>
                      <td className="px-4 py-3 text-ink">{r.quantity_kg} kg</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                      <td className="px-4 py-3 text-ink/60 text-xs">{r.pickup_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile stacked */}
            <div className="sm:hidden flex flex-col gap-2.5">
              {requests.map(r => (
                <Link key={r.id} to={`/admin/requests/${r.id}`}>
                  <div className="bg-white rounded-lg border border-sage-line p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-medium text-forest">{r.request_code}</span>
                      <div className="flex gap-1.5">
                        <StatusBadge status={r.status} />
                        <PriorityBadge priority={r.priority} />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-ink">{r.user_name}</p>
                    <p className="text-xs text-ink/60">{r.waste_category} · {r.quantity_kg} kg · {r.pickup_date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
