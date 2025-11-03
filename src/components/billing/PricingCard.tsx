// ADDITIVE: Pricing Card Component
// Displays subscription plan pricing and features

import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { SubscriptionPlan } from '../../types/subscription';

interface PricingCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  billingPeriod: 'monthly' | 'annual';
  onSelectPlan: (plan: SubscriptionPlan, billingPeriod: 'monthly' | 'annual') => void;
  loading?: boolean;
}

export function PricingCard({ 
  plan, 
  isCurrentPlan, 
  billingPeriod,
  onSelectPlan,
  loading 
}: PricingCardProps) {
  const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annual;
  const monthlyPrice = billingPeriod === 'annual' ? (plan.price.annual / 12).toFixed(2) : price;
  
  const isPremium = plan.tier === 'premium';
  const isPro = plan.tier === 'pro';
  const isFree = plan.tier === 'free';

  const Icon = isPro ? Crown : isPremium ? Zap : Sparkles;

  const cardClassName = isPro
    ? 'border-2 border-violet-500 shadow-xl shadow-violet-500/20 relative overflow-hidden'
    : isPremium
    ? 'border-2 border-purple-500 shadow-lg shadow-purple-500/10'
    : 'border-2';

  return (
    <Card className={cardClassName}>
      {isPro && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-violet-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
          MOST POPULAR
        </div>
      )}
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`rounded-full p-2 ${
              isPro ? 'bg-gradient-to-r from-violet-500 to-purple-500' :
              isPremium ? 'bg-purple-500' :
              'bg-gray-500'
            }`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold">{plan.name}</h3>
          </div>
          
          {isCurrentPlan && (
            <Badge variant="secondary" className="text-xs">
              Current Plan
            </Badge>
          )}
        </div>

        {/* Pricing */}
        <div className="space-y-1">
          {isFree ? (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">Free</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">${monthlyPrice}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              {billingPeriod === 'annual' && (
                <p className="text-xs text-muted-foreground">
                  Billed ${price}/year (save ~17%)
                </p>
              )}
            </>
          )}
        </div>

        {/* CTA Button */}
        <Button
          className={`w-full ${
            isPro ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600' :
            isPremium ? 'bg-purple-500 hover:bg-purple-600' :
            ''
          }`}
          variant={isFree ? 'outline' : 'default'}
          onClick={() => onSelectPlan(plan, billingPeriod)}
          disabled={isCurrentPlan || loading}
        >
          {isCurrentPlan ? 'Current Plan' : isFree ? 'Get Started' : 'Upgrade Now'}
        </Button>

        {/* Features */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Features included:</p>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
