# Stripe Testing Guide

Complete testing guide for Stripe integration, including test scenarios, test cards, and expected database states.

## Test Cards

### Success Cards

- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 822463 10005`

**Expiry**: Any future date (e.g., `12/34`)
**CVC**: Any 3 digits (e.g., `123`)
**ZIP**: Any 5 digits (e.g., `12345`)

### Decline Cards

- **Card Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Lost Card**: `4000 0000 0000 9987`
- **Stolen Card**: `4000 0000 0000 9979`

### Special Cases

- **Requires Authentication**: `4000 0025 0000 3155` (3D Secure)
- **Processing Error**: `4000 0000 0000 0119`

## Test Scenarios

### 1. New Subscription Creation

**Steps:**

1. User clicks "Upgrade to Pro" button
2. Redirected to Stripe Checkout
3. Enter test card: `4242 4242 4242 4242`
4. Complete checkout

**Expected Webhook Events:**

- `checkout.session.completed`
- `customer.subscription.created`
- `invoice.payment_succeeded`

**Expected Database State:**

- `users.subscription_tier` = `'pro'`
- `users.subscription_status` = `'active'`
- `users.stripe_subscription_id` = subscription ID
- `users.subscription_expires` = current_period_end date
- `billing_customers.stripe_subscription_id` = subscription ID
- `billing_customers.subscription_status` = `'active'`

**Expected Notifications:**

- Subscription activated notification
- Payment succeeded notification

### 2. Subscription Upgrade

**Steps:**

1. User on Starter tier clicks "Upgrade to Business"
2. Redirected to Stripe Checkout
3. Complete checkout

**Expected Webhook Events:**

- `checkout.session.completed`
- `customer.subscription.updated` (tier change)

**Expected Database State:**

- `users.subscription_tier` = `'business'`
- `users.subscription_status` = `'active'`
- Previous subscription cancelled, new subscription created

### 3. Subscription Cancellation (Scheduled)

**Steps:**

1. User clicks "Cancel Subscription"
2. Selects "Cancel at period end"
3. Confirms cancellation

**Expected API Call:**

- `POST /api/billing/cancel-subscription` with `{ immediate: false }`

**Expected Database State:**

- `users.subscription_cancel_at_period_end` = `true`
- `users.subscription_status` = `'active'` (still active until period end)
- `users.subscription_expires` = current_period_end date

**Expected Notifications:**

- Cancellation scheduled notification

**Expected Webhook Event (at period end):**

- `customer.subscription.deleted`

### 4. Subscription Cancellation (Immediate)

**Steps:**

1. User clicks "Cancel Subscription"
2. Selects "Cancel immediately"
3. Confirms cancellation

**Expected API Call:**

- `POST /api/billing/cancel-subscription` with `{ immediate: true }`

**Expected Database State:**

- `users.subscription_status` = `'cancelled'`
- `users.subscription_tier` = `'starter'` (downgraded)
- `users.subscription_expires` = `null`

**Expected Notifications:**

- Subscription cancelled notification

### 5. Subscription Reactivation

**Steps:**

1. User with scheduled cancellation clicks "Reactivate Subscription"
2. Confirms reactivation

**Expected API Call:**

- `POST /api/billing/reactivate-subscription`

**Expected Database State:**

- `users.subscription_cancel_at_period_end` = `false`
- `users.subscription_status` = `'active'`

**Expected Notifications:**

- Subscription reactivated notification

### 6. Subscription Extension

**Steps:**

1. User clicks "Extend Subscription"
2. Confirms extension

**Expected API Call:**

- `POST /api/billing/extend-subscription` with `{ months: 1 }`

**Expected Database State:**

- `users.subscription_expires` = extended date (current + 1 month)
- `users.subscription_current_period_start` = updated

**Expected Stripe State:**

- Subscription `billing_cycle_anchor` updated

### 7. Payment Failure

**Steps:**

1. Use decline card: `4000 0000 0000 0002`
2. Attempt to pay subscription

**Expected Webhook Events:**

- `invoice.payment_failed`

**Expected Database State:**

- `users.subscription_status` = `'past_due'`
- `users.subscription_tier` = unchanged (keeps current tier)

**Expected Notifications:**

- Payment failed notification (expires in 7 days)

### 8. Payment Recovery

**Steps:**

1. User updates payment method in Stripe portal
2. Stripe retries payment
3. Payment succeeds

**Expected Webhook Events:**

- `invoice.payment_succeeded`

**Expected Database State:**

- `users.subscription_status` = `'active'`
- `users.subscription_expires` = updated

**Expected Notifications:**

- Payment succeeded notification

## Webhook Testing

### Using Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhook/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### Manual Webhook Testing

1. **Create test subscription** in Stripe Dashboard
2. **Copy webhook event JSON** from Stripe Dashboard → Developers → Events
3. **Send POST request** to webhook endpoint:

```bash
curl -X POST http://localhost:3000/api/webhook/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=1234567890,v1=..." \
  -d @webhook-event.json
