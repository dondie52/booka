// Supabase Edge Function: Verify DPO Payment
// Checks transaction status after customer returns from DPO payment page
//
// Deploy: supabase functions deploy verify-dpo-payment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const DPO_API_URL = 'https://secure.3gdirectpay.com/API/v6/'
const DPO_COMPANY_TOKEN = Deno.env.get('DPO_COMPANY_TOKEN') || '9F416C11-127B-4DE2-AC7F-D5710E4C5E0A'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transToken } = await req.json()

    if (!transToken) {
      return new Response(
        JSON.stringify({ error: 'Missing transToken' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build verification XML
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${DPO_COMPANY_TOKEN}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${transToken}</TransactionToken>
</API3G>`

    const dpoResponse = await fetch(DPO_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xml,
    })

    const responseText = await dpoResponse.text()

    // Parse response
    const resultCode = responseText.match(/<Result>(.*?)<\/Result>/)?.[1]
    const resultExplanation = responseText.match(/<ResultExplanation>(.*?)<\/ResultExplanation>/)?.[1]
    const transactionAmount = responseText.match(/<TransactionAmount>(.*?)<\/TransactionAmount>/)?.[1]
    const transactionCurrency = responseText.match(/<TransactionCurrency>(.*?)<\/TransactionCurrency>/)?.[1]
    const customerEmail = responseText.match(/<CustomerEmail>(.*?)<\/CustomerEmail>/)?.[1]
    const transactionRef = responseText.match(/<TransactionRef>(.*?)<\/TransactionRef>/)?.[1]

    // DPO result codes:
    // 000 = Transaction paid
    // 001 = Transaction authorized (not yet settled)
    // 002 = Transaction declined
    // 003 = Transaction cancelled
    // 005 = Transaction expired

    const isPaid = resultCode === '000' || resultCode === '001'

    return new Response(
      JSON.stringify({
        success: isPaid,
        resultCode,
        resultExplanation,
        transactionAmount,
        transactionCurrency,
        transactionRef,
        customerEmail,
        status: isPaid ? 'completed' : resultCode === '003' ? 'cancelled' : 'failed',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
