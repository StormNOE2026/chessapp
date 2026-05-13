import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Import Stripe from esm.sh
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

// Standard CORS headers are required for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Parse the request body from your React frontend
    const { amount, userId } = await req.json()

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount provided")
    }

    // 3. Initialize Stripe using the secret key stored in Supabase environment variables
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
      apiVersion: '2022-11-15',
      // Use the Fetch API for Deno compatibility 
      httpClient: Stripe.createFetchHttpClient(),
    })

    // 4. Create a PaymentIntent. 
    // Note: The frontend sends dollars (e.g., 10), but Stripe expects cents (1000).
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency: 'usd',
      metadata: { userId }, // Attach the user ID for webhook tracking later if needed
    })

    // 5. Return the client secret to the frontend
    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )
  } catch (error) {
    console.error("Stripe Error:", error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})