import { useState, useEffect } from 'react';
import { apiClient, authApi, User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Cache local para evitar requisições desnecessárias
const USER_CACHE_KEY = 'gamingflix_user_cache';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutos

interface UserCache {
  user: User;
  isAdmin: boolean;
  timestamp: number;
}

const getCachedUser = (): UserCache | null => {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (!cached) return null;
    
    const data: UserCache = JSON.parse(cached);
    if (Date.now() - data.timestamp > CACHE_TTL) {
      localStorage.removeItem(USER_CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
};

const setCachedUser = (user: User, isAdmin: boolean) => {
  const cache: UserCache = {
    user,
    isAdmin,
    timestamp: Date.now(),
  };
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cache));
};

const clearCachedUser = () => {
  localStorage.removeItem(USER_CACHE_KEY);
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const token = apiClient.getToken();
      if (!token) {
        setLoading(false);
        clearCachedUser();
        return;
      }

      // Tenta carregar do cache primeiro
      const cached = getCachedUser();
      if (cached) {
        setUser(cached.user);
        setIsAdmin(cached.isAdmin);
        setLoading(false);
        
        // Revalida em background
        authApi.getMe()
          .then(({ user: userData }) => {
            setUser(userData);
            authApi.checkRole().then(({ isAdmin: adminStatus }) => {
              setIsAdmin(adminStatus);
              setCachedUser(userData, adminStatus);
            });
          })
          .catch(() => {
            clearCachedUser();
            apiClient.setToken(null);
            setUser(null);
            setIsAdmin(false);
          });
        return;
      }

      // Se não tem cache, carrega normalmente
      try {
        const { user: userData } = await authApi.getMe();
        setUser(userData);
        const { isAdmin: adminStatus } = await authApi.checkRole();
        setIsAdmin(adminStatus);
        setCachedUser(userData, adminStatus);
      } catch (error) {
        console.error('Error loading user:', error);
        apiClient.setToken(null);
        setUser(null);
        setIsAdmin(false);
        clearCachedUser();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user: userData, token } = await authApi.signIn(email, password);
      apiClient.setToken(token);
      setUser(userData);
      
      const { isAdmin: adminStatus } = await authApi.checkRole();
      setIsAdmin(adminStatus);
      
      // Salva no cache
      setCachedUser(userData, adminStatus);

      toast({
        title: 'Login realizado!',
        description: 'Bem-vindo ao GamingFlix',
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, whatsapp: string, username: string) => {
    try {
      const { user: userData, token } = await authApi.signUp(email, password, fullName, whatsapp, username);
      apiClient.setToken(token);
      setUser(userData);
      
      // Salva no cache
      setCachedUser(userData, false);

      toast({
        title: 'Cadastro realizado!',
        description: 'Bem-vindo ao GamingFlix',
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      apiClient.setToken(null);
      setUser(null);
      setIsAdmin(false);
      
      // Limpa o cache
      clearCachedUser();

      toast({
        title: 'Logout realizado',
        description: 'Até logo!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao sair',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    user,
    session: user ? { user } : null,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
  };
};
