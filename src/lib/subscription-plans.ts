// ADDITIVE: Subscription Plan Definitions
// Defines the three subscription tiers with their features and limits

import { SubscriptionPlan } from '../types/subscription';

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: {
      monthly: 0,
      annual: 0
    },
    features: [
      '3 Basic Modal Systems',
      'Simple Melody Generation',
      'Basic Counterpoint (Species I)',
      'Limited Exports (3 per day)',
      '2 Basic UI Themes',
      'Basic Audio Playback'
    ],
    limits: {
      exportPerDay: 3,
      modesAccess: 3,
      themesAccess: 2,
      canUseTimeline: false,
      canUseFugueAI: false,
      canUseCanonEngine: false,
      canUseHarmonyEngine: false,
      canUseArpeggio: false,
      canUseMidiConverter: false,
      canUseComposerLibrary: false
    }
  },
  
  premium: {
    id: 'premium',
    name: 'Premium',
    tier: 'premium',
    price: {
      monthly: 14.99,
      annual: 149.00 // ~17% discount
    },
    features: [
      'All 80+ Musical Modes',
      'Complete Canon Engine (14 Types)',
      'AI-Driven Fugue Generator',
      'Complete Arpeggio System (64 Patterns)',
      'All Species Counterpoint',
      'Harmony Engine with Chord Progressions',
      '8 Professional UI Themes',
      'Unlimited Exports',
      'MIDI Import/Export',
      'Session Memory Bank',
      'Advanced Visualization'
    ],
    limits: {
      exportPerDay: undefined, // unlimited
      modesAccess: undefined, // all modes
      themesAccess: 8,
      canUseTimeline: false,
      canUseFugueAI: true,
      canUseCanonEngine: true,
      canUseHarmonyEngine: true,
      canUseArpeggio: true,
      canUseMidiConverter: true,
      canUseComposerLibrary: true
    }
  },
  
  pro: {
    id: 'pro',
    name: 'Professional',
    tier: 'pro',
    price: {
      monthly: 24.99,
      annual: 249.00 // ~17% discount
    },
    features: [
      'Everything in Premium',
      'Professional Timeline & DAW Features',
      'Complete Song Creation Suite',
      'All 16+ Professional UI Themes',
      'Advanced Audio Effects Suite',
      'Famous Composer Accompaniment Library',
      'MIDI to Accompaniment Converter',
      'Batch Processing',
      'Priority Support',
      'Early Access to New Features'
    ],
    limits: {
      exportPerDay: undefined, // unlimited
      modesAccess: undefined, // all modes
      themesAccess: undefined, // all themes
      canUseTimeline: true,
      canUseFugueAI: true,
      canUseCanonEngine: true,
      canUseHarmonyEngine: true,
      canUseArpeggio: true,
      canUseMidiConverter: true,
      canUseComposerLibrary: true
    }
  }
};

// Helper to get plan by tier
export function getPlanByTier(tier: string): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS.free;
}

// Helper to check if a feature is available in a tier
export function isFeatureAvailable(
  tier: string,
  feature: keyof SubscriptionPlan['limits']
): boolean {
  const plan = getPlanByTier(tier);
  const limit = plan.limits[feature];
  
  // If undefined, it's unlimited/available
  if (limit === undefined) return true;
  
  // If it's a boolean, return it directly
  if (typeof limit === 'boolean') return limit;
  
  // If it's a number, true if > 0
  return limit > 0;
}

// Get minimum tier required for a feature
export function getMinimumTierForFeature(
  feature: keyof SubscriptionPlan['limits']
): 'free' | 'premium' | 'pro' | null {
  if (isFeatureAvailable('free', feature)) return 'free';
  if (isFeatureAvailable('premium', feature)) return 'premium';
  if (isFeatureAvailable('pro', feature)) return 'pro';
  return null;
}
