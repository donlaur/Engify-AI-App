import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;
  
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'engify-ai',
      },
    });
  }
  
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }
  
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.cancel(subscriptionId);
  }
  
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }
}
