'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PricingGrid } from './pricing-card';
import { PLAN_CONFIG, hasFeature } from '@/lib/stripe';
import { PlanTier } from '@/types';
import { CreditCard, Users, BarChart3, Zap } from 'lucide-react';

interface BillingSectionProps {
  currentPlan: PlanTier;
  projectCount: number;
  subscriptionStatus?: string;
  periodEnd?: string;
}

export function BillingSection({ 
  currentPlan, 
  projectCount, 
  subscriptionStatus,
  periodEnd 
}: BillingSectionProps) {
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const planDetails = PLAN_CONFIG[currentPlan];
  const projectLimit = planDetails.limits.projects;
  const isNearLimit = projectLimit !== Infinity && projectCount >= projectLimit * 0.8;

  const handleManageBilling = async () => {
    if (currentPlan === 'free') return;
    
    setIsPortalLoading(true);
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to open billing portal');
        return;
      }

      const { portalUrl } = await response.json();
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Billing portal error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsPortalLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Current Plan: {planDetails.name}
              </CardTitle>
              <CardDescription>
                {planDetails.description}
              </CardDescription>
            </div>
            {currentPlan !== 'free' && (
              <Button 
                variant="outline" 
                onClick={handleManageBilling}
                disabled={isPortalLoading}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isPortalLoading ? 'Loading...' : 'Manage Billing'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Projects</div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${isNearLimit ? 'text-amber-600' : 'text-gray-900'}`}>
                  {projectCount}
                </span>
                <span className="text-gray-500">
                  / {projectLimit === Infinity ? '∞' : projectLimit}
                </span>
              </div>
              {isNearLimit && (
                <p className="text-xs text-amber-600">
                  You're approaching your project limit
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-1">
                Templates
                <span className={`text-xs px-2 py-0.5 rounded ${
                  hasFeature(currentPlan, 'templates') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {hasFeature(currentPlan, 'templates') ? 'Available' : 'Pro+'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {hasFeature(currentPlan, 'templates') ? 'Premium' : 'Basic'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-1">
                <Users className="h-4 w-4" />
                Multi-user
                <span className={`text-xs px-2 py-0.5 rounded ${
                  hasFeature(currentPlan, 'multiUser') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {hasFeature(currentPlan, 'multiUser') ? 'Enabled' : 'Team Only'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {hasFeature(currentPlan, 'multiUser') ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          {currentPlan !== 'free' && subscriptionStatus && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subscription Status:</span>
                <span className={`font-medium capitalize ${
                  subscriptionStatus === 'active' ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {subscriptionStatus.replace('_', ' ')}
                </span>
              </div>
              {periodEnd && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Next billing date:</span>
                  <span className="font-medium">
                    {new Date(periodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {(currentPlan === 'free' || isNearLimit) && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>
              {currentPlan === 'free' 
                ? 'Unlock unlimited projects and premium features'
                : 'You\'re running low on projects. Consider upgrading for unlimited access.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PricingGrid currentPlan={currentPlan} className="mt-0" />
          </CardContent>
        </Card>
      )}

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>
            Compare what's included in each plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Feature</h4>
              <div className="space-y-3 text-sm">
                <div>Projects</div>
                <div>Templates</div>
                <div>Multi-user</div>
                <div>Analytics</div>
                <div>Support</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Free</h4>
              <div className="space-y-3 text-sm">
                <div>3 projects</div>
                <div>Basic</div>
                <div>❌</div>
                <div>❌</div>
                <div>Email</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Pro</h4>
              <div className="space-y-3 text-sm">
                <div>Unlimited</div>
                <div>Premium</div>
                <div>❌</div>
                <div>❌</div>
                <div>Priority</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Team</h4>
              <div className="space-y-3 text-sm">
                <div>Unlimited</div>
                <div>Premium</div>
                <div>✅</div>
                <div>✅</div>
                <div>Dedicated</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}