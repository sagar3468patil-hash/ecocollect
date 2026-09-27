/**
 * EcoCollect — Supabase connection test
 * Run: node --env-file=.env scripts/db-test.mjs
 *
 * Tests: SELECT, INSERT, UPDATE, SELECT-after-update, DELETE/cleanup
 * Never prints credentials.
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('FAIL: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, key)
let insertedId = null
let allPassed  = true

function pass(label, detail = '') {
  console.log(`  ✓ ${label}${detail ? ' — ' + detail : ''}`)
}
function fail(label, err) {
  console.error(`  ✗ ${label} — ${err}`)
  allPassed = false
}

/* ── 1. SELECT ─────────────────────────────────────────────── */
console.log('\n[1] SELECT from waste_requests')
try {
  const { data, error } = await supabase
    .from('waste_requests')
    .select('id, request_code, status, priority')
    .limit(5)

  if (error) throw error
  pass('SELECT', `returned ${data.length} row(s)`)
  console.log('    Sample request_codes:', data.map(r => r.request_code).join(', ') || '(empty table)')
} catch (e) {
  fail('SELECT', e.message ?? e)
}

/* ── 2. INSERT ─────────────────────────────────────────────── */
console.log('\n[2] INSERT a test request')
try {
  const { data, error } = await supabase
    .from('waste_requests')
    .insert({
      request_code:    'ECO-TEST-001',
      user_name:       '_db_test_user',
      user_email:      'dbtest@ecocollect.internal',
      waste_category:  'Plastic',
      quantity_kg:     1.0,
      pickup_address:  'Test address, Pune',
      pickup_date:     '2099-01-01',
      pickup_time:     '09:00',
      notes:           'Automated test record — safe to delete',
      priority:        'LOW',
      status:          'SUBMITTED',
    })
    .select()
    .single()

  if (error) throw error
  insertedId = data.id
  pass('INSERT', `id=${data.id.slice(0,8)}...  code=${data.request_code}`)
} catch (e) {
  fail('INSERT', e.message ?? e)
}

/* ── 3. UPDATE ─────────────────────────────────────────────── */
console.log('\n[3] UPDATE status → REVIEWED')
if (insertedId) {
  try {
    const { data, error } = await supabase
      .from('waste_requests')
      .update({ status: 'REVIEWED' })
      .eq('id', insertedId)
      .select()
      .single()

    if (error) throw error
    pass('UPDATE', `status is now: ${data.status}`)
  } catch (e) {
    fail('UPDATE', e.message ?? e)
  }
} else {
  fail('UPDATE', 'Skipped — INSERT failed, no id available')
}

/* ── 4. SELECT after UPDATE ────────────────────────────────── */
console.log('\n[4] SELECT the updated record')
if (insertedId) {
  try {
    const { data, error } = await supabase
      .from('waste_requests')
      .select('request_code, status, updated_at')
      .eq('id', insertedId)
      .single()

    if (error) throw error
    pass('SELECT-after-update', `code=${data.request_code}  status=${data.status}  updated_at=${data.updated_at}`)
  } catch (e) {
    fail('SELECT-after-update', e.message ?? e)
  }
} else {
  fail('SELECT-after-update', 'Skipped — no id available')
}

/* ── 5. DELETE / cleanup ───────────────────────────────────── */
console.log('\n[5] DELETE test record (cleanup)')
if (insertedId) {
  try {
    const { error } = await supabase
      .from('waste_requests')
      .delete()
      .eq('id', insertedId)

    if (error) throw error
    pass('DELETE/cleanup', `test record id=${insertedId.slice(0,8)}... removed`)
  } catch (e) {
    fail('DELETE/cleanup', e.message ?? e)
  }
} else {
  fail('DELETE/cleanup', 'Skipped — nothing to clean up')
}

/* ── Summary ───────────────────────────────────────────────── */
console.log('\n' + '─'.repeat(40))
console.log(allPassed ? '✅  All tests PASSED' : '❌  Some tests FAILED — see above')
console.log('─'.repeat(40) + '\n')
process.exit(allPassed ? 0 : 1)
