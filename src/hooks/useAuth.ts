import { useState, useEffect } from 'react';
import { authApi } from '@/services/authApi';

export interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage (for offline fallback)
    const storedUser = localStorage.getItem('fitness_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    await authApi.signout();
    localStorage.removeItem('fitness_user');
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('fitness_user', JSON.stringify(updatedUser));
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await authApi.signin({ email, password });
    
    if (response.success && response.data) {
      setUser(response.data.user);
      localStorage.setItem('fitness_user', JSON.stringify(response.data.user));
      return response;
    }
    
    return response;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const response = await authApi.signup({ email, password, name });
    
    if (response.success && response.data) {
      setUser(response.data.user);
      localStorage.setItem('fitness_user', JSON.stringify(response.data.user));
      return response;
    }
    
    return response;
  };

  return {
    user,
    loading,
    signOut,
    signIn,
    signUp,
    updateUser,
    setUser
  };
}