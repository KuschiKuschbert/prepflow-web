# Stripe & Auth0 Integration Best Practices

This document outlines the best practices implemented for Stripe and Auth0 integration in PrepFlow.

## Stripe Best Practices

### 1. Environment-Specific Webhook Secrets

**Best Practice:** Use different webhook secrets for development and production environments.

**Implementation:**

- `STRIPE_WEBHOOK_SECRET_DEV` - For development (Stripe CLI or test webhook endpoint)
- `STRIPE_WEBHOOK_SECRET_PROD` - For production (production webhook endpoint)
- `STRIPE_WEBHOOK_SECRET` - Fallback for backward compatibility

**Why:** Prevents webhook events from one environment affecting another, improves security.

**Location:** `app/api/webhook/stripe/route.ts` - `getWebhookSecret()` function

### 2. Webhook Idempotency

**Best Practice:** Always check if a webhook event has already been processed before handling it.

**Implementation:**

- `webhook_events` table stores processed event IDs
- `isWebhookEventProcessed()` checks if event was already processed
- Prevents duplicate processing of webhook events

**Why:** Stripe may retry webhook events. Idempotency ensures each event is processed exactly once.

**Location:** `app/api/webhook/stripe/route.ts` - `isWebhookEventProcessed()` function

### 3. Webhook Signature Verification

**Best Practice:** Always verify webhook signatures using the webhook secret.

**Implementation:**

- `stripe.webhooks.constructEvent()` verifies signature
- Returns 400 error if signature is invalid
- Uses environment-specific webhook secret

**Why:** Prevents unauthorized webhook events from being processed.

**Location:** `app/api/webhook/stripe/route.ts` - `POST()` function

### 4. Expand Parameters

**Best Practice:** Use expand parameters to reduce API calls and get all needed data in one request.

**Implementation:**

- `checkout.sessions.retrieve()` with `expand: ['line_items', 'customer', 'subscription']`
- Reduces API calls from multiple to single request

**Why:** Improves performance and reduces API rate limit issues.

**Location:** `app/api/webhook/stripe/route.ts` - `checkout.session.completed` handler

### 5. Handle Deleted Customers

**Best Practice:** Always check if a customer was deleted before processing subscription events.

**Implementation:**

- Check if `customerId.startsWith('deleted_')`
- Log warning and skip processing for deleted customers
- Prevents errors when processing events for deleted customers

**Why:** Stripe retains customer data for deleted customers. Events may reference deleted customers.

**Location:** `app/api/webhook/stripe/route.ts` - Subscription event handlers

### 6. Customer ID Caching

**Best Practice:** Cache Stripe customer IDs in database to reduce API calls.

**Implementation:**

- `billing_customers` table stores email-to-customer-ID mappings
- `getOrCreateCustomerId()` checks database cache first
- Verifies cached customer still exists (handles deleted customers)

**Why:** Reduces Stripe API calls and improves performance.

**Location:** `lib/billing.ts` - `getOrCreateCustomerId()` function

### 7. Proper Error Handling

**Best Practice:** Return appropriate HTTP status codes for webhook retries.

**Implementation:**

- Return 200 for non-retryable errors (prevents infinite retries)
- Return 500 for retryable errors (database connection issues, etc.)
- Log all errors with context

**Why:** Stripe retries webhook events based on HTTP status codes. Proper handling prevents infinite retries.

**Location:** `app/api/webhook/stripe/route.ts` - Error handling in `POST()` function

### 8. Metadata Usage

**Best Practice:** Include metadata in checkout sessions and subscriptions for webhook processing.

**Implementation:**

- `checkout.sessions.create()` includes `metadata.tier` and `metadata.user_email`
- `subscription_data.metadata` includes same metadata
- Webhook handlers extract tier from metadata (primary) or price ID (fallback)

**Why:** Metadata provides context for webhook processing and reduces database lookups.

**Location:** `app/api/billing/create-checkout-session/route.ts`

## Auth0 Best Practices

### 1. User Creation on First Login

**Best Practice:** Create user record in database immediately on first authentication.

**Implementation:**

- `syncUserFromAuth0()` called in JWT callback on first login
- Creates user record with default tier and status
- Updates `last_login` timestamp on subsequent logins

**Why:** Ensures user data is available immediately after authentication, enables feature gating.

**Location:** `lib/auth-user-sync.ts` - `syncUserFromAuth0()` function

### 2. Email Verification Sync

**Best Practice:** Sync email verification status from Auth0 to database.

**Implementation:**

- Extract `email_verified` from Auth0 user object
- Update database with verification status
- Don't downgrade verification status (only upgrade)

**Why:** Auth0 handles email verification. Syncing status enables feature gating based on verification.

**Location:** `lib/auth-user-sync.ts` - `syncUserFromAuth0()` function

### 3. Last Login Tracking

**Best Practice:** Track user login activity for analytics and security.

**Implementation:**

