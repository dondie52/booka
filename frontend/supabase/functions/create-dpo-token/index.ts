// Supabase Edge Function: Create DPO Payment Token
// Securely calls DPO API with CompanyToken (stored as Supabase secret)
//
// Deploy: supabase functions deploy create-dpo-token
// Set secret: supabase secrets set DPO_COMPANY_TOKEN=your_token_here

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const DPO_API_URL = 'https://secure.3gdirectpay.com/API/v6/'
const DPO_COMPANY_TOKEN = Deno.env.get('DPO_COMPANY_TOKEN') || '9F416C11-127B-4DE2-AC7F-D5710E4C5E0A' // test token fallback
const DPO_SERVICE_TYPE = Deno.env.get('DPO_SERVICE_TYPE') || '3854' // test service type

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency, orderId, customerEmail, customerName, customerPhone, redirectUrl, backUrl } = await req.json()

    if (!amount || !orderId || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, orderId, customerEmail' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build DPO XML request
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${DPO_COMPANY_TOKEN}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${Number(amount).toFixed(2)}</PaymentAmount>
    <PaymentCurrency>${currency || 'BWP'}</PaymentCurrency>
    <CompanyRef>${orderId}</CompanyRef>
    <RedirectURL>${redirectUrl || ''}</RedirectURL>
    <BackURL>${backUrl || ''}</BackURL>
    <CompanyRefUnique>1</CompanyRefUnique>
    <PTL>30</PTL>
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${DPO_SERVICE_TYPE}</ServiceType>
      <ServiceDescription>BookHeaven Order ${orderId}</ServiceDescription>
      <ServiceDate>${new Date().toISOString().split('T')[0]}</ServiceDate>
    </Service>
  </Services>
  <Additional>
    <CustomerEmail>${customerEmail}</CustomerEmail>
    <CustomerFirstName>${customerName?.split(' ')[0] || ''}</CustomerFirstName>
    <CustomerLastName>${customerName?.split(' ').slice(1).join(' ') || ''}</CustomerLastName>
    <CustomerPhone>${customerPhone || ''}</CustomerPhone>
    <CustomerCountry>BW</CustomerCountry>
  </Additional>
</API3G>`

    // Call DPO API
    const dpoResponse = await fetch(DPO_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xml,
    })

    const responseText = await dpoResponse.text()

    // Parse XML response
    const transToken = responseText.match(/<TransToken>(.*?)<\/TransToken>/)?.[1]
    const resultCode = responseText.match(/<Result>(.*?)<\/Result>/)?.[1]
    const resultExplanation = responseText.match(/<ResultExplanation>(.*?)<\/ResultExplanation>/)?.[1]
    const transRef = responseText.match(/<TransRef>(.*?)<\/TransRef>/)?.[1]

    if (resultCode === '000' && transToken) {
      return new Response(
        JSON.stringify({
          success: true,
          transToken,
          transRef,
          paymentUrl: `https://secure.3gdirectpay.com/payv3.php?ID=${transToken}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: resultExplanation || 'Failed to create payment token',
          resultCode,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
