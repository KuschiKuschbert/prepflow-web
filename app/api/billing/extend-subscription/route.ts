import { ApiErrorHandler } from '@/lib/api-error-handler';
import { requireAuth } from '@/lib/auth0-api-helpers';
import { clearTierCache } from '@/lib/feature-gate';
import { logger } from '@/lib/logger';
import { getStripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { z } from 'zod';

const extendSubscriptionSchema = z.object({
  months: z.number().int().positive().max(12).optional().default(1),
});

const AVG_SECONDS_IN_MONTH = 30 * 24 * 60 * 60;

/**
 * POST /api/billing/extend-subscription
 * Extend current subscription by adding billing periods
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
    if (!user?.email) {
      return NextResponse.json(
        ApiErrorHandler.createError('Authentication required', 'UNAUTHORIZED', 401),
        { status: 401 },
      );
    }

    const userEmail = user.email as string;
    const body = await safeParseBody(req);
    const validationResult = extendSubscriptionSchema.safeParse(body || {});

    if (!validationResult.success) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          validationResult.error.issues[0]?.message || 'Invalid body',
          'VALIDATION_ERROR',
          400,
        ),
        { status: 400 },
      );
    }

    const { months } = validationResult.data;

    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError('Database not available', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('stripe_subscription_id')
      .eq('email', userEmail)
      .single();

    if (userError || !userData?.stripe_subscription_id) {
      return NextResponse.json(
        ApiErrorHandler.createError('No active subscription found', 'SUBSCRIPTION_NOT_FOUND', 404),
        { status: 404 },
      );
    }

    const subscriptionId = userData.stripe_subscription_id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription || subscription.status === 'canceled') {
      return NextResponse.json(
        ApiErrorHandler.createError(
          'Subscription invalid or cancelled',
          'SUBSCRIPTION_INVALID',
          400,
        ),
        { status: 400 },
      );
    }

    const currentPeriodEnd = (
      subscription as unknown as Stripe.Subscription & {
        current_period_end: number;
      }
    ).current_period_end;
    const newPeriodEnd = currentPeriodEnd + months * AVG_SECONDS_IN_MONTH;

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      billing_cycle_anchor:
        newPeriodEnd as unknown as Stripe.SubscriptionUpdateParams.BillingCycleAnchor,
      proration_behavior: 'none',
    });

    const updatedSub = updatedSubscription as unknown as Stripe.Subscription & {
      current_period_end: number;
      current_period_start: number;
    };
    const newExpiresAt = updatedSub.current_period_end
      ? new Date(updatedSub.current_period_end * 1000)
      : null;

    await supabaseAdmin
      .from('users')
      .update({
        subscription_expires: newExpiresAt?.toISOString() || null,
        subscription_current_period_start: updatedSub.current_period_start
          ? new Date(updatedSub.current_period_start * 1000).toISOString()
          : null,
      })
      .eq('email', userEmail);

    clearTierCache(userEmail);

    return NextResponse.json({
      success: true,
      message: `Extended by ${months} month(s)`,
      subscription: {
        id: updatedSubscription.id,
        current_period_end: updatedSub.current_period_end,
        expires_at: newExpiresAt?.toISOString(),
      },
    });
  } catch (error) {
    logger.error('[Billing API] Extension error:', error);
    return NextResponse.json(
      ApiErrorHandler.createError('Failed to extend subscription', 'STRIPE_ERROR', 500),
      { status: 500 },
    );
  }
}
