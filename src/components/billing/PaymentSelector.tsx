// ADDITIVE: Payment Method Selector
// Allows users to choose between Stripe and PayPal

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { CreditCard, DollarSign } from 'lucide-react';
import type { SubscriptionPlan } from '../../types/subscription';

interface PaymentSelectorProps {
  plan: SubscriptionPlan;
  billingPeriod: 'monthly' | 'annual';
  onPaymentMethodSelected: (method: 'stripe' | 'paypal') => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PaymentSelector({
  plan,
  billingPeriod,
  onPaymentMethodSelected,
  onCancel,
  loading
}: PaymentSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'paypal'>('stripe');

  const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annual;

  return (
    <Card className="p-6 space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Choose Payment Method</h3>
        <p className="text-sm text-muted-foreground">
          Select how you'd like to pay for {plan.name}
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-muted p-4 space-y-1">
          <p className="font-semibold">{plan.name} Plan</p>
          <p className="text-2xl font-bold">
            ${price}
            <span className="text-sm font-normal text-muted-foreground">
              /{billingPeriod === 'monthly' ? 'month' : 'year'}
            </span>
          </p>
        </div>

        <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as 'stripe' | 'paypal')}>
          <div className="space-y-3">
            <div className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
              selectedMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-muted'
            }`} onClick={() => setSelectedMethod('stripe')}>
              <RadioGroupItem value="stripe" id="stripe" />
              <Label htmlFor="stripe" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="rounded-full bg-primary/10 p-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Credit/Debit Card</p>
                  <p className="text-xs text-muted-foreground">Powered by Stripe</p>
                </div>
              </Label>
            </div>

            <div className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
              selectedMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-muted'
            }`} onClick={() => setSelectedMethod('paypal')}>
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="rounded-full bg-blue-500/10 p-2">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">PayPal</p>
                  <p className="text-xs text-muted-foreground">Pay with PayPal account</p>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={() => onPaymentMethodSelected(selectedMethod)}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Continue to Payment'}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Your payment is secure and encrypted. Cancel anytime.
      </p>
    </Card>
  );
}