- Update `last_login` timestamp on every authentication
- Stored in `users` table
- Updated asynchronously (doesn't block authentication)

**Why:** Enables user activity tracking and security monitoring.

**Location:** `lib/auth-user-sync.ts` - `syncUserFromAuth0()` function

### 4. Proper Scope Configuration

**Best Practice:** Request only necessary scopes from Auth0.

**Implementation:**

- `scope: 'openid profile email'` - Minimal required scopes
- No unnecessary permissions requested

**Why:** Follows principle of least privilege, improves security.

**Location:** `lib/auth-options.ts` - Auth0Provider configuration

### 5. JWT Session Strategy

**Best Practice:** Use JWT session strategy for stateless authentication.

**Implementation:**

- `session: { strategy: 'jwt' }` in NextAuth configuration
- Roles stored in JWT token
- No database lookups required for session validation

**Why:** Improves performance and scalability, reduces database load.

**Location:** `lib/auth-options.ts` - `authOptions` configuration

### 6. Role Extraction

**Best Practice:** Extract roles from multiple sources with fallbacks.

**Implementation:**

- Check id_token for roles (primary)
- Fallback to Management API if not in token
- Multiple fallback locations checked

**Why:** Handles different Auth0 configurations and ensures roles are always available.

**Location:** `lib/auth-options.ts` - JWT callback

## Integration Flow

### User Authentication Flow

1. **User logs in via Auth0**
   - NextAuth handles OAuth flow
   - Auth0 returns user data and tokens

2. **JWT Callback**
   - Extract email and email_verified from Auth0 user
   - Call `syncUserFromAuth0()` asynchronously
   - Extract roles from token or Management API
   - Store roles in JWT token

3. **User Record Created**
   - `syncUserFromAuth0()` creates user in database
   - Sets default tier (`starter`) and status (`trial`)
   - Updates `last_login` timestamp

### Stripe Checkout Flow

1. **User initiates checkout**
   - Frontend calls `/api/billing/create-checkout-session`
   - API gets user email from NextAuth session
   - Calls `getOrCreateCustomerId()` to get/create Stripe customer

2. **Customer ID Resolution**
   - Check database cache (`billing_customers` table)
   - Verify customer still exists in Stripe
   - Search by email if not cached
   - Create new customer if not found

3. **Checkout Session Created**
   - Include metadata (tier, user_email) in session
   - Include metadata in subscription_data
   - Return checkout URL to frontend

4. **User completes payment**
   - Stripe processes payment
   - Webhook event `checkout.session.completed` sent

5. **Webhook Processing**
   - Verify webhook signature
   - Check idempotency (skip if already processed)
   - Extract user email from metadata or customer lookup
   - Update user subscription in database
   - Send notification to user

### Subscription Update Flow

1. **Stripe sends webhook event**
   - `customer.subscription.updated` or `customer.subscription.deleted`
   - Webhook handler verifies signature and checks idempotency

2. **Extract User Information**
   - Get customer ID from subscription
   - Lookup user email from `billing_customers` table
   - Fallback to Stripe API if not cached

3. **Update Database**
   - Update `users` table with new subscription status
   - Update `billing_customers` table with subscription ID
   - Clear tier cache for user

4. **Send Notifications**
   - Send appropriate notification based on status change
   - User receives email notification

## Security Considerations

### Stripe Security

- **Webhook Signature Verification:** All webhooks verified before processing
- **Environment-Specific Secrets:** Different secrets for dev/prod prevent cross-environment issues
- **Idempotency:** Prevents duplicate processing of webhook events
- **Error Handling:** Proper HTTP status codes prevent infinite retries

### Auth0 Security

- **Minimal Scopes:** Only request necessary permissions
- **JWT Strategy:** Stateless authentication reduces attack surface
- **Email Verification:** Sync verification status for feature gating
- **Role-Based Access:** Roles extracted securely from multiple sources

## Testing Recommendations

### Stripe Testing

1. **Test Webhook Events:**
   - Use Stripe CLI to send test webhook events
   - Verify idempotency (send same event twice)
   - Test deleted customer handling

2. **Test Customer Creation:**
   - Verify customer ID caching works
   - Test deleted customer cleanup
   - Test email lookup fallback

3. **Test Checkout Flow:**
   - Create checkout session
   - Complete payment
   - Verify webhook processing
   - Check database updates

### Auth0 Testing

1. **Test User Creation:**
   - Login with new user
   - Verify user record created in database
   - Check `last_login` timestamp updated

2. **Test Email Verification:**
   - Login with verified email
   - Verify `email_verified` synced correctly
   - Test unverified email handling

3. **Test Role Extraction:**
   - Test roles in id_token
   - Test Management API fallback
   - Verify roles stored in session

## Monitoring & Debugging

### Stripe Monitoring

- **Webhook Events:** Check `webhook_events` table for processing status
- **Customer Mappings:** Check `billing_customers` table for email-to-customer-ID mappings
- **Subscription Status:** Check `users` table for subscription status

### Auth0 Monitoring

- **User Creation:** Check `users` table for new user records
- **Login Activity:** Check `last_login` timestamps
- **Email Verification:** Check `email_verified` status

## Troubleshooting

### Common Issues

1. **Webhook Events Not Processing:**
   - Check webhook secret matches Stripe dashboard
   - Verify webhook endpoint URL is correct
   - Check webhook signature verification logs

2. **Customer Not Found:**
   - Check `billing_customers` table for mapping
   - Verify customer exists in Stripe
   - Check email matches exactly

3. **User Not Created:**
   - Check Auth0 callback logs
   - Verify `syncUserFromAuth0()` is called
   - Check database connection

4. **Subscription Not Updated:**
   - Check webhook event processing logs
   - Verify idempotency check
   - Check user email lookup

## References

- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Auth0 Best Practices](https://auth0.com/docs/best-practices)
- [NextAuth.js Documentation](https://next-auth.js.org/)
