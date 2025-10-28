import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle event types
  switch (event.type) {
    case 'checkout.session.completed':
      // TODO: Handle successful checkout
      break;
    case 'customer.subscription.updated':
      // TODO: Handle subscription update
      break;
    case 'customer.subscription.deleted':
      // TODO: Handle subscription cancellation
      break;
  }

  return NextResponse.json({ received: true });
}
