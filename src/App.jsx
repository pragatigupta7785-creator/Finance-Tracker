import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useCMS } from './context/CMSContext';
import { useFinance } from './context/FinanceContext';

export default function App() {
  const { currentUser, login, logout } = useAuth();
  const { cmsSettings, categories } = useCMS();
  const { notifications, stats, transactions, budgets, loans, addTransaction, settleLoan, removeTransaction } = useFinance();

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
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} flex flex-col font-sans transition-colors duration-300`}>
      {cmsSettings.showDashboardBanner && currentUser && (
        <div className="bg-brand-600 text-white text-xs py-2 px-4 text-center font-semibold">
          {cmsSettings.dashboardBannerText}
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold font-display">ApexFinance</span>
        </div>

        {currentUser && (
          <nav className="hidden md:flex gap-1 text-sm font-semibold text-zinc-500">
            {currentUser.role === 'admin' ? (
              <button onClick={() => setCurrentView('admin-cms')} className="px-3 py-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800">CMS Control</button>
            ) : (
              <>
                <button onClick={() => setCurrentView('dashboard')} className="px-3 py-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800">Dashboard</button>
                <button onClick={() => setCurrentView('ledger')} className="px-3 py-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800">Ledger</button>
                <button onClick={() => setCurrentView('budgets')} className="px-3 py-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800">Budgets</button>
                {cmsSettings.enableBorrowLend && (
                  <button onClick={() => setCurrentView('loans')} className="px-3 py-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800">Borrow/Lend</button>
                )}
              </>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {currentUser && (
            <button onClick={() => logout()} className="text-xs font-semibold hover:text-red-500 transition">Logout</button>
          )}
        </div>
      </header>

      {/* VIEW RENDERER */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        
        {/* Landing Page */}
        {currentView === 'landing' && (
          <div className="text-center py-20">
            <h1 className="text-5xl font-display font-extrabold mb-6">ApexFinance Dashboard</h1>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto">Track incomes, categories, borrow/lend records, and trigger instant budget alert reminders.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setCurrentView('login')} className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold">Launch App</button>
            </div>
          </div>
        )}

        {/* Login Page */}
        {currentView === 'login' && (
          <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input name="email" defaultValue="user@finance.com" placeholder="Email" className="w-full p-2.5 rounded border border-zinc-700 bg-transparent text-sm" />
              <input name="password" type="password" defaultValue="user123" placeholder="Password" className="w-full p-2.5 rounded border border-zinc-700 bg-transparent text-sm" />
              <button type="submit" className="w-full py-2.5 bg-brand-600 text-white rounded font-bold">Sign In</button>
            </form>
            {cmsSettings.enableBiometrics && (
              <button onClick={() => setCurrentView('biometrics')} className="mt-4 w-full py-2 bg-zinc-850 text-white rounded">Simulate FaceID</button>
            )}
          </div>
        )}

        {/* Biometrics */}
        {currentView === 'biometrics' && (
          <div className="max-w-md mx-auto text-center py-10">
            <h3 className="text-xl font-bold mb-6">Biometric authentication</h3>
            <div className="w-32 h-32 border border-zinc-700 rounded-2xl mx-auto flex items-center justify-center mb-6">
              {scanState === 'scanning' ? 'Scanning...' : scanState === 'success' ? 'Verified!' : 'Scan'}
            </div>
            <button onClick={runBiometricScan} className="px-4 py-2 bg-brand-600 text-white rounded">Scan Face</button>
          </div>
        )}

        {/* Main Dashboard */}
        {currentView === 'dashboard' && currentUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/50">
                <span className="text-xs text-zinc-500">Total Income</span>
                <p className="text-2xl font-bold text-emerald-500">{formatVal(stats.income)}</p>
              </div>
              <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/50">
                <span className="text-xs text-zinc-500">Expenses</span>
                <p className="text-2xl font-bold text-rose-500">{formatVal(stats.expenses)}</p>
              </div>
              <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/50">
                <span className="text-xs text-zinc-500">Savings</span>
                <p className="text-2xl font-bold text-brand-500">{formatVal(stats.savings)}</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}