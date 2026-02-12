
import { createContext, useContext, useEffect, useState } from 'react';
import { Purchases as PurchasesWeb } from '@revenuecat/purchases-js';
import { useAuth } from './AuthContext';

import { Capacitor } from '@capacitor/core';

// API Keys
const API_KEY_NATIVE = import.meta.env.VITE_REVENUECAT_NATIVE_KEY || 'test_ahdyTvwrqhvvObNIoyEVrCcAJmj';
const API_KEY_WEB = import.meta.env.VITE_REVENUECAT_WEB_KEY || 'rcb_UgxRmwDgamofLnXcFYYRFefHtCnA';

// Structured logger
const rcLog = (category: string, message: string, data?: any) => {
    const prefix = `[RC:${category}]`;
    if (data) {
        console.log(prefix, message, data);
    } else {
        console.log(prefix, message);
    }
};

interface RevenueCatContextType {
    isPro: boolean;
    currentCustomerInfo: any | null;
    packages: any[];
    purchasePackage: (pack: any) => Promise<void>;
    restorePurchases: () => Promise<void>;
    presentCustomerCenter: () => Promise<void>;
    loading: boolean;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export const RevenueCatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [isPro, setIsPro] = useState(false);
    const [currentCustomerInfo, setCurrentCustomerInfo] = useState<any | null>(null);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const updateCustomerInfo = (info: any) => { 
        setCurrentCustomerInfo(info);
        const activeEntitlements = Object.keys(info?.entitlements?.active || {});
        rcLog('ENTITLEMENT', 'Active entitlements:', activeEntitlements);
        
        if (info?.entitlements?.active?.['Flight Solo Pro'] || info?.entitlements?.active?.['pro']) {
            setIsPro(true);
            rcLog('ENTITLEMENT', '✅ Pro access GRANTED');
        } else {
            setIsPro(false);
            rcLog('ENTITLEMENT', '❌ No pro access');
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                if (Capacitor.isNativePlatform()) {
                    // --- NATIVE (iOS/Android) ---
                    rcLog('INIT', 'Initializing for NATIVE platform');
                    const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');
                    
                    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
                    await Purchases.configure({ apiKey: API_KEY_NATIVE });
                    rcLog('INIT', 'Native SDK configured');

                    if (user?.id) {
                        await Purchases.logIn({ appUserID: user.id });
                        rcLog('INIT', `Logged in as: ${user.id}`);
                    }

                    try {
                        const info = await Purchases.getCustomerInfo();
                        updateCustomerInfo((info as any).customerInfo ?? info);
                    } catch (e) {
                        console.error("[RC:INIT] Error fetching customer info (Native)", e);
                    }

                    await loadOfferingsNative(Purchases);

                    (Purchases as any).addCustomerInfoUpdateListener((info: any) => {
                        rcLog('ENTITLEMENT', 'Customer info updated (listener)');
                        updateCustomerInfo(info.customerInfo ?? info);
                    });

                } else {
                    // --- WEB (Stripe via RevenueCat Web Billing) ---
                    rcLog('INIT', 'Initializing for WEB platform');
                    rcLog('INIT', `API key prefix: ${API_KEY_WEB.substring(0, 8)}...`);
                    
                    if (API_KEY_WEB.includes('CHANGE_THIS')) {
                        console.warn("[RC:INIT] RevenueCat Web API Key not set yet.");
                        setLoading(false);
                        return;
                    }

                    // Require authenticated user for web purchases
                    if (!user?.id) {
                        rcLog('INIT', '⏳ No user logged in — skipping web SDK init');
                        setPackages([]);
                        setIsPro(false);
                        setCurrentCustomerInfo(null);
                        setLoading(false);
                        return;
                    }

                    rcLog('INIT', `User ID: ${user.id}`);

                    // Configure with authenticated Supabase user ID
                    const purchases = PurchasesWeb.configure(API_KEY_WEB, user.id);
                    rcLog('INIT', 'Web SDK configured ✅');

                    try {
                        const info = await purchases.getCustomerInfo();
                        updateCustomerInfo(info);
                    } catch (e) {
                        console.error("[RC:INIT] Error fetching customer info (Web)", e);
                    }

                    // Load offerings
                    await loadOfferingsWeb(purchases);
                    
                    // Attach listener
                    const sharedInstance = PurchasesWeb.getSharedInstance();
                    if (sharedInstance && typeof (sharedInstance as any).addCustomerInfoUpdateListener === 'function') {
                         (sharedInstance as any).addCustomerInfoUpdateListener((info: any) => {
                            rcLog('ENTITLEMENT', 'Customer info updated (listener)');
                            updateCustomerInfo(info);
                        });
                    } else if (typeof (purchases as any).addCustomerInfoUpdateListener === 'function') {
                        (purchases as any).addCustomerInfoUpdateListener((info: any) => {
                            rcLog('ENTITLEMENT', 'Customer info updated (listener)');
                            updateCustomerInfo(info);
                        });
                    } else {
                         rcLog('INIT', '⚠️ addCustomerInfoUpdateListener not available');
                    }
                }
            } catch (error) {
                console.error("[RC:INIT] Error initializing RevenueCat:", error);
            } finally {
                setLoading(false);
            }
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]); 

    // --- NATIVE Offerings ---
    const loadOfferingsNative = async (Purchases: any) => {
        try {
            rcLog('OFFERING', 'Fetching native offerings...');
            const offerings = await Purchases.getOfferings();
            
            if (offerings.offerings?.current?.availablePackages?.length > 0) {
                const pkgs = offerings.offerings.current.availablePackages;
                rcLog('OFFERING', `✅ Found ${pkgs.length} packages in current offering`, 
                    pkgs.map((p: any) => ({ id: p.identifier, product: p.product?.identifier }))
                );
                setPackages(pkgs);
            } else {
                rcLog('OFFERING', '⚠️ No packages found in current offering (Native)', offerings);
            }
        } catch (error) {
            console.error("[RC:OFFERING] Error loading offerings (Native):", error);
        }
    };

    // --- WEB Offerings ---
    const loadOfferingsWeb = async (purchasesInstance: any) => {
        try {
            rcLog('OFFERING', 'Fetching web offerings...');
            const offerings = await purchasesInstance.getOfferings();
            
            // Log all available offerings
            const allOfferingIds = Object.keys(offerings.all || {});
            rcLog('OFFERING', `Available offerings: [${allOfferingIds.join(', ')}]`);
            
            // Priority: try default_web first, then fall back to current
            let selectedOffering = offerings.all?.['default_web'] || offerings.current;
            const selectedId = offerings.all?.['default_web'] ? 'default_web' : (offerings.current?.identifier || 'current');
            
            if (selectedOffering && selectedOffering.availablePackages.length > 0) {
                const pkgs = selectedOffering.availablePackages;
                rcLog('OFFERING', `✅ Using offering "${selectedId}" with ${pkgs.length} packages:`);
                
                // Log detailed package info
                pkgs.forEach((pkg: any, i: number) => {
                    const product = pkg.rcBillingProduct || pkg.webBillingProduct || pkg.product || {};
                    const price = product.currentPrice?.formattedPrice || product.priceString || 'N/A';
                    const period = product.normalPeriodDuration || product.subscriptionPeriod || 'N/A';
                    const trial = product.defaultSubscriptionOption?.freePhase 
                        || product.freeTrialPhase
                        || pkg.product?.introPrice
                        || null;
                    rcLog('OFFERING', `  Package ${i + 1}: ${pkg.identifier} | ${price} | period: ${period} | trial: ${trial ? JSON.stringify(trial) : 'none'}`);
                });
                
                setPackages(pkgs); 
            } else {
                rcLog('OFFERING', '⚠️ No packages found in any offering', { allOfferingIds, current: offerings.current });
            }
        } catch (error) {
            console.error("[RC:OFFERING] Error loading offerings (Web):", error);
        }
    };

    const purchasePackage = async (pack: any) => {
        const productId = pack?.rcBillingProduct?.identifier || pack?.product?.identifier || pack?.identifier || 'unknown';
        rcLog('PURCHASE', `Initiating purchase for: ${productId}`);
        
        try {
            if (Capacitor.isNativePlatform()) {
                const { Purchases } = await import('@revenuecat/purchases-capacitor');
                rcLog('PURCHASE', 'Opening native purchase dialog...');
                const { customerInfo } = await Purchases.purchasePackage({ aPackage: pack });
                rcLog('PURCHASE', '✅ Purchase complete (Native)');
                updateCustomerInfo(customerInfo);
            } else {
                const purchases = PurchasesWeb.getSharedInstance(); 
                rcLog('PURCHASE', 'Opening Stripe checkout...');
                const { customerInfo } = await purchases.purchasePackage(pack);
                rcLog('PURCHASE', '✅ Purchase complete (Web/Stripe)');
                updateCustomerInfo(customerInfo);
            }
        } catch (error: any) {
            const isCancelled = error.userCancelled || (error.code === 1) || (error.message && error.message.includes('User cancelled'));
            
            if (!isCancelled) {
                console.error("[RC:PURCHASE] ❌ Purchase failed:", error);
            } else {
                rcLog('PURCHASE', 'User cancelled purchase');
            }
        }
    };

    const restorePurchases = async () => {
        rcLog('PURCHASE', 'Restoring purchases...');
        try {
            if (Capacitor.isNativePlatform()) {
                const { Purchases } = await import('@revenuecat/purchases-capacitor');
                const { customerInfo } = await Purchases.restorePurchases();
                rcLog('PURCHASE', '✅ Purchases restored (Native)');
                updateCustomerInfo(customerInfo);
            } else {
                const purchases = PurchasesWeb.getSharedInstance();
                const info = await purchases.getCustomerInfo();
                rcLog('PURCHASE', '✅ Purchases restored (Web)');
                updateCustomerInfo(info);
            }
        } catch (error) {
            console.error("[RC:PURCHASE] Error restoring purchases:", error);
            throw error;
        }
    };

    const presentCustomerCenter = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                 const { RevenueCatUI } = await import('@revenuecat/purchases-capacitor-ui');
                 await RevenueCatUI.presentCustomerCenter();
            } else {
                alert("Please manage your subscription via the Stripe portal sent to your email.");
            }
        } catch (error) {
            console.error("[RC:UI] Error presenting customer center:", error);
        }
    };

    return (
        <RevenueCatContext.Provider value={{ isPro, currentCustomerInfo, packages, purchasePackage, restorePurchases, presentCustomerCenter, loading }}>
            {children}
        </RevenueCatContext.Provider>
    );
};

export const useRevenueCat = () => {
    const context = useContext(RevenueCatContext);
    if (context === undefined) {
        throw new Error('useRevenueCat must be used within a RevenueCatProvider');
    }
    return context;
};
