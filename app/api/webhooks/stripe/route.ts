import { NextRequest, NextResponse } from 'next/server';
import { setUserSubscriptionStatus, getUserByEmail } from '@/lib/user';

// Stripe webhook secret - you'll need to add this to your environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the webhook signature
    // Note: You'll need to install @stripe/stripe-js and implement signature verification
    // For now, we'll process the webhook without verification (not recommended for production)
    
    const event = JSON.parse(body);
    
    console.log('Received Stripe webhook:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    const customerEmail = session.customer_details?.email;
    const amount = session.amount_total;
    const currency = session.currency;
    
    console.log(`Payment completed for ${customerEmail}, amount: ${amount} ${currency}`);
    
    // Map payment amounts to subscription types
    // You'll need to adjust these based on your actual Stripe product prices
    let subscriptionType: 'PAID' | null = null;
    
    if (amount === 1900 && currency === 'usd') { // $19.00 for monthly
      subscriptionType = 'PAID';
    } else if (amount === 6500 && currency === 'usd') { // $65.00 for semester
      subscriptionType = 'PAID';
    } else if (amount === 12000 && currency === 'usd') { // $120.00 for yearly
      subscriptionType = 'PAID';
    }
    
    if (subscriptionType && customerEmail) {
      // Find user by email and update subscription status
      const user = await getUserByEmail(customerEmail);
      if (user) {
        await setUserSubscriptionStatus(user.id, subscriptionType);
        console.log(`Updated subscription status to ${subscriptionType} for user ${user.id}`);
      } else {
        console.error(`User not found for email: ${customerEmail}`);
      }
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    const customerEmail = invoice.customer_email;
    console.log(`Invoice payment succeeded for ${customerEmail}`);
    
    // Handle recurring payments
    if (customerEmail) {
      const user = await getUserByEmail(customerEmail);
      if (user) {
        await setUserSubscriptionStatus(user.id, 'PAID');
        console.log(`Updated subscription status to PAID for user ${user.id}`);
      } else {
        console.error(`User not found for email: ${customerEmail}`);
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const customerEmail = subscription.customer_email;
    const status = subscription.status;
    
    console.log(`Subscription updated for ${customerEmail}, status: ${status}`);
    
    if (customerEmail) {
      const user = await getUserByEmail(customerEmail);
      if (user) {
        if (status === 'active') {
          await setUserSubscriptionStatus(user.id, 'PAID');
          console.log(`Updated subscription status to PAID for user ${user.id}`);
        } else if (status === 'canceled' || status === 'unpaid') {
          await setUserSubscriptionStatus(user.id, 'EXPIRED');
          console.log(`Updated subscription status to EXPIRED for user ${user.id}`);
        }
      } else {
        console.error(`User not found for email: ${customerEmail}`);
      }
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
} 