```

**Note**: You'll need to generate a valid signature. Use Stripe CLI for easier testing.

## Database State Verification

### After Subscription Creation

```sql
-- Check user subscription
SELECT email, subscription_tier, subscription_status, stripe_subscription_id, subscription_expires
FROM users
WHERE email = 'test@example.com';

-- Check billing customer mapping
SELECT user_email, stripe_customer_id, stripe_subscription_id, subscription_status
FROM billing_customers
WHERE user_email = 'test@example.com';

-- Check webhook events
SELECT stripe_event_id, event_type, processed, success, error_message
FROM webhook_events
ORDER BY created_at DESC
LIMIT 10;
```

### After Cancellation

```sql
-- Verify cancellation scheduled
SELECT email, subscription_status, subscription_cancel_at_period_end, subscription_expires
FROM users
WHERE email = 'test@example.com';

-- Should show:
-- subscription_status = 'active'
-- subscription_cancel_at_period_end = true
-- subscription_expires = period end date
```

### After Payment Failure

```sql
-- Verify past_due status
SELECT email, subscription_status, subscription_tier
FROM users
WHERE email = 'test@example.com';

-- Should show:
-- subscription_status = 'past_due'
-- subscription_tier = unchanged (keeps current tier)
```

## Notification Testing

### Check Notifications

```sql
-- View user notifications
SELECT type, title, message, read, dismissed, created_at
FROM user_notifications
WHERE user_email = 'test@example.com'
ORDER BY created_at DESC;
```

### Expected Notifications

After subscription creation:

- Type: `subscription`
- Title: `Subscription Activated`
- Message: `Your pro subscription is now active! Enjoy all the features.`

After payment failure:

- Type: `billing`
- Title: `Payment Failed`
- Message: `Your payment could not be processed...`
- Expires: 7 days from creation

## Common Issues

### Issue: Webhook Not Processing

**Symptoms:**

- Webhook events received but not processed
- Database not updated

**Debugging:**

1. Check `webhook_events` table for processing status
2. Check logs for error messages
3. Verify webhook secret matches Stripe dashboard
4. Check email lookup fallbacks

**Solution:**

- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check database connection
- Review webhook event logs

### Issue: Email Not Found

**Symptoms:**

- Webhook logs show "Could not find user email for customer"
- Subscription not updated

**Debugging:**

1. Check `billing_customers` table for customer mapping
2. Verify checkout session metadata includes `user_email`
3. Check Stripe customer email

**Solution:**

- Ensure `user_email` is set in checkout session metadata
- Run customer email sync: `syncCustomerEmails()`
- Manually create billing_customers entry

### Issue: Status Mismatch

**Symptoms:**

- Database shows different status than Stripe
- User sees wrong subscription status

**Debugging:**

1. Run health check: `GET /api/admin/billing/health`
2. Compare database status with Stripe subscription status
3. Check webhook event logs for missed events

**Solution:**

- Run subscription sync: `POST /api/admin/billing/sync-subscriptions`
- Manually update database if needed
- Check for webhook processing errors

## Test Checklist

Before deploying to production:

- [ ] Test subscription creation with all tiers
- [ ] Test subscription upgrade
- [ ] Test subscription cancellation (scheduled)
- [ ] Test subscription cancellation (immediate)
- [ ] Test subscription reactivation
- [ ] Test subscription extension
- [ ] Test payment failure handling
- [ ] Test payment recovery
- [ ] Verify webhook idempotency
- [ ] Verify email lookup fallbacks
- [ ] Verify notifications are sent
- [ ] Verify database state matches Stripe
- [ ] Test admin sync endpoint
- [ ] Test admin health check endpoint

## Related Documentation

- [Stripe Integration Guide](./STRIPE_INTEGRATION.md)
- [Subscription Management Guide](./SUBSCRIPTION_MANAGEMENT.md)
