import { supabase } from '../lib/supabase'

/* ── READ ─────────────────────────────────────────────────── */

/**
 * Fetch all requests (admin) with optional filters.
 * @param {{ status?:string, category?:string, priority?:string, search?:string }} filters
 */
export async function getRequests({ status, category, priority, search } = {}) {
  let q = supabase
    .from('waste_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (status)   q = q.eq('status', status)
  if (category) q = q.eq('waste_category', category)
  if (priority) q = q.eq('priority', priority)
  if (search) {
    const s = `%${search}%`
    q = q.or(
      `user_name.ilike.${s},request_code.ilike.${s},pickup_address.ilike.${s},user_email.ilike.${s}`
    )
  }
  return q
}

/**
 * Fetch a single request by UUID.
 */
export async function getRequestById(id) {
  return supabase
    .from('waste_requests')
    .select('*')
    .eq('id', id)
    .single()
}

/**
 * Fetch a batch of requests by their UUIDs (citizen "my requests").
 */
export async function getRequestsByIds(ids = []) {
  if (!ids.length) return { data: [], error: null }
  return supabase
    .from('waste_requests')
    .select('*')
    .in('id', ids)
    .order('created_at', { ascending: false })
}

/**
 * Fetch raw status + priority + category for dashboard stats.
 */
export async function getStatsData() {
  return supabase
    .from('waste_requests')
    .select('status, priority, waste_category, created_at')
}

/* ── WRITE ────────────────────────────────────────────────── */

/**
 * Create a new waste pickup request.
 * Priority is calculated by the caller using priorityEngine.js.
 */
export async function createRequest(payload) {
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id ?? payload.user_id ?? null
  const body = { ...payload }
  if (userId) {
    body.user_id = userId
  }
  return supabase
    .from('waste_requests')
    .insert(body)
    .select()
    .single()
}

/**
 * Update the status of an existing request (admin only in UI).
 */
export async function updateRequestStatus(id, newStatus) {
  return supabase
    .from('waste_requests')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single()
}
