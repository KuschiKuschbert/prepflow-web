# Browser Testing Guide for Auth0 & Stripe Integration

This guide provides step-by-step instructions for manually testing the Auth0 and Stripe integration in the browser.

## Prerequisites

1. **Development server running:**

   ```bash
   npm run dev
   ```

2. **Environment variables configured:**
   - All Stripe keys configured in `.env.local`
   - All Auth0 credentials configured in `.env.local`

3. **Browser console open:**
   - Open browser DevTools (F12)
   - Navigate to Console tab
   - Keep Network tab open for API monitoring

## Test 1: Auth0 Authentication Flow

### Steps

1. **Navigate to sign-in page:**

   ```
   http://localhost:3000/api/auth/signin
   ```

2. **Verify Auth0 provider displayed:**
   - ✅ Should see "Sign in with Auth0" button
   - ✅ Should see Auth0 logo
   - ✅ Form should be accessible

3. **Click "Sign in with Auth0":**
   - Should redirect to Auth0 login page
   - Enter credentials
   - Complete authentication

4. **Verify user creation:**
   - Check browser console for logs:
     ```
     [Auth0 Sync] Created new user: { email: '...', emailVerified: true/false }
     ```
   - Check database `users` table:
     ```sql
     SELECT email, last_login, email_verified, subscription_tier, subscription_status
     FROM users
     WHERE email = 'your-email@example.com';
     ```
   - ✅ User record should exist
   - ✅ `last_login` should be recent timestamp
   - ✅ `subscription_tier` should be 'starter'
   - ✅ `subscription_status` should be 'trial'

5. **Verify session:**
   - Navigate to `http://localhost:3000/api/auth/session`
   - Should see session data with user email
   - ✅ Session should include roles (if configured)

### Expected Results

- ✅ Auth0 sign-in page loads correctly
- ✅ Authentication redirects to Auth0
- ✅ User record created in database
- ✅ Session established correctly
- ✅ `last_login` timestamp updated

### Logs to Check

- Browser console: `[Auth0 Sync]` messages
- Server logs: `[Auth0 JWT]` messages
- Database: User record created

## Test 2: Stripe Checkout Flow

### Prerequisites

- ✅ Authenticated session (complete Test 1 first)
- ✅ Navigate to billing settings page

### Steps

1. **Navigate to billing settings:**

   ```
   http://localhost:3000/webapp/settings/billing
   ```

2. **Verify billing page loads:**
   - ✅ Should see current subscription status
   - ✅ Should see available plans (Starter, Pro, Business)
   - ✅ Should see "Upgrade" buttons for higher tiers

3. **Click "Upgrade to Pro" (or any upgrade button):**
   - Should trigger checkout session creation
   - Check browser console for API call:
     ```
     POST /api/billing/create-checkout-session
     ```

4. **Verify checkout session created:**
   - Check Network tab:
     - ✅ Request should include `tier` or `priceId` in body
     - ✅ Response should include `url` property
     - ✅ Should redirect to Stripe checkout

5. **Complete Stripe checkout:**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - Complete payment

6. **Verify webhook processing:**
   - Check server logs for:
     ```
     [Stripe Webhook] Checkout completed: { userEmail: '...', tier: 'pro', subscriptionId: '...' }
     ```
   - Check database:
     ```sql
     SELECT subscription_tier, subscription_status, stripe_subscription_id
     FROM users
     WHERE email = 'your-email@example.com';
     ```
   - ✅ `subscription_tier` should be updated
   - ✅ `subscription_status` should be 'active'
   - ✅ `stripe_subscription_id` should be set

7. **Verify redirect:**
   - Should redirect to `/webapp/settings/billing?status=success`
   - ✅ Should see success message
   - ✅ Subscription status should show as "Active"

### Expected Results

- ✅ Checkout session created successfully
- ✅ Stripe checkout page loads
- ✅ Payment processed successfully
- ✅ Webhook event received and processed
- ✅ Subscription updated in database
- ✅ User redirected to success page

### Logs to Check

- Browser console: API request/response logs
- Network tab: `/api/billing/create-checkout-session` request
- Server logs: `[Stripe Webhook]` messages
- Database: Subscription status updated

## Test 3: Stripe Customer Portal

### Steps

1. **Navigate to billing settings:**

   ```
   http://localhost:3000/webapp/settings/billing
   ```

2. **Click "Manage Billing" button:**
   - Should trigger portal session creation
   - Check browser console for API call:
     ```
     POST /api/billing/create-portal-session
     ```

3. **Verify portal session created:**
   - Check Network tab:
     - ✅ Response should include `url` property
     - ✅ Should redirect to Stripe customer portal

4. **Test portal features:**
   - Update payment method
   - View billing history
   - Cancel subscription (if desired)

5. **Verify webhook processing:**
   - If subscription updated, check server logs:
     ```
     [Stripe Webhook] Subscription updated: { userEmail: '...', status: '...' }
     ```
   - Check database for updated subscription status

### Expected Results

- ✅ Portal session created successfully
- ✅ Stripe customer portal loads
- ✅ Can update payment method
- ✅ Can view billing history
- ✅ Webhook processes subscription updates

## Test 4: Webhook Processing (Stripe CLI)

### Prerequisites

- Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
- Login: `stripe login`
- Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhook/stripe`

### Steps

1. **Start webhook forwarding:**

   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```

