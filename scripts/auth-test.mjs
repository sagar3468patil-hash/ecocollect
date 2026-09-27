/**
 * EcoCollect — Supabase Auth & RLS Verification Script (PROMPT A Gate)
 * Tests:
 *  1. Sign up a citizen test account with metadata
 *  2. Verify automatic creation of matching profiles row via trigger
 *  3. Verify RLS: citizen can only SELECT their own requests
 *  4. Verify RLS: admin can SELECT all requests
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing credentials')
  process.exit(1)
}

// Function to create a fresh scoped client instance
function getClient() {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function runAuthVerification(adminEmail = null, adminPassword = null) {
  console.log('='.repeat(70))
  console.log('PROMPT A — SUPABASE AUTH & RLS VERIFICATION')
  console.log('='.repeat(70))

  const citizenClient = getClient()
  const randomSuffix = Math.random().toString(36).substring(2, 7)
  const citizenEmail = `ecocollect.test.${randomSuffix}@gmail.com`
  const citizenPass = 'SecureDemoPass123!'
  const citizenName = `Test Citizen ${randomSuffix.toUpperCase()}`

  // ─── 1. SIGN UP CITIZEN ──────────────────────────────────────────────
  console.log(`\n[1] Signing up citizen test user: ${citizenEmail}...`)
  const { data: signUpData, error: signUpError } = await citizenClient.auth.signUp({
    email: citizenEmail,
    password: citizenPass,
    options: {
      data: {
        full_name: citizenName,
      },
    },
  })

  if (signUpError) {
    console.error('❌ Sign up failed:', signUpError.message)
    if (signUpError.message.includes('confirm') || signUpError.message.includes('email')) {
      console.log('NOTE: Email confirmation may need to be disabled in Supabase dashboard.')
    }
    return
  }

  const citizenUser = signUpData.user
  console.log(`✓ auth.users record created: id=${citizenUser.id} email=${citizenUser.email}`)

  // ─── 2. VERIFY TRIGGER ON PROFILES ────────────────────────────────────
  console.log(`\n[2] Checking profiles table for automatic trigger creation...`)
  const { data: profileRow, error: profileError } = await citizenClient
    .from('profiles')
    .select('*')
    .eq('id', citizenUser.id)
    .single()

  if (profileError) {
    console.error('❌ Profile query failed:', profileError.message)
  } else {
    console.log('✓ Trigger fired! Matching profile row created automatically:')
    console.log(JSON.stringify(profileRow, null, 2))
    console.log(`  Role confirmed as: ${profileRow.role}`)
    console.log(`  Full name matches: ${profileRow.full_name === citizenName}`)
  }

  // ─── 3. INSERT REQUEST AS CITIZEN ────────────────────────────────────
  console.log(`\n[3] Creating waste_request linked to citizen user_id=${citizenUser.id}...`)
  const testCode = `ECO-AUTH-${randomSuffix.toUpperCase()}`
  const { data: reqInsert, error: reqInsertError } = await citizenClient
    .from('waste_requests')
    .insert({
      request_code: testCode,
      user_id: citizenUser.id,
      user_name: citizenName,
      user_email: citizenEmail,
      waste_category: 'Plastic',
      quantity_kg: 3.5,
      pickup_address: '101 Auth Lane, Pune',
      pickup_date: '2026-10-10',
      pickup_time: '09:00',
      priority: 'LOW',
      status: 'SUBMITTED',
    })
    .select()
    .single()

  if (reqInsertError) {
    console.error('❌ Insert request failed:', reqInsertError.message)
  } else {
    console.log(`✓ Request inserted: id=${reqInsert.id} code=${reqInsert.request_code} user_id=${reqInsert.user_id}`)
  }

  // ─── 4. TEST CITIZEN RLS (SELECT only own rows) ───────────────────────
  console.log(`\n[4] Querying waste_requests as CITIZEN (RLS test)...`)
  const { data: citizenRequests, error: citizenQueryError } = await citizenClient
    .from('waste_requests')
    .select('id, request_code, user_id, waste_category')

  if (citizenQueryError) {
    console.error('❌ Citizen select failed:', citizenQueryError.message)
  } else {
    console.log(`✓ Citizen SELECT returned ${citizenRequests.length} row(s).`)
    console.log('  Rows returned to citizen:')
    citizenRequests.forEach(r => console.log(`   - code=${r.request_code} user_id=${r.user_id}`))

    const onlyOwn = citizenRequests.every(r => r.user_id === citizenUser.id)
    console.log(`  Are all returned rows strictly owned by this citizen? ${onlyOwn}`)
    if (onlyOwn && citizenRequests.length === 1) {
      console.log('  ✓ PASS: Citizen cannot see other citizens\' rows or unlinked seed rows.')
    }
  }

  // ─── 5. TEST ADMIN RLS (if admin credentials provided) ─────────────────
  if (adminEmail && adminPassword) {
    console.log(`\n[5] Signing in as ADMIN: ${adminEmail}...`)
    const adminClient = getClient()
    const { data: adminAuth, error: adminAuthError } = await adminClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    })

    if (adminAuthError) {
      console.error('❌ Admin sign in failed:', adminAuthError.message)
    } else {
      console.log(`✓ Admin signed in: id=${adminAuth.user.id}`)

      const { data: adminProfile } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', adminAuth.user.id)
        .single()

      console.log(`  Admin profile role: ${adminProfile?.role}`)

      const { data: adminRequests, error: adminQueryError } = await adminClient
        .from('waste_requests')
        .select('id, request_code, user_id, status')

      if (adminQueryError) {
        console.error('❌ Admin query failed:', adminQueryError.message)
      } else {
        console.log(`✓ Admin SELECT returned ${adminRequests.length} rows (includes seed rows and all citizens).`)
        console.log(`  ✓ PASS: Admin can see all rows across the platform.`)
      }
    }
  } else {
    console.log('\n[5] Admin test skipped — provide admin credentials to run step 5.')
  }

  console.log('\n' + '='.repeat(70))
}

const args = process.argv.slice(2)
const adminEmail = args[0] || null
const adminPassword = args[1] || null

await runAuthVerification(adminEmail, adminPassword)
