// ADDITIVE: Subscription Management Types
// Defines subscription plans, user status, and payment-related types

export type SubscriptionTier = 'free' | 'premium' | 'pro';

export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'unpaid' 
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired';

export type PaymentProvider = 'stripe' | 'paypal';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: {
    monthly: number;
    annual: number;
  };
  features: string[];
  limits: {
    exportPerDay?: number;
    modesAccess?: number;
    themesAccess?: number;
    canUseTimeline?: boolean;
    canUseFugueAI?: boolean;
    canUseCanonEngine?: boolean;
    canUseHarmonyEngine?: boolean;
    canUseArpeggio?: boolean;
    canUseMidiConverter?: boolean;
    canUseComposerLibrary?: boolean;
  };
  stripeProductId?: string;
  paypalPlanId?: string;
}

export interface UserSubscription {
  user_id: string;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  payment_provider?: PaymentProvider;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  paypal_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription: UserSubscription;
}

// Feature gate results
export interface FeatureAccess {
  hasAccess: boolean;
  reason?: string;
  requiresUpgrade?: boolean;
  minimumTier?: SubscriptionTier;
}

// Export tracking for free tier limits
export interface ExportLog {
  user_id: string;
  export_date: string;
  export_count: number;
}
