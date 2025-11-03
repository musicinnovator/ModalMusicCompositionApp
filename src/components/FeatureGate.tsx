// ADDITIVE: Feature Gate Component
// Wraps components to control access based on subscription tier

import { ReactNode } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import type { SubscriptionPlan } from '../types/subscription';
import { Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface FeatureGateProps {
  children: ReactNode;
  feature: keyof SubscriptionPlan['limits'];
  fallback?: ReactNode;
  onUpgradeClick?: () => void;
}

export function FeatureGate({ 
  children, 
  feature, 
  fallback,
  onUpgradeClick 
}: FeatureGateProps) {
  const { checkFeatureAccess, currentPlan } = useSubscription();
  const access = checkFeatureAccess(feature);

  if (access.hasAccess) {
    return <>{children}</>;
  }

  // Show upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="p-8 text-center space-y-4 border-2 border-dashed">
      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Premium Feature</h3>
        <p className="text-sm text-muted-foreground">
          {access.reason || 'This feature requires a premium subscription'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-muted-foreground">Current Plan:</span>
        <Badge variant="outline">{currentPlan.name}</Badge>
        <span className="text-xs text-muted-foreground">→</span>
        <Badge variant="default" className="bg-gradient-to-r from-violet-500 to-purple-500">
          {access.minimumTier?.toUpperCase() || 'PREMIUM'}
        </Badge>
      </div>

      <Button 
        onClick={onUpgradeClick}
        className="w-full max-w-xs bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
      >
        Upgrade to {access.minimumTier || 'Premium'}
      </Button>
    </Card>
  );
}

interface ExportGateProps {
  children: ReactNode;
  onUpgradeClick?: () => void;
}

export function ExportGate({ children, onUpgradeClick }: ExportGateProps) {
  const { checkExportLimit, currentPlan } = useSubscription();
  const [canExport, setCanExport] = React.useState(true);
  const [limitMessage, setLimitMessage] = React.useState('');

  React.useEffect(() => {
    checkExportLimit().then(access => {
      setCanExport(access.hasAccess);
      if (!access.hasAccess && access.reason) {
        setLimitMessage(access.reason);
      }
    });
  }, [checkExportLimit]);

  if (canExport) {
    return <>{children}</>;
  }

  return (
    <Card className="p-8 text-center space-y-4 border-2 border-amber-500/50">
      <div className="flex justify-center">
        <div className="rounded-full bg-amber-500/10 p-4">
          <Lock className="w-8 h-8 text-amber-500" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Export Limit Reached</h3>
        <p className="text-sm text-muted-foreground">
          {limitMessage}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-muted-foreground">Current Plan:</span>
        <Badge variant="outline">{currentPlan.name}</Badge>
      </div>

      <Button 
        onClick={onUpgradeClick}
        className="w-full max-w-xs bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
      >
        Upgrade for Unlimited Exports
      </Button>
    </Card>
  );
}

// Import React for hooks
import * as React from 'react';
