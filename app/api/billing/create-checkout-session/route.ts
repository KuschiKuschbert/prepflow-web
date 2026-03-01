import { ApiErrorHandler } from '@/lib/api-error-handler';
import { requireAuth } from '@/lib/auth0-api-helpers';
import { resolvePriceIdFromTier } from '@/lib/billing';
import { APP_BASE_URL } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { getStripe } from '@/lib/stripe';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const checkoutSessionSchema = z
  .object({
    priceId: z.string().optional(),
    tier: z.enum(['starter', 'pro', 'business', 'curbos', 'bundle']).optional(),
  })
  .refine(data => data.priceId || data.tier, {
    message: 'Either priceId or tier must be provided',
  });

/**
 * Handles the creation of a Stripe Checkout session.
 */
export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        ApiErrorHandler.createError('Stripe not configured', 'STRIPE_NOT_CONFIGURED', 501),
        { status: 501 },
      );
    }

    const user = await requireAuth(req);
    const email = user.email;

    const body = await safeParseBody(req);
    const validationResult = checkoutSessionSchema.safeParse(body || {});

    if (!validationResult.success) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          validationResult.error.issues[0]?.message || 'Invalid request body',
          'VALIDATION_ERROR',
          400,
        ),
        { status: 400 },
      );
    }

    const { priceId: validatedPriceId, tier } = validationResult.data;
    const priceId = validatedPriceId || resolvePriceIdFromTier(tier);

    if (!priceId) {
      return NextResponse.json(
        ApiErrorHandler.createError('Missing priceId or tier', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    // Resolve Stripe Customer
    const existingCustomers = await stripe.customers.list({ email: email, limit: 1 });
    const customerId =
      existingCustomers.data.length > 0
        ? existingCustomers.data[0].id
        : (await stripe.customers.create({ email })).id;

    // Determine tier (flattened mapping)
    const determinedTier = (() => {
      if (tier === 'curbos' || tier === 'bundle') return 'business';
      if (tier) return tier;
      if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY) return 'starter';
      if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return 'pro';
      return 'business'; // Default to business for other prices
    })();

    const origin = req.headers.get('origin') || APP_BASE_URL;

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/webapp/settings/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/webapp/settings/billing?status=cancelled`,
      payment_method_collection: 'always',
      allow_promotion_codes: true,
      metadata: { tier: determinedTier, user_email: email, created_by: 'checkout_api' },
      subscription_data: { metadata: { tier: determinedTier, user_email: email } },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    logger.error('[Billing API] Checkout session error:', error);
    return NextResponse.json(
      ApiErrorHandler.createError('Failed to create checkout session', 'STRIPE_ERROR', 500),
      { status: 500 },
    );
  }
}
