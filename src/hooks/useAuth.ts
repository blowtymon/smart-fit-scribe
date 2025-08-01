import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('fitness_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signOut = () => {
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

  return {
    user,
    loading,
    signOut,
    updateUser,
    setUser
  };
}