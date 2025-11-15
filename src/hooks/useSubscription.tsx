import { useCallback, useEffect, useRef, useState } from 'react';
import { subscriptionsApi, Subscription } from '@/lib/api';
import { useAuth } from './useAuth';

const SUBSCRIPTION_CACHE_TTL = 1000 * 60 * 5; // 5 minutos (aumentado)
const SUBSCRIPTION_LOCAL_KEY = 'gamingflix_subscription_cache';

interface SubscriptionCache {
  userId: string;
  subscription: Subscription | null;
  isFounder: boolean;
  timestamp: number;
}

// Cache em memória
const subscriptionCache = new Map<
  string,
  { subscription: Subscription | null; isFounder: boolean; timestamp: number }
>();

// Funções para cache persistente
const getLocalCache = (userId: string): SubscriptionCache | null => {
  try {
    const cached = localStorage.getItem(SUBSCRIPTION_LOCAL_KEY);
    if (!cached) return null;
    
    const data: SubscriptionCache = JSON.parse(cached);
    if (data.userId !== userId || Date.now() - data.timestamp > SUBSCRIPTION_CACHE_TTL) {
      localStorage.removeItem(SUBSCRIPTION_LOCAL_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
};

const setLocalCache = (userId: string, subscription: Subscription | null, isFounder: boolean) => {
  const cache: SubscriptionCache = {
    userId,
    subscription,
    isFounder,
    timestamp: Date.now(),
  };
  localStorage.setItem(SUBSCRIPTION_LOCAL_KEY, JSON.stringify(cache));
};

const clearLocalCache = () => {
  localStorage.removeItem(SUBSCRIPTION_LOCAL_KEY);
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFounder, setIsFounder] = useState(false);
  const latestRequest = useRef<string | null>(null);

  const applyState = useCallback((data: Subscription | null, founder: boolean) => {
    setSubscription(data);
    setIsFounder(founder);
  }, []);

  const fetchFounderStatus = useCallback(async () => {
    try {
      const { is_founder } = await subscriptionsApi.getFounderStatus();
      return is_founder;
    } catch (error) {
      console.error('Error fetching founder status:', error);
      return false;
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    try {
      const data = await subscriptionsApi.getMySubscription();
      return data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }, []);

  const loadSubscription = useCallback(
    async (userId: string, { background = false }: { background?: boolean } = {}) => {
      latestRequest.current = userId;
      if (!background) {
        setLoading(true);
      }

      try {
        const [subscriptionData, founderStatus] = await Promise.all([
          fetchSubscription(),
          fetchFounderStatus(),
        ]);

        if (latestRequest.current !== userId) {
          return;
        }

        applyState(subscriptionData, founderStatus);
        
        // Salva em ambos os caches
        subscriptionCache.set(userId, {
          subscription: subscriptionData,
          isFounder: founderStatus,
          timestamp: Date.now(),
        });
        setLocalCache(userId, subscriptionData, founderStatus);
      } finally {
        if (latestRequest.current === userId && !background) {
          setLoading(false);
        }
      }
    },
    [applyState, fetchFounderStatus, fetchSubscription]
  );

  useEffect(() => {
    if (!user) {
      latestRequest.current = null;
      setSubscription(null);
      setIsFounder(false);
      setLoading(false);
      clearLocalCache();
      return;
    }

    // Tenta cache em memória primeiro
    const memoryCached = subscriptionCache.get(user.id);
    if (memoryCached && Date.now() - memoryCached.timestamp < SUBSCRIPTION_CACHE_TTL) {
      applyState(memoryCached.subscription, memoryCached.isFounder);
      setLoading(false);
      loadSubscription(user.id, { background: true });
      return;
    }

    // Tenta cache local persistente
    const localCached = getLocalCache(user.id);
    if (localCached) {
      applyState(localCached.subscription, localCached.isFounder);
      setLoading(false);
      // Revalida em background
      loadSubscription(user.id, { background: true });
      return;
    }

    // Se não tem cache, carrega normalmente
    loadSubscription(user.id);
  }, [user, applyState, loadSubscription]);

  const hasActiveSubscription = !!subscription;
  const maxGames = subscription?.plan?.max_games || 0;
  const isUnlimited = maxGames >= 999999;
  const hasCatalogAccess = hasActiveSubscription || isFounder;

  return {
    subscription,
    hasActiveSubscription,
    hasCatalogAccess,
    maxGames,
    isUnlimited,
    isFounder,
    loading,
    refetch: () => {
      if (user) {
        loadSubscription(user.id);
      }
    },
  };
};
