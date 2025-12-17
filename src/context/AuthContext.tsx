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
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const signIn = useCallback(async (email: string, pass: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email); 
    formData.append('password', pass);

    await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const userResponse = await api.get('/auth/me');
    const userData = userResponse.data;

    setUser(userData);
    
    if (userData.stores && userData.stores.length > 0) {
        const firstStoreId = String(userData.stores[0].id);
        localStorage.setItem('active_store_id', firstStoreId);
        setActiveStoreId(firstStoreId);
    }
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, activeStoreId, signIn, signOut, selectStore, loading }}>
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