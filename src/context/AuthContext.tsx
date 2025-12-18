import { createContext, useCallback, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  stores?: any[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  activeStoreId: string | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => void;
  selectStore: (storeId: string) => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data);
    return data;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedStoreId = localStorage.getItem('active_store_id');
        if (storedStoreId) setActiveStoreId(storedStoreId);

        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

   const refreshUser = useCallback(async () => {
    try {
      const userData = await fetchUser();
      
      // Se tiver lojas e nenhuma selecionada, seleciona a primeira
      if (userData.stores && userData.stores.length > 0 && !localStorage.getItem('active_store_id')) {
         const firstStoreId = String(userData.stores[0].id);
         localStorage.setItem('active_store_id', firstStoreId);
         setActiveStoreId(firstStoreId);
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário", error);
    }
  }, []);

  const signIn = useCallback(async (email: string, pass: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email); 
    formData.append('password', pass);

    await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const userData = await fetchUser();
    
    if (userData.stores && userData.stores.length > 0) {
        const firstStoreId = String(userData.stores[0].id);
        localStorage.setItem('active_store_id', firstStoreId);
        setActiveStoreId(firstStoreId);
    }

    return userData;
  }, []);

  const signOut = useCallback(async () => {
    try {
        await api.post('/auth/logout'); 
    } catch (error) {
        console.error("Erro ao fazer logout no servidor", error);
    } finally {
        localStorage.removeItem('active_store_id');
        setUser(null);
        setActiveStoreId(null);
    }
  }, []);

  const selectStore = useCallback((storeId: string) => {
    if (storeId) {
        localStorage.setItem('active_store_id', storeId);
        setActiveStoreId(storeId);
    } else {
        localStorage.removeItem('active_store_id');
        setActiveStoreId(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, activeStoreId, signIn, signOut, selectStore, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}