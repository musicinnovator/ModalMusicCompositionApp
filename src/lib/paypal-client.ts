// ADDITIVE: PayPal Payment Integration
// Handles PayPal subscription and payment processing

export interface PayPalSubscriptionParams {
  planId: string;
  userId: string;
  email: string;
}

export async function createPayPalSubscription(params: PayPalSubscriptionParams) {
  try {
    const response = await fetch('/api/paypal/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to create PayPal subscription');
    }

    const { subscriptionId, approvalUrl } = await response.json();
    return { subscriptionId, approvalUrl };
  } catch (error) {
    console.error('Error creating PayPal subscription:', error);
    throw error;
  }
}

export async function cancelPayPalSubscription(subscriptionId: string) {
  try {
    const response = await fetch('/api/paypal/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel PayPal subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling PayPal subscription:', error);
    throw error;
  }
}

export function loadPayPalScript(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is undefined'));
      return;
    }

    // Check if PayPal script is already loaded
    if ((window as any).paypal) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.body.appendChild(script);
  });
}

export async function initializePayPal() {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  if (!clientId) {
    console.warn('VITE_PAYPAL_CLIENT_ID not found in environment variables');
    return null;
  }

  try {
    await loadPayPalScript(clientId);
    return (window as any).paypal;
  } catch (error) {
    console.error('Error initializing PayPal:', error);
    return null;
  }
}