2. **Trigger test event:**

   ```bash
   stripe trigger checkout.session.completed
   ```

3. **Verify webhook processing:**
   - Check server logs:
     ```
     [Stripe Webhook] Event already processed, skipping: { eventId: '...', type: 'checkout.session.completed' }
     ```
   - Check database `webhook_events` table:
     ```sql
     SELECT stripe_event_id, event_type, processed, success, processing_time_ms
     FROM webhook_events
     ORDER BY processed_at DESC
     LIMIT 5;
     ```
   - ✅ Event should be recorded
   - ✅ `processed` should be `true`
   - ✅ `success` should be `true`

4. **Test idempotency:**
   - Trigger same event again
   - ✅ Should see "Event already processed, skipping" log
   - ✅ Should not process event twice

### Expected Results

- ✅ Webhook events received correctly
- ✅ Signature verification working
- ✅ Idempotency preventing duplicate processing
- ✅ Events logged in database
- ✅ Processing time recorded

## Test 5: Error Handling

### Test Invalid Webhook Signature

1. **Send webhook without signature:**

   ```bash
   curl -X POST http://localhost:3000/api/webhook/stripe \
     -H "Content-Type: application/json" \
     -d '{"type":"test"}'
   ```

2. **Verify error handling:**
   - ✅ Should return 400 Bad Request
   - ✅ Should log: `[Stripe Webhook] Invalid signature`
   - ✅ Should not process event

### Test Unauthenticated Checkout

1. **Try to create checkout without session:**

   ```bash
   curl -X POST http://localhost:3000/api/billing/create-checkout-session \
     -H "Content-Type: application/json" \
     -d '{"tier":"starter"}'
   ```

2. **Verify error handling:**
   - ✅ Should return 401 Unauthorized
   - ✅ Should include error message
   - ✅ Should not create checkout session

## Common Issues & Solutions

### Issue: Auth0 sign-in not working

**Symptoms:**

- Sign-in button doesn't redirect
- Error in console

**Solutions:**

1. Check `AUTH0_ISSUER_BASE_URL` is correct
2. Verify `AUTH0_CLIENT_ID` matches Auth0 dashboard
3. Check `NEXTAUTH_URL` matches callback URL in Auth0
4. Verify Auth0 application callback URLs configured

### Issue: Stripe checkout not creating session

**Symptoms:**

- Checkout button doesn't work
- Error in console

**Solutions:**

1. Check `STRIPE_SECRET_KEY` is correct
2. Verify user is authenticated (check session)
3. Check browser console for API errors
4. Verify price IDs are correct

### Issue: Webhook not processing

**Symptoms:**

- Payment succeeds but subscription not updated
- No webhook logs

**Solutions:**

1. Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Verify webhook endpoint URL in Stripe dashboard
3. Check webhook events table for errors
4. Verify webhook signature verification

### Issue: User not created on login

**Symptoms:**

- Authentication succeeds but no user record

**Solutions:**

1. Check `syncUserFromAuth0()` is called in JWT callback
2. Verify database connection
3. Check server logs for errors
4. Verify `users` table exists

## Monitoring & Debugging

### Key Logs to Monitor

1. **Auth0:**
   - `[Auth0 Sync]` - User creation/update
   - `[Auth0 JWT]` - Token processing
   - `[Auth0 JWT] Roles` - Role extraction

2. **Stripe:**
   - `[Billing API]` - Checkout/portal creation
   - `[Stripe Webhook]` - Webhook processing
   - `[Billing]` - Customer ID resolution

3. **Database:**
   - Check `users` table for subscription updates
   - Check `billing_customers` table for customer mappings
   - Check `webhook_events` table for webhook processing

### Database Queries for Verification

```sql
-- Check user subscription status
SELECT email, subscription_tier, subscription_status, stripe_subscription_id, last_login
FROM users
WHERE email = 'your-email@example.com';

-- Check customer mapping
SELECT user_email, stripe_customer_id, stripe_subscription_id, subscription_status
FROM billing_customers
WHERE user_email = 'your-email@example.com';

-- Check webhook processing
SELECT stripe_event_id, event_type, processed, success, processing_time_ms, error_message
FROM webhook_events
ORDER BY processed_at DESC
LIMIT 10;
```

## Test Checklist

- [ ] Auth0 sign-in page loads
- [ ] Auth0 authentication works
- [ ] User record created in database
- [ ] `last_login` timestamp updated
- [ ] Billing settings page loads
- [ ] Checkout session created successfully
- [ ] Stripe checkout page loads
- [ ] Payment processed successfully
- [ ] Webhook event received
- [ ] Subscription updated in database
- [ ] Customer portal opens
- [ ] Webhook idempotency working
- [ ] Error handling works correctly

## Next Steps

After completing browser tests:

1. **Add environment-specific webhook secrets** (optional)
2. **Test with Stripe test mode** (recommended for development)
3. **Monitor production webhooks** (when deployed)
4. **Set up webhook monitoring** (Stripe Dashboard)

## References

- [Stripe Webhooks Testing](https://stripe.com/docs/webhooks/test)
- [Auth0 Testing](https://auth0.com/docs/quickstart/webapp/nextjs/01-login)
- [Test Report](../docs/AUTH0_STRIPE_TEST_REPORT.md)
- [Best Practices](../docs/STRIPE_AUTH0_BEST_PRACTICES.md)
