'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlanTier } from '@/types';
import { Loader2 } from 'lucide-react';

interface UpgradeButtonProps {
  planTier: PlanTier;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

export function UpgradeButton({
  planTier,
  children,
  variant = 'default',
  size = 'default',
  className,
  disabled,
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (planTier === 'free') return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planTier }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Checkout error:', error);
        
        // Handle common errors
        if (response.status === 401) {
          alert('Please log in to upgrade your plan.');
        } else if (response.status === 400) {
          alert(error.error || 'Invalid request. Please try again.');
        } else {
          alert('Failed to start checkout. Please try again.');
        }
        return;
      }

      const { checkoutUrl } = await response.json();
      
      if (checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleUpgrade}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
}