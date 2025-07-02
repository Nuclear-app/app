# Trial System Implementation

## Overview
This implementation adds a 2-week trial system with automatic subscription management using Stripe payments.

## 🎯 Features Implemented

### 1. **Dashboard Trial Check**
- Automatically checks trial status when dashboard loads
- Redirects expired users to transaction page
- Updates expired trials to EXPIRED status
- Shows trial countdown in console (for debugging)

### 2. **Middleware Protection**
- Protects all routes: `/dashboard`, `/modeSpecific`, `/onboarding`, `/protected`
- Checks subscription status on every request
- Redirects expired users to transaction page
- Allows access to transaction page even when expired

### 3. **Stripe Integration**
- Webhook handler at `/api/webhooks/stripe`
- Handles payment confirmations
- Updates user subscription status automatically
- Supports monthly ($19), semester ($65), and yearly ($120) plans

## 🔧 How It Works

### Trial Flow:
1. **New User**: Gets `TRIAL` status by default
2. **2-Week Period**: User can access all features
3. **Trial Expires**: Status automatically updates to `EXPIRED`
4. **Payment**: User subscribes via Stripe
5. **Access Restored**: Status updates to `PAID`

### Database Schema:
```prisma
model User {
  id                String             @id @default(uuid())
  email             String             @unique
  name              String?
  mode              Mode?
  createdAt         DateTime           @default(now())
  subscriptionStatus SubscriptionStatus @default(TRIAL)
  // ... other fields
}

enum SubscriptionStatus {
  TRIAL
  PAID
  EXPIRED
}
```

## 🚀 Setup Instructions

### 1. **Environment Variables**
Add to your `.env` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. **Stripe Webhook Setup**
1. Go to your Stripe Dashboard
2. Navigate to Webhooks
3. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
5. Copy the webhook secret to your environment variables

### 3. **Payment Links**
Update the payment links in `components/transaction/PricingCard.tsx`:
```typescript
const paymentLinks = {
  'basic': 'https://buy.stripe.com/your-semester-link',
  'pro': 'https://buy.stripe.com/your-monthly-link', 
  'enterprise': 'https://buy.stripe.com/your-yearly-link'
}
```

## 📁 Files Modified/Created

### New Files:
- `app/api/webhooks/stripe/route.ts` - Stripe webhook handler
- `TRIAL_SYSTEM_README.md` - This documentation

### Modified Files:
- `components/dashboardComp/dashboard.tsx` - Added trial check
- `utils/supabase/middleware.ts` - Added subscription protection
- `lib/user.ts` - Added trial management functions
- `prisma/schema.prisma` - Added subscription fields

## 🔍 Testing

### Test Trial Expiration:
1. Create a test user
2. Manually update their `createdAt` to 15+ days ago
3. Access dashboard - should redirect to transaction page

### Test Payment Flow:
1. Use Stripe test mode
2. Complete a test payment
3. Check webhook logs in console
4. Verify user status updates to `PAID`

## 🛠️ Utility Functions

### Available Functions:
- `isTrialExpired(userId)` - Check if trial has expired
- `getTrialDaysRemaining(userId)` - Get days left in trial
- `getTrialEndDate(userId)` - Get exact trial end date
- `updateExpiredTrial(userId)` - Update expired trials to EXPIRED
- `setUserSubscriptionStatus(userId, status)` - Update subscription status
- `getUserSubscriptionStatus(userId)` - Get current subscription status

## 🔒 Security Notes

1. **Webhook Verification**: Currently processes webhooks without signature verification (not recommended for production)
2. **Error Handling**: Fails open in middleware (allows access if subscription check fails)
3. **Rate Limiting**: Consider adding rate limiting to webhook endpoint

## 🚨 Production Considerations

1. **Install Stripe SDK**: `npm install stripe`
2. **Add Webhook Signature Verification**
3. **Add Rate Limiting**
4. **Add Error Monitoring**
5. **Test with Real Stripe Account**
6. **Add Logging/Monitoring**

## 📞 Support

If you encounter issues:
1. Check console logs for trial status
2. Verify Stripe webhook configuration
3. Check database for user subscription status
4. Ensure environment variables are set correctly 