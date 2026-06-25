import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('apex_current_user');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
    // Set up mock users if they don't exist
    const profiles = db.getProfiles();
    if (profiles.length === 0) {
      db.saveProfile({ id: '1', email: 'user@finance.com', name: 'Pragati Gupta', role: 'user', currency: 'USD', familyMembers: ['Self', 'Partner', 'Child'] });
      db.saveProfile({ id: '2', email: 'admin@finance.com', name: 'System Admin', role: 'admin', currency: 'USD', familyMembers: ['Self'] });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const profiles = db.getProfiles();
    const found = profiles.find(u => u.email === email);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('apex_current_user', JSON.stringify(found));
      return { success: true, user: found };
    }
    throw new Error("Invalid username or password");
  };

  const signup = async (email, name, role = 'user') => {
    const newProfile = {
      id: `u-${Date.now()}`,
      email,
      name,
      role,
      currency: 'USD',
      familyMembers: ['Self']
    };
    db.saveProfile(newProfile);
    setCurrentUser(newProfile);
    localStorage.setItem('apex_current_user', JSON.stringify(newProfile));
    return { success: true, user: newProfile };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('apex_current_user');
  };

  const updateProfile = (updatedData) => {
    const profile = { ...currentUser, ...updatedData };
    db.saveProfile(profile);
    setCurrentUser(profile);
    localStorage.setItem('apex_current_user', JSON.stringify(profile));
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};