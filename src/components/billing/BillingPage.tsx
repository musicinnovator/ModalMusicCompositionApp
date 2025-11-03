// ADDITIVE: Billing Management Page
// Allows users to view and manage their subscription

import { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { PricingCard } from './PricingCard';
import { PaymentSelector } from './PaymentSelector';
import { SUBSCRIPTION_PLANS } from '../../lib/subscription-plans';
import type { SubscriptionPlan } from '../../types/subscription';
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  Crown,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function BillingPage() {
  const { user } = useAuth();
  const { subscription, currentPlan, loading: subLoading } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = (plan: SubscriptionPlan, period: 'monthly' | 'annual') => {
    if (plan.tier === 'free') {
      toast.info('You are already on the free plan');
      return;
    }
    setSelectedPlan(plan);
    setBillingPeriod(period);
  };

  const handlePaymentMethodSelected = async (method: 'stripe' | 'paypal') => {
    if (!selectedPlan || !user) return;

    setLoading(true);
    
    try {
      // For now, show a toast - actual integration would happen here
      toast.info(`Payment processing with ${method} would happen here. Integration pending.`);
      
      // TODO: Implement actual payment flow
      // if (method === 'stripe') {
      //   await handleStripeCheckout();
      // } else {
      //   await handlePayPalCheckout();
      // }
      
      setSelectedPlan(null);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id && !subscription?.paypal_subscription_id) {
      toast.error('No active subscription to cancel');
      return;
    }

    setLoading(true);
    
    try {
      toast.info('Subscription cancellation would happen here. Integration pending.');
      // TODO: Implement cancellation
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  if (subLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <PaymentSelector
        plan={selectedPlan}
        billingPeriod={billingPeriod}
        onPaymentMethodSelected={handlePaymentMethodSelected}
        onCancel={() => setSelectedPlan(null)}
        loading={loading}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription Overview */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Current Subscription</h2>
              <p className="text-sm text-muted-foreground">
                Manage your subscription and billing
              </p>
            </div>
            <Badge 
              variant={subscription?.subscription_status === 'active' ? 'default' : 'secondary'}
              className="gap-1"
            >
              {subscription?.subscription_status === 'active' ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              {subscription?.subscription_status || 'Unknown'}
            </Badge>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-semibold">{currentPlan.name}</p>
                </div>
              </div>

              {subscription?.payment_provider && (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="text-lg font-semibold capitalize">
                      {subscription.payment_provider}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {subscription?.current_period_end && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {subscription.cancel_at_period_end ? 'Expires on' : 'Renews on'}
                    </p>
                    <p className="text-lg font-semibold">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {subscription?.cancel_at_period_end && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription will be canceled at the end of the current period
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {subscription?.subscription_tier !== 'free' && !subscription?.cancel_at_period_end && (
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Pricing Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available Plans</h2>
          <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as 'monthly' | 'annual')}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="annual">
                Annual
                <Badge variant="secondary" className="ml-2 text-xs">
                  Save 17%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.tier === subscription?.subscription_tier}
              billingPeriod={billingPeriod}
              onSelectPlan={handleSelectPlan}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Need help choosing?</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-semibold">Free:</span> Perfect for trying out basic modal composition and learning counterpoint fundamentals
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-semibold">Premium:</span> Ideal for serious composers who need advanced features like AI fugue generation and all 80+ modes
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-semibold">Professional:</span> Best for professionals requiring the complete DAW experience with timeline, song suite, and composer library
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
