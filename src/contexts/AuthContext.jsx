import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAll } from '../services/db';
import { seedFirestore } from '../utils/seedData';

const AuthContext = createContext(null);

// Role → tab mapping for login
const ROLE_TAB = {
  Admin: 'admin', Partner: 'admin', Manager: 'admin',
  Closer: 'purchase', Executive: 'purchase',
  Sales: 'sales',
};

// Role access config
export const ROLE_ACCESS = {
  Admin: 'admin',
  Partner: 'admin',
  Manager: 'purchase',
  Closer: 'purchase',
  Executive: 'purchase',
  Sales: 'sales',
  Valuator: 'purchase',
  Workshop: 'purchase',
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const saved = localStorage.getItem('cc_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {}
    }
    setAuthLoading(false);
  }, []);

  const login = async (loginId, password, branch) => {
    try {
      const users = await getAll('users');
      
      // If we don't have enough users (or only the test user I created), trigger the seed
      if (users.length < 5) {
        // First run - seed the database
        const seedResult = await seedFirestore();
        if (!seedResult.success) {
          if (seedResult.error?.includes('Missing or insufficient permissions') || seedResult.error?.includes('permission_denied')) {
             return { success: false, error: 'Firebase Security Rules are blocking access. Please update your Firestore Rules to allow read/write.' };
          }
          return { success: false, error: 'Failed to seed database: ' + seedResult.error };
        }
        
        // Retry fetching users
        const seeded = await getAll('users');
        if (seeded.length === 0) {
          return { success: false, error: 'Seeded but no users found. Check Firebase.' };
        }
        return loginFromList(seeded, loginId, password, branch);
      }
      return loginFromList(users, loginId, password, branch);
    } catch (e) {
      console.error('Login error:', e);
      return { success: false, error: e.message || 'Connection error. Please try again.' };
    }
  };

  const loginFromList = (users, loginId, password, branch) => {
    const user = users.find(
      u => u.lid === loginId.trim() && u.pw === password && u.status === 'Active'
    );
    if (!user) {
      return { success: false, error: 'Invalid Login ID or Password.' };
    }
    const cu = {
      id: user.id,
      name: user.name,
      lid: user.lid,
      role: user.role,
      branch: branch || user.branch,
    };
    setCurrentUser(cu);
    localStorage.setItem('cc_user', JSON.stringify(cu));
    return { success: true, user: cu };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cc_user');
  };

  const value = { currentUser, authLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
