/**
 * DPO Pay Integration Service
 *
 * Calls Supabase Edge Functions to securely interact with DPO API.
 * The CompanyToken never touches the browser — it stays in Supabase secrets.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function getBaseUrl() {
  // HashRouter: build the full URL including the hash
  const origin = window.location.origin
  const basePath = import.meta.env.BASE_URL || '/'
  return `${origin}${basePath}`
}

async function callEdgeFunction(name, body) {
  if (!SUPABASE_URL) {
    throw new Error('Supabase not configured. Set VITE_SUPABASE_URL in .env')
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `DPO API error (${res.status})`)
  }

  return res.json()
}

const dpoService = {
  /**
   * Create a DPO payment token and get the redirect URL
   */
  async createPayment({ amount, orderId, customerEmail, customerName, customerPhone }) {
    const baseUrl = getBaseUrl()
    // DPO will redirect here after payment (with TransID in the URL)
    const redirectUrl = `${baseUrl}#/payment-return`
    const backUrl = `${baseUrl}#/checkout`

    const result = await callEdgeFunction('create-dpo-token', {
      amount,
      currency: 'BWP',
      orderId,
      customerEmail,
      customerName,
      customerPhone,
      redirectUrl,
      backUrl,
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to create payment')
    }

    return {
      transToken: result.transToken,
      transRef: result.transRef,
      paymentUrl: result.paymentUrl,
    }
  },

  /**
   * Verify payment status after customer returns from DPO
   */
  async verifyPayment(transToken) {
    const result = await callEdgeFunction('verify-dpo-payment', { transToken })
    return result
  },

  /**
   * Redirect user to DPO payment page
   */
  redirectToPayment(paymentUrl) {
    window.location.href = paymentUrl
  },

  /**
   * Check if DPO is configured (Supabase URL set)
   */
  isConfigured() {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
  },
}

export default dpoService
