import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_CONFIG } from "@/lib/stripe";
import { PlanTier } from "@/types";
import { UpgradeButton } from "./upgrade-button";

interface PricingCardProps {
  planTier: PlanTier;
  currentPlan?: PlanTier;
  isPopular?: boolean;
  className?: string;
}

export function PricingCard({ planTier, currentPlan, isPopular, className }: PricingCardProps) {
  const plan = PLAN_CONFIG[planTier];
  const isCurrentPlan = currentPlan === planTier;
  const isUpgrade = currentPlan === 'free' && planTier !== 'free';
  const isDowngrade = currentPlan && currentPlan !== 'free' && planTier === 'free';

  return (
    <Card className={`relative ${isPopular ? 'border-blue-500 border-2' : ''} ${className}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="text-gray-600">{plan.description}</CardDescription>
        
        <div className="mt-4">
          {plan.price === 0 ? (
            <div className="text-3xl font-bold">Free</div>
          ) : (
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-gray-500 ml-1">/month</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {isCurrentPlan ? (
          <Button 
            variant="outline" 
            className="w-full" 
            disabled
          >
            Current Plan
          </Button>
        ) : planTier === 'free' ? (
          <Button 
            variant={isDowngrade ? "outline" : "secondary"} 
            className="w-full"
            disabled={currentPlan === 'free'}
          >
            {isDowngrade ? "Downgrade" : "Get Started"}
          </Button>
        ) : (
          <UpgradeButton 
            planTier={planTier}
            variant={isPopular ? "default" : "outline"}
            className="w-full"
          >
            {isUpgrade ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
          </UpgradeButton>
        )}
      </CardFooter>
    </Card>
  );
}

interface PricingGridProps {
  currentPlan?: PlanTier;
  className?: string;
}

export function PricingGrid({ currentPlan, className }: PricingGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto ${className}`}>
      <PricingCard planTier="free" currentPlan={currentPlan} />
      <PricingCard planTier="pro" currentPlan={currentPlan} isPopular />
      <PricingCard planTier="team" currentPlan={currentPlan} />
    </div>
  );
}