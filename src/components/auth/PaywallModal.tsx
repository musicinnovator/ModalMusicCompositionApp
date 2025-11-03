// ADDITIVE: Paywall Upgrade Prompt Modal
// Shows when users try to access premium features

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Check, Sparkles, Lock } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../../lib/subscription-plans';
import type { SubscriptionTier } from '../../types/subscription';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  minimumTier?: SubscriptionTier;
  onUpgrade: () => void;
}

export function PaywallModal({ 
  open, 
  onOpenChange, 
  featureName,
  minimumTier = 'premium',
  onUpgrade 
}: PaywallModalProps) {
  const requiredPlan = SUBSCRIPTION_PLANS[minimumTier];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-gradient-to-r from-violet-500 to-purple-500 p-3">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Unlock {featureName}
          </DialogTitle>
          <DialogDescription className="text-center">
            This feature requires a {requiredPlan.name} subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Required Plan Highlight */}
          <div className="rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-2 border-violet-500/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <h3 className="font-bold text-lg">{requiredPlan.name}</h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${requiredPlan.price.monthly}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  or ${requiredPlan.price.annual}/year
                </p>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2">
              {requiredPlan.features.slice(0, 5).map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
              {requiredPlan.features.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  + {requiredPlan.features.length - 5} more features...
                </p>
              )}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Why upgrade?</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Access all {minimumTier === 'pro' ? '16+' : '8'} professional UI themes</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Unlimited exports and MIDI conversions</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Priority support and early access to new features</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                onUpgrade();
                onOpenChange(false);
              }}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              size="lg"
            >
              Upgrade to {requiredPlan.name}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime • No long-term commitment • Secure payment
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
