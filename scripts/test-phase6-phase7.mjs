import { createClient } from '@supabase/supabase-js'
import { calculatePriority } from '../src/utils/priorityEngine.js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing credentials')
  process.exit(1)
}

const supabase = createClient(url, key)

console.log('='.repeat(60))
console.log('PHASE 6: SMART PRIORITY ENGINE VERIFICATION')
console.log('='.repeat(60))

// Fetch real records from Supabase
const { data: records, error } = await supabase
  .from('waste_requests')
  .select('id, request_code, user_name, waste_category, quantity_kg, priority, status')
  .order('request_code', { ascending: true })

if (error) {
  console.error('Supabase query failed:', error.message)
  process.exit(1)
}

console.log(`Fetched ${records.length} real records from Supabase.\n`)

// Select 4 distinct real requests covering different categories and quantities
const selectedCodes = ['ECO-0005', 'ECO-0003', 'ECO-0002', 'ECO-0001']
const sampleRequests = selectedCodes.map(code => records.find(r => r.request_code === code)).filter(Boolean)

// Also test a synthetic/edge case: E-Waste >= 5 kg
const ewasteHeavy = {
  request_code: 'ECO-TEST-EW5',
  waste_category: 'E-Waste',
  quantity_kg: 8,
}

console.log('Evaluating priority engine on real requests:')
sampleRequests.forEach((req, idx) => {
  const result = calculatePriority(req.waste_category, req.quantity_kg)
  console.log(`\n[Real Request ${idx + 1}] Code: ${req.request_code}`)
  console.log(`  Citizen:           ${req.user_name}`)
  console.log(`  Category:          ${req.waste_category}`)
  console.log(`  Quantity:          ${req.quantity_kg} kg`)
  console.log(`  Calculated Priority: ${result.priority}`)
  console.log(`  Rule Reason:       "${result.reason}"`)
})

console.log(`\n[Rule Verification: E-Waste >= 5 kg]`)
const ewasteResult = calculatePriority(ewasteHeavy.waste_category, ewasteHeavy.quantity_kg)
console.log(`  Category: ${ewasteHeavy.waste_category}, Quantity: ${ewasteHeavy.quantity_kg} kg`)
console.log(`  Calculated Priority: ${ewasteResult.priority}`)
console.log(`  Rule Reason: "${ewasteResult.reason}"`)

console.log('\n' + '='.repeat(60))
console.log('PHASE 7: ANALYTICS & SUPABASE COUNT QUERIES')
console.log('='.repeat(60))

// 1. Total count query
const { count: totalCount } = await supabase
  .from('waste_requests')
  .select('*', { count: 'exact', head: true })

console.log(`\nExact COUNT query total: ${totalCount} records`)

// 2. Status distribution count
const statusMap = {}
const catMap = {}
let highPriorityCount = 0

records.forEach(r => {
  statusMap[r.status] = (statusMap[r.status] || 0) + 1
  catMap[r.waste_category] = (catMap[r.waste_category] || 0) + 1
  if (r.priority === 'HIGH') highPriorityCount++
})

console.log('\nStatus Distribution (matches AdminDashboard Recharts bar chart):')
console.table(
  Object.entries(statusMap).map(([status, count]) => ({
    'Pipeline Status': status,
    'COUNT in Supabase': count,
    'Percentage': `${((count / totalCount) * 100).toFixed(1)}%`
  }))
)

console.log('Waste Category Distribution (matches AdminDashboard Recharts horizontal chart):')
console.table(
  Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({
      'Category': category,
      'COUNT in Supabase': count,
      'Percentage': `${((count / totalCount) * 100).toFixed(1)}%`
    }))
)

console.log(`High Priority Requests: ${highPriorityCount} / ${totalCount}`)
console.log('='.repeat(60))
