import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { RefreshCw } from 'lucide-react'
import AppShell from '../../layouts/AppShell'
import { adminNav } from '../../layouts/navItems'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import PriorityBadge from '../../components/ui/PriorityBadge'
import LoadingState from '../../components/ui/LoadingState'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { getRequests, getStatsData } from '../../services/requestService'

// Colors mapped to design tokens
const STATUS_COLORS = {
  SUBMITTED: '#B8791F', // amber
  REVIEWED:  '#889883', // slate sage
  SCHEDULED: '#1E4432', // forest
  COLLECTED: '#14301F', // forest dark
  CANCELLED: '#A8422F', // clay
}

const CATEGORY_COLORS = {
  'Plastic':     '#1E4432',
  'E-Waste':     '#A8422F',
  'Organic':     '#B8791F',
  'Glass':       '#2E6F56',
  'Paper':       '#4A7C59',
  'Metal':       '#5A6855',
  'Mixed Waste': '#889883',
}

const STAT_ORDER = ['SUBMITTED', 'REVIEWED', 'SCHEDULED', 'COLLECTED', 'CANCELLED']

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg border border-sage-line p-4">
      <p className="text-xs text-ink/60 font-sans mb-1 font-medium">{label}</p>
      <p className="text-3xl font-display text-ink" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
        {value}
      </p>
      {sub && <p className="text-xs text-ink/50 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [{ data: sd, error: se }, { data: rd, error: re }] = await Promise.all([
      getStatsData(),
      getRequests({ }),
    ])
    setLoading(false)
    if (se || re) { toast({ message: 'Failed to load dashboard.', type: 'error' }); return }

    // Compute real status counts from Supabase
    const counts = {}
    STAT_ORDER.forEach(s => (counts[s] = 0))
    const catCounts = {}

    sd.forEach(r => {
      if (counts[r.status] !== undefined) counts[r.status]++
      const cat = r.waste_category || 'Other'
      catCounts[cat] = (catCounts[cat] || 0) + 1
    })

    const catChart = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))

    const highCount = sd.filter(r => r.priority === 'HIGH').length

    setStats({ total: sd.length, counts, highCount })
    setCategoryData(catChart)
    setRecent((rd ?? []).slice(0, 8))
  }

  useEffect(() => { load() }, [])

  const statusChartData = stats
    ? STAT_ORDER.map(s => ({
        name: s.charAt(0) + s.slice(1).toLowerCase(),
        count: stats.counts[s],
        key: s
      }))
    : []

  return (
    <AppShell navItems={adminNav}>
      <div className="max-w-5xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl text-ink"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Admin Dashboard
            </h1>
            <p className="text-sm text-ink/60 mt-0.5">Real-time waste operations overview &amp; analytics</p>
          </div>
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw size={15} />
            Refresh
          </Button>
        </div>

        {loading ? <LoadingState text="Loading dashboard…" /> : (
          <div className="flex flex-col gap-6">

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total requests" value={stats.total} sub="All logged requests" />
              <StatCard label="Submitted" value={stats.counts.SUBMITTED} sub="Awaiting team review" />
              <StatCard label="Scheduled" value={stats.counts.SCHEDULED} sub="Assigned for pickup" />
              <StatCard label="High priority" value={stats.highCount} sub="Rule-based engine" />
            </div>

            {/* Analytics Charts — Recharts backed by real Supabase data */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Status distribution */}
              <Card title="Status distribution" className="p-4">
                <p className="text-xs text-ink/60 -mt-2 mb-3">
                  Breakdown across collection pipeline stages ({stats.total} total)
                </p>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#22271F99' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#22271F99' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderColor: '#B8CBB4', borderRadius: 8, backgroundColor: '#FFFFFF' }}
                        cursor={{ fill: '#DCE6DA40' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {statusChartData.map(entry => (
                          <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || '#1E4432'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Waste Category Distribution */}
              <Card title="Waste category distribution" className="p-4">
                <p className="text-xs text-ink/60 -mt-2 mb-3">
                  Volume breakdown by waste classification ({categoryData.length} categories)
                </p>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      layout="vertical"
                      margin={{ top: 8, right: 16, left: 24, bottom: 0 }}
                    >
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#22271F99' }} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#22271F99' }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderColor: '#B8CBB4', borderRadius: 8, backgroundColor: '#FFFFFF' }}
                        cursor={{ fill: '#DCE6DA40' }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {categoryData.map(entry => (
                          <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#1E4432'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Quick Status Navigation Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STAT_ORDER.map(s => (
                <Link key={s} to={`/admin/requests?status=${s}`}
                  className="block bg-white rounded-lg border border-sage-line p-3 hover:bg-sage/20 transition-colors text-center">
                  <p className="text-2xl font-display text-ink" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                    {stats.counts[s]}
                  </p>
                  <div className="flex justify-center mt-1">
                    <StatusBadge status={s} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent requests */}
            <Card title="Recent requests" className="overflow-hidden p-0">
              <div className="divide-y divide-sage-line">
                {recent.map(r => (
                  <Link
                    key={r.id}
                    to={`/admin/requests/${r.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-paper transition-colors gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-forest">{r.request_code}</span>
                        <StatusBadge status={r.status} />
                        <PriorityBadge priority={r.priority} />
                      </div>
                      <p className="text-xs text-ink/70 mt-1 truncate">
                        <span className="font-medium text-ink">{r.waste_category}</span> · {r.quantity_kg} kg · {r.user_name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-ink/50 block">{r.pickup_date}</span>
                      <span className="text-xs text-forest hover:underline font-medium">Review →</span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-sage-line">
                <Link to="/admin/requests" className="text-xs text-forest hover:underline font-medium">
                  View all requests in table →
                </Link>
              </div>
            </Card>

          </div>
        )}
      </div>
    </AppShell>
  )
}
