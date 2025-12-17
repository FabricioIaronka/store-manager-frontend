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
    const storedToken = localStorage.getItem('store_token');
    const storedUser = localStorage.getItem('store_user');
    const storedStoreId = localStorage.getItem('active_store_id');

    if (storedToken && storedUser) {
      api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      setUser(JSON.parse(storedUser));
    }

    if (storedStoreId) {
      setActiveStoreId(storedStoreId);
    }
    
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, pass: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email); 
    formData.append('password', pass);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token } = response.data;

    localStorage.setItem('store_token', access_token);
    api.defaults.headers.Authorization = `Bearer ${access_token}`;

    try {
      const userResponse = await api.get('/auth/me');
      const userData = userResponse.data;

      localStorage.setItem('store_user', JSON.stringify(userData));
      setUser(userData);

      if (userData.stores && userData.stores.length > 0) {
        const firstStoreId = String(userData.stores[0].id);
        localStorage.setItem('active_store_id', firstStoreId);
        setActiveStoreId(firstStoreId);
      }
      
    } catch (error) {
      console.error("Erro ao buscar detalhes do usuário:", error);
      localStorage.removeItem('store_token');
      delete api.defaults.headers.Authorization;
      throw error;
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('store_token');
    localStorage.removeItem('store_user');
    localStorage.removeItem('active_store_id');
    setUser(null);
    delete api.defaults.headers.Authorization; 
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