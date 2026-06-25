"import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useCMS } from './context/CMSContext';
import { useFinance } from './context/FinanceContext';

// Simple modular component files mock structure
// (In production, these are imported from separate component/page files)

export default function App() {
  const { currentUser, login, signup, logout, updateProfile } = useAuth();
  const { cmsSettings, updateSettings, categories, addCategory, removeCategory } = useCMS();
  const { transactions, budgets, loans, notifications, stats, addTransaction, removeTransaction, addBudget, removeBudget, addLoan, settleLoan } = useFinance();

  const [currentView, setCurrentView] = useState('landing');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [theme, setTheme] = useState('dark');
  const [scanState, setScanState] = useState('idle');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const activeCurrency = cmsSettings.currencies.find(c => c.code === currencyCode) || { code: 'USD', symbol: '$', rate: 1.0, format: 'en-US' };

  const formatVal = (amountUSD) => {
    return new Intl.NumberFormat(activeCurrency.format, {
      style: 'currency',
      currency: activeCurrency.code
    }).format(amountUSD * activeCurrency.rate);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    login(e.target.email.value, e.target.password.value)
      .then(res => {
        if (res.user.role === 'admin') setCurrentView('admin-cms');
        else setCurrentView('dashboard');
      })
      .catch(err => alert(err.message));
  };

  const runBiometricScan = () => {
    setScanState('scanning');
    setTimeout(() => {
      setScanState('success');
      setTimeout(() => {
        login('user@finance.com', 'user123')
          .then(() => {
            setCurrentView('dashboard');
            setScanState('idle');
          });
      }, 1000);
    }, 2000);
  };

  const toggleTheme = () => {
    setTheme(pre
<truncated 6229 bytes>