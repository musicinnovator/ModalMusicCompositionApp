// ADDITIVE: Subscription Management Hook
// Manages user subscription state and feature access

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase-client';
import { useAuth } from './useAuth';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { UserSubscription, SubscriptionTier, FeatureAccess } from '../types/subscription';
import { getPlanByTier, isFeatureAvailable, getMinimumTierForFeature } from '../lib/subscription-plans';
import type { SubscriptionPlan } from '../types/subscription';

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user subscription
  const fetchSubscription = useCallback(async () => {
    if (!user?.id) {
      // Not authenticated - default to free tier
      setSubscription({
        user_id: 'anonymous',
        subscription_tier: 'free',
        subscription_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch from Supabase via KV store
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c0ac5ce8/subscription/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setSubscription(data.subscription);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      
      // Default to free tier on error
      setSubscription({
        user_id: user.id,
        subscription_tier: 'free',
        subscription_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load subscription on mount and when user changes
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Get current plan
  const currentPlan: SubscriptionPlan = subscription 
    ? getPlanByTier(subscription.subscription_tier)
    : getPlanByTier('free');

  // Check if user has access to a feature
  const checkFeatureAccess = useCallback((
    feature: keyof SubscriptionPlan['limits']
  ): FeatureAccess => {
    const tier = subscription?.subscription_tier || 'free';
    const hasAccess = isFeatureAvailable(tier, feature);

    if (hasAccess) {
      return { hasAccess: true };
    }

    const minimumTier = getMinimumTierForFeature(feature);
    
    return {
      hasAccess: false,
      requiresUpgrade: true,
      minimumTier: minimumTier || 'premium',
      reason: `This feature requires ${minimumTier || 'premium'} subscription`
    };
  }, [subscription]);

  // Check export limit for free tier
  const checkExportLimit = useCallback(async (): Promise<FeatureAccess> => {
    const tier = subscription?.subscription_tier || 'free';
    
    // Premium and Pro have unlimited exports
    if (tier !== 'free') {
      return { hasAccess: true };
    }

    // Check daily export count for free tier
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c0ac5ce8/export-count/${user?.id || 'anonymous'}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check export limit');
      }

      const { count, limit } = await response.json();

      if (count >= limit) {
        return {
          hasAccess: false,
          requiresUpgrade: true,
          minimumTier: 'premium',
          reason: `You've reached the daily export limit (${limit}). Upgrade to Premium for unlimited exports.`
        };
      }

      return { hasAccess: true };
    } catch (err) {
      console.error('Error checking export limit:', err);
      // Allow exports on error
      return { hasAccess: true };
    }
  }, [subscription, user?.id]);

  // Increment export count
  const incrementExportCount = useCallback(async () => {
    const tier = subscription?.subscription_tier || 'free';
    
    // Only track for free tier
    if (tier !== 'free') return;

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c0ac5ce8/increment-export`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user?.id || 'anonymous'
          })
        }
      );
    } catch (err) {
      console.error('Error incrementing export count:', err);
    }
  }, [subscription, user?.id]);

  // Upgrade subscription
  const upgradeSubscription = useCallback(async (
    newTier: SubscriptionTier,
    paymentProvider: 'stripe' | 'paypal'
  ) => {
    // This will be handled by payment components
    // Just return the intent to upgrade
    return {
      newTier,
      paymentProvider,
      currentTier: subscription?.subscription_tier || 'free'
    };
  }, [subscription]);

  return {
    subscription,
    currentPlan,
    loading,
    error,
    isPremium: subscription?.subscription_tier === 'premium',
    isPro: subscription?.subscription_tier === 'pro',
    isFree: subscription?.subscription_tier === 'free',
    isActive: subscription?.subscription_status === 'active',
    checkFeatureAccess,
    checkExportLimit,
    incrementExportCount,
    upgradeSubscription,
    refreshSubscription: fetchSubscription
  };
}
