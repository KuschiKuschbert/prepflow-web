/**
 * Hidden feature flags module.
 * Checks the hidden_feature_flags table in Supabase to determine
 * whether a feature is unlocked and enabled for a given user.
 */

import { createSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function isHiddenFeatureEnabled(
  featureKey: string,
  userEmail?: string,
): Promise<boolean> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('hidden_feature_flags')
      .select('enabled')
      .eq('feature_key', featureKey)
      .eq('user_email', userEmail ?? '')
      .maybeSingle();

    if (error) {
      logger.warn('[hidden-feature-flags] Query failed, defaulting to false', {
        featureKey,
        error: error.message,
      });
      return false;
    }

    return data?.enabled === true;
  } catch {
    return false;
  }
}
