// ADDITIVE: Authentication Header Component
// Displays auth status and provides login/signup/user menu

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { AuthModal } from './AuthModal';
import { UserMenu } from './UserMenu';
import { BillingPage } from '../billing/BillingPage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { User, CreditCard } from 'lucide-react';

export function AuthHeader() {
  const { isAuthenticated, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'signup'>('login');

  const handleOpenLogin = () => {
    setAuthDefaultTab('login');
    setShowAuthModal(true);
  };

  const handleOpenSignup = () => {
    setAuthDefaultTab('signup');
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-pulse h-8 w-16 bg-muted rounded" />
        <div className="animate-pulse h-8 w-16 bg-muted rounded" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <UserMenu 
            onOpenBilling={() => setShowBillingModal(true)}
          />
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenLogin}
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenSignup}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            >
              Sign Up
            </Button>
          </>
        )}
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab={authDefaultTab}
      />

      <Dialog open={showBillingModal} onOpenChange={setShowBillingModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <CreditCard className="w-6 h-6" />
              Billing & Subscription
            </DialogTitle>
          </DialogHeader>
          <BillingPage />
        </DialogContent>
      </Dialog>
    </>
  );
}
