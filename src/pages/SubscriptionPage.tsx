import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRevenueCat } from '../contexts/RevenueCatContext';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Sparkles, Cloud, Plane, Map, Download, Headphones, Star, LogIn } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import clsx from 'clsx';

export function SubscriptionPage() {
  const { isPro, packages, purchasePackage, restorePurchases, loading } = useRevenueCat();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  // Parse packages into monthly/yearly with trial info
  const plans = useMemo(() => {
    const result: Record<string, any> = {};
    for (const pkg of packages) {
      const product = pkg?.rcBillingProduct || pkg?.webBillingProduct || pkg?.product || {};
      const period = product?.normalPeriodDuration 
        || product?.subscriptionPeriod 
        || '';
      const priceStr = product?.currentPrice?.formattedPrice 
        || product?.priceString 
        || '';
      const priceAmount = product?.currentPrice?.amount 
        || product?.price 
        || 0;
      
      // Extract trial info from the package/product
      const trialPhase = product?.defaultSubscriptionOption?.freePhase
        || product?.freeTrialPhase
        || pkg?.product?.introPrice
        || null;
      const hasTrial = !!trialPhase;
      // Parse trial duration (e.g., "P1W" = 1 week = 7 days)
      let trialDays = 0;
      if (trialPhase?.periodDuration) {
        const dur = trialPhase.periodDuration;
        if (dur === 'P1W') trialDays = 7;
        else if (dur === 'P2W') trialDays = 14;
        else if (dur === 'P1M') trialDays = 30;
        else if (dur.startsWith('P') && dur.endsWith('D')) trialDays = parseInt(dur.slice(1, -1)) || 0;
      }
      
      if (period === 'P1M') {
        result.monthly = { pkg, priceStr, priceAmount, period: 'month', hasTrial, trialDays };
      } else if (period === 'P1Y') {
        result.yearly = { pkg, priceStr, priceAmount, period: 'year', hasTrial, trialDays };
      }
    }
    return result;
  }, [packages]);

  // Calculate savings
  const savings = useMemo(() => {
    if (plans.monthly && plans.yearly) {
      const monthlyAnnual = plans.monthly.priceAmount * 12;
      const yearlyPrice = plans.yearly.priceAmount;
      if (monthlyAnnual > 0 && yearlyPrice > 0) {
        // Handle cents (amount may be in cents like 799 = $7.99)
        const pct = Math.round((1 - yearlyPrice / monthlyAnnual) * 100);
        return pct > 0 ? pct : null;
      }
    }
    return null;
  }, [plans]);

  const activePlan = plans[selectedPlan] || plans.monthly || plans.yearly;

  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // --- Auth Gate: require login before purchasing ---
  if (!user) {
    return (
      <div className={clsx("min-h-screen py-12 px-4 flex flex-col items-center justify-center",
        isDark ? '' : 'bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50'
      )}
           style={isDark ? { background: 'linear-gradient(135deg, #0a101f 0%, #0d1b2a 40%, #112240 100%)' } : undefined}>
        <div className="relative">
          <div className={clsx("absolute -inset-6 rounded-3xl blur-2xl",
            isDark ? "bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-sky-500/20 opacity-60" : "bg-gradient-to-r from-sky-300/20 via-indigo-300/20 to-sky-300/20 opacity-40"
          )} />
          <div className={clsx("relative rounded-3xl p-10 max-w-md w-full text-center border",
            isDark ? "border-white/10" : "border-slate-200 shadow-xl"
          )}
               style={isDark
                 ? { background: 'linear-gradient(145deg, rgba(16,32,56,0.9) 0%, rgba(10,20,40,0.95) 100%)', backdropFilter: 'blur(20px)' }
                 : { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }
               }>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                 style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <h1 className={clsx("text-3xl font-bold mb-3", isDark ? "text-white" : "text-slate-900")}>
              Sign in to Go Pro
            </h1>
            <p className={clsx("mb-6 leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>
              Create a free account or sign in to subscribe to FlightSolo Pro and unlock all premium features.
            </p>

            {/* Feature preview */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['Weather Briefings', 'Flight Planning', 'Airport Database', 'Offline Mode'].map((f) => (
                <span key={f} className={clsx("text-xs px-3 py-1.5 rounded-full border",
                  isDark ? "bg-sky-500/10 text-sky-300 border-sky-500/20" : "bg-sky-50 text-sky-600 border-sky-200"
                )}>
                  ✓ {f}
                </span>
              ))}
            </div>

            <button
              onClick={() => navigate('/auth?redirect=/subscription')}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-base shadow-lg shadow-sky-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In or Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isPro) {
    return (
      <div className={clsx("min-h-screen flex flex-col items-center justify-center p-4", 
        isDark ? '' : 'bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50')}
           style={isDark ? { background: 'linear-gradient(135deg, #0a101f 0%, #0d1b2a 40%, #112240 100%)' } : undefined}>
        {/* Subtle glow behind the card */}
        <div className="relative">
          <div className={clsx("absolute -inset-6 rounded-3xl blur-2xl",
            isDark 
              ? "bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-emerald-500/20 opacity-60"
              : "bg-gradient-to-r from-sky-300/30 via-indigo-300/30 to-emerald-300/30 opacity-40"
          )} />
          <div className={clsx("relative rounded-3xl p-10 max-w-md w-full text-center",
            isDark 
              ? "border border-white/10" 
              : "border border-slate-200 shadow-xl"
          )}
               style={isDark 
                 ? { background: 'linear-gradient(145deg, rgba(16,32,56,0.9) 0%, rgba(10,20,40,0.95) 100%)', backdropFilter: 'blur(20px)' }
                 : { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }
               }>
            {/* Animated checkmark circle */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative"
                 style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
              <Shield className="w-10 h-10 text-white" />
              <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                   style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }} />
            </div>
            <h1 className={clsx("text-3xl font-bold mb-3", isDark ? "text-white" : "text-slate-900")}>
              You're a Pro! 🎉
            </h1>
            <p className={clsx("mb-8 leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>
              Thank you for supporting FlightSolo. You now have full access to all premium features.
            </p>
            
            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['Weather Briefings', 'Flight Planning', 'Airport Database', 'Offline Mode'].map((f) => (
                <span key={f} className={clsx("text-xs px-3 py-1.5 rounded-full border",
                  isDark 
                    ? "bg-sky-500/10 text-sky-300 border-sky-500/20"
                    : "bg-sky-50 text-sky-600 border-sky-200"
                )}>
                  ✓ {f}
                </span>
              ))}
            </div>

            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-base shadow-lg shadow-sky-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => window.location.href = '/profile'}
              className={clsx("mt-3 text-sm font-medium transition-colors",
                isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Manage Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    { icon: Cloud, label: 'Advanced Weather Briefings & Maps' },
    { icon: Plane, label: 'Unlimited Flight Planning' },
    { icon: Map, label: 'Interactive Airport Database' },
    { icon: Download, label: 'Offline Mode' },
    { icon: Shield, label: 'Unlimited Saved Profiles' },
    { icon: Headphones, label: 'Priority Support' },
  ];

  const hasBothPlans = plans.monthly && plans.yearly;

  return (
    <div className={clsx("min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center",
      isDark ? '' : 'bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50'
    )}>
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        {activePlan?.hasTrial && (
          <div className={clsx("inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border",
            isDark ? "bg-sky-500/10 border-sky-500/20" : "bg-sky-50 border-sky-200"
          )}>
            <Sparkles className={clsx("w-4 h-4", isDark ? "text-sky-400" : "text-sky-500")} />
            <span className={clsx("text-sm font-medium", isDark ? "text-sky-300" : "text-sky-600")}>{activePlan.trialDays}-Day Free Trial</span>
          </div>
        )}
        <h1 className={clsx("text-4xl sm:text-5xl font-bold mb-4 leading-tight", isDark ? "text-white" : "text-slate-900")}>
          {activePlan?.hasTrial ? (
            <>Try <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">FlightSolo Pro</span> Free</>
          ) : (
            <>Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">FlightSolo Pro</span></>
          )}
        </h1>
        <p className={clsx("text-lg", isDark ? "text-slate-400" : "text-slate-500")}>
          {activePlan?.hasTrial
            ? `Full access to every premium feature for ${activePlan.trialDays} days. No charge until your trial ends.`
            : 'Full access to every premium feature. Unlock all pro tools today.'}
        </p>
      </div>

      {/* Plan Toggle */}
      {hasBothPlans && (
        <div className={clsx("flex items-center backdrop-blur-sm rounded-full p-1 mb-8 border",
          isDark ? "bg-slate-800/60 border-white/5" : "bg-slate-100 border-slate-200"
        )}>
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={clsx(
              'relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200',
              selectedPlan === 'monthly'
                ? isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={clsx(
              'relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200',
              selectedPlan === 'yearly'
                ? isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            Yearly
            {savings && (
              <span className={clsx("ml-2 inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full",
                isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
              )}>
                Save {savings}%
              </span>
            )}
          </button>
        </div>
      )}

      {/* Pricing Card */}
      <div className="relative max-w-lg w-full">
        <div className={clsx("absolute -inset-1 rounded-[2rem] blur-xl",
          isDark ? "bg-gradient-to-r from-sky-500/20 to-indigo-500/20" : "bg-gradient-to-r from-sky-300/20 to-indigo-300/20"
        )}></div>
        <div className={clsx("relative backdrop-blur-xl rounded-3xl p-8 sm:p-10 border",
          isDark ? "bg-slate-800/80 border-white/10" : "bg-white/90 border-slate-200 shadow-xl"
        )}>

          {/* Price Display */}
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-1">
              <span className={clsx("text-5xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                {activePlan?.priceStr || '$-.--'}
              </span>
              <span className={clsx("text-lg", isDark ? "text-slate-400" : "text-slate-500")}>
                /{activePlan?.period || 'mo'}
              </span>
            </div>
            {activePlan?.hasTrial ? (
              <p className={clsx("mt-2 text-sm font-medium", isDark ? "text-sky-300" : "text-sky-500")}>after {activePlan.trialDays}-day free trial</p>
            ) : (
              <p className={clsx("mt-2 text-sm font-medium", isDark ? "text-emerald-400" : "text-emerald-600")}>Best value — billed annually</p>
            )}
            {selectedPlan === 'yearly' && plans.monthly && (
              <p className={clsx("text-xs mt-1", isDark ? "text-slate-500" : "text-slate-400")}>
                vs {plans.monthly.priceStr}/month billed monthly
              </p>
            )}
          </div>

          {/* Divider */}
          <div className={clsx("h-px bg-gradient-to-r from-transparent to-transparent mb-8", isDark ? "via-white/10" : "via-slate-200")}></div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  isDark ? "bg-sky-500/10" : "bg-sky-50"
                )}>
                  <feature.icon className={clsx("w-4 h-4", isDark ? "text-sky-400" : "text-sky-500")} />
                </div>
                <span className={clsx(isDark ? "text-slate-200" : "text-slate-700")}>{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className={clsx("h-px bg-gradient-to-r from-transparent to-transparent mb-8", isDark ? "via-white/10" : "via-slate-200")}></div>

          {/* CTA */}
          {activePlan ? (
            <button
              onClick={() => purchasePackage(activePlan.pkg)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-lg shadow-lg shadow-sky-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-sky-500/30"
            >
              {activePlan.hasTrial ? 'Start Free Trial' : 'Subscribe Now'}
            </button>
          ) : (
            <div className="text-center text-amber-400 text-sm py-2">
              Loading plans...
            </div>
          )}

          {/* Fine Print */}
          <p className="text-center text-slate-500 text-xs mt-5 leading-relaxed">
            {activePlan?.hasTrial
              ? `Free for ${activePlan.trialDays} days, then ${activePlan?.priceStr}/${activePlan?.period}. Cancel anytime.`
              : `${activePlan?.priceStr}/${activePlan?.period}. Cancel anytime.`
            }{' '}
            Your subscription renews automatically unless cancelled at least 24 hours before the end of the current period.
          </p>

          {/* Restore */}
          <button
            onClick={restorePurchases}
            className={clsx("mt-4 w-full text-sm transition-colors text-center",
              isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
            )}
          >
            Already subscribed? Restore Purchases
          </button>
        </div>
      </div>
    </div>
  );
}
