import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useCMS } from './context/CMSContext';
import { useFinance } from './context/FinanceContext';

export default function App() {
  const { currentUser, login, logout } = useAuth();
  const { cmsSettings, setCmsSettings, categories, addCategory, removeCategory } = useCMS();
  const { 
    transactions, 
    budgets, 
    loans, 
    notifications, 
    stats, 
    addTransaction, 
    removeTransaction, 
    addBudget, 
    removeBudget, 
    addLoan, 
    settleLoan 
  } = useFinance();

  const [currentView, setCurrentView] = useState('landing');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [theme, setTheme] = useState('dark');
  const [scanState, setScanState] = useState('idle');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Modals
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Dynamic currency logic
  const activeCurrency = useMemo(() => {
    return cmsSettings.currencies.find(c => c.code === currencyCode) || { code: 'USD', symbol: '$', rate: 1.0, format: 'en-US' };
  }, [currencyCode, cmsSettings]);

  const formatVal = (amountUSD) => {
    return new Intl.NumberFormat(activeCurrency.format, {
      style: 'currency',
      currency: activeCurrency.code
    }).format(amountUSD * activeCurrency.rate);
  };

  useEffect(() => {
    if (currentUser) {
      setCurrencyCode(currentUser.currency || 'USD');
    }
  }, [currentUser]);

  // Form Submissions
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

  const handlePostTransaction = (e) => {
    e.preventDefault();
    const type = e.target.type.value;
    const amount = parseFloat(e.target.amount.value);
    const categoryId = e.target.categoryId.value;
    const date = e.target.date.value;
    const notes = e.target.notes.value;
    const familyMember = e.target.familyMember.value;
    const isRecurring = e.target.isRecurring?.checked || false;
    const frequency = isRecurring ? e.target.frequency.value : 'none';
    const tags = e.target.tags.value.split(',').map(t => t.trim()).filter(t => t.length > 0);

    addTransaction({
      type,
      amount,
      categoryId,
      date,
      notes,
      familyMember,
      isRecurring,
      frequency,
      tags
    });
    setShowAddTransactionModal(false);
  };

  const handlePostBudget = (e) => {
    e.preventDefault();
    const categoryId = e.target.categoryId.value;
    const limitAmount = parseFloat(e.target.limitAmount.value);

    addBudget({
      categoryId,
      limitAmount
    });
    setShowAddBudgetModal(false);
  };

  const handlePostLoan = (e) => {
    e.preventDefault();
    const type = e.target.type.value;
    const personName = e.target.personName.value;
    const amount = parseFloat(e.target.amount.value);
    const dueDate = e.target.dueDate.value;
    const notes = e.target.notes.value;

    addLoan({
      type,
      personName,
      amount,
      dueDate,
      notes
    });
    setShowAddLoanModal(false);
  };

  const exportToExcel = () => {
    if (!currentUser) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Type,Amount (USD),Category,Date,Family Member,Notes,Tags,Recurring\n";
    
    transactions.forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || 'Other';
      const tagStr = t.tags ? t.tags.join(';') : '';
      csvContent += `"${t.id}","${t.type}",${t.amount},"${cat}","${t.date}","${t.familyMember}","${t.notes}","${tagStr}","${t.isRecurring ? t.frequency : 'no'}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `apexfinance_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVGs for Lucide Icons
  const renderIcon = (name, className = "w-5 h-5") => {
    const svgMap = {
      'shopping-bag': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
      'credit-card': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
      'user': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      'map-pin': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      'tag': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h.01m0-14H18a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>,
      'activity': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      'book-open': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      'film': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>,
      'trending-up': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      'help-circle': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      'plus': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
      'trash': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
      'edit': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
    };
    return svgMap[name] || svgMap['help-circle'];
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} flex flex-col font-sans transition-colors duration-300 pb-20 md:pb-0`}>
      
      {cmsSettings.showDashboardBanner && currentUser && (
        <div className="bg-brand-600 text-white text-xs py-2 px-4 flex items-center justify-between gap-2 shadow-sm font-semibold tracking-wide">
          <span className="mx-auto flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            {cmsSettings.dashboardBannerText}
          </span>
        </div>
      )}

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-35 flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 bg-white/70 dark:bg-zinc-955/70 dark:border-zinc-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white font-bold text-lg font-display shadow-lg shadow-brand-500/20">A</div>
          <span className="font-display font-bold text-lg tracking-tight hidden md:inline-block">Apex<span className="text-brand-500">Finance</span></span>
          {currentUser?.role === 'admin' && <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 ml-2">CMS Admin</span>}
        </div>

        {currentUser && (
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {currentUser.role === 'admin' ? (
              <button onClick={() => setCurrentView('admin-cms')} className={`px-4 py-2 rounded-lg transition ${currentView === 'admin-cms' ? 'bg-zinc-200 dark:bg-zinc-800 text-brand-600 dark:text-brand-500' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>CMS Dashboard</button>
            ) : (
              <>
                <button onClick={() => setCurrentView('dashboard')} className={`px-4 py-2 rounded-lg transition ${currentView === 'dashboard' ? 'bg-zinc-200 dark:bg-zinc-800 text-brand-600 dark:text-brand-500 font-semibold' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>Dashboard</button>
                <button onClick={() => setCurrentView('expenses')} className={`px-4 py-2 rounded-lg transition ${currentView === 'expenses' ? 'bg-zinc-200 dark:bg-zinc-800 text-brand-600 dark:text-brand-500 font-semibold' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>Transactions</button>
                <button onClick={() => setCurrentView('budgets')} className={`px-4 py-2 rounded-lg transition ${currentView === 'budgets' ? 'bg-zinc-200 dark:bg-zinc-800 text-brand-600 dark:text-brand-500 font-semibold' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>Budgets</button>
                {cmsSettings.enableBorrowLend && (
                  <button onClick={() => setCurrentView('borrow-lend')} className={`px-4 py-2 rounded-lg transition ${currentView === 'borrow-lend' ? 'bg-zinc-200 dark:bg-zinc-800 text-brand-600 dark:text-brand-500 font-semibold' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>Lend & Borrow</button>
                )}
              </>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {currentUser && (
            <select 
              value={currencyCode} 
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-805 text-xs font-semibold px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none"
            >
              {cmsSettings.currencies.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
            </select>
          )}

          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {currentUser && (
            <button onClick={() => logout()} className="text-xs font-semibold hover:text-red-500 transition">Logout</button>
          )}
        </div>
      </header>

      {/* VIEW RENDER PANEL */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
        
        {/* LANDING PAGE */}
        {currentView === 'landing' && (
          <div className="flex flex-col items-center py-12 md:py-20 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold tracking-wide border border-brand-500/20 mb-6 uppercase">
              ✨ Smarter Personal Finance Management
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl leading-tight">
              Take Control of Your Money. <br />
              <span className="bg-gradient-to-r from-brand-500 via-emerald-400 to-teal-400 bg-clip-text text-transparent">No Code, Zero Hassle.</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-base md:text-lg max-w-xl mb-8 leading-relaxed">
              Real-time budget limit alerts, seamless multi-currency support, visual categories tracking, family sharing logs, and a powerful dashboard control panel.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
              <button onClick={() => setCurrentView('login')} className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition">
                Get Started Instantly
              </button>
            </div>
          </div>
        )}

        {/* LOGIN */}
        {currentView === 'login' && (
          <div className="max-w-md mx-auto py-10 md:py-16">
            <div className="glassmorphism p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold">Welcome back</h2>
                <p className="text-xs text-zinc-500 mt-2">Log in using demo credentials or scan biometrics</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
                  <input required type="email" name="email" defaultValue="user@finance.com" className="w-full px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-sm focus:border-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Password</label>
                  <input required type="password" name="password" defaultValue="user123" className="w-full px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-sm focus:border-brand-500 outline-none" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-lg transition">
                  Sign In to Account
                </button>
              </form>

              {cmsSettings.enableBiometrics && (
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-xs text-zinc-500 mb-4">Or use Face ID / Touch ID Biometric log in</p>
                  <button onClick={() => setCurrentView('biometric')} className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700 inline-flex items-center justify-center hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-500/10 text-brand-500 transition">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11a13.92 13.92 0 00-2.08-7.53l-.048-.088m6.095 8.01a8.914 8.914 0 013.38 5.585M13.95 3.05a9.004 9.004 0 013.49 14.505M8.823 4.542A11.979 11.979 0 0112 3c1.265 0 2.477.195 3.617.556" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BIOMETRICS SCANNER */}
        {currentView === 'biometric' && (
          <div className="max-w-md mx-auto py-10 md:py-16 text-center animate-fade-in">
            <div className="glassmorphism p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
              <h3 className="font-display text-xl font-bold mb-2">Simulating Biometric ID</h3>
              <p className="text-xs text-zinc-500 mb-8">Scan your facial signature to authenticate.</p>
              
              <div className="relative w-44 h-44 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden mb-8">
                {scanState === 'idle' && (
                  <svg className="w-24 h-24 text-zinc-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11a13.92 13.92 0 00-2.08-7.53l-.048-.088m6.095 8.01a8.914 8.914 0 013.38 5.585M13.95 3.05a9.004 9.004 0 013.49 14.505" />
                  </svg>
                )}
                
                {scanState === 'scanning' && (
                  <>
                    <div className="absolute left-0 right-0 h-0.5 bg-brand-500 animate-scan"></div>
                    <span className="text-xs text-brand-500 font-semibold">Scanning Face...</span>
                  </>
                )}

                {scanState === 'success' && (
                  <div className="text-brand-500 flex flex-col items-center">
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>
                    <span className="text-xs font-semibold mt-2">Verified</span>
                  </div>
                )}
              </div>

              {scanState === 'idle' && (
                <button onClick={runBiometricScan} className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-lg transition">Start Scan</button>
              )}
            </div>
          </div>
        )}

        {/* USER DASHBOARD */}
        {currentView === 'dashboard' && currentUser && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-600 text-white shadow-xl glow-brand">
              <div>
                <h2 className="font-display text-2xl font-bold">Hello, {currentUser.name}!</h2>
                <p className="text-xs opacity-90 mt-1">Here is a quick look at your financial health.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddTransactionModal(true)} className="px-4 py-2 bg-white text-brand-700 font-semibold text-xs rounded-xl shadow hover:bg-zinc-100 transition flex items-center gap-1">Add Entry</button>
                {cmsSettings.enableExport && (
                  <button onClick={exportToExcel} className="px-4 py-2 bg-brand-700 text-white border border-brand-500/30 font-semibold text-xs rounded-xl hover:bg-brand-800 transition">Export</button>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glassmorphism p-5 rounded-2xl border">
                <span className="text-zinc-500 text-xs font-medium uppercase">Total Income</span>
                <h3 className="text-xl md:text-2xl font-bold text-emerald-500 mt-1">{formatVal(stats.income)}</h3>
              </div>
              <div className="glassmorphism p-5 rounded-2xl border">
                <span className="text-zinc-500 text-xs font-medium uppercase">Total Expenses</span>
                <h3 className="text-xl md:text-2xl font-bold text-rose-500 mt-1">{formatVal(stats.expenses)}</h3>
              </div>
              <div className="glassmorphism p-5 rounded-2xl border">
                <span className="text-zinc-500 text-xs font-medium uppercase">Savings Balance</span>
                <h3 className="text-xl md:text-2xl font-bold text-brand-500 mt-1">{formatVal(stats.savings)}</h3>
              </div>
              <div className="glassmorphism p-5 rounded-2xl border">
                <span className="text-zinc-500 text-xs font-medium uppercase">Lent Outstanding</span>
                <h3 className="text-xl md:text-2xl font-bold text-blue-500 mt-1">{formatVal(stats.lend)}</h3>
              </div>
            </div>

            {/* List and Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glassmorphism p-5 rounded-2xl border lg:col-span-2 space-y-4">
                <h4 className="font-semibold text-sm">Recent Ledger Entries</h4>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {transactions.slice(0, 4).map(t => (
                    <div key={t.id} className="py-3 flex justify-between text-xs">
                      <div>
                        <p className="font-semibold">{t.notes || 'Transaction'}</p>
                        <p className="text-[10px] text-zinc-500">{t.date}</p>
                      </div>
                      <span className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatVal(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glassmorphism p-5 rounded-2xl border space-y-4">
                <h4 className="font-semibold text-sm">Actionable alerts</h4>
                <div className="space-y-3">
                  {notifications.map((n, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs">
                      <h5 className="font-bold text-rose-400">{n.title}</h5>
                      <p className="text-[10px] text-zinc-400 mt-1">{n.message}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-xs text-zinc-500 py-6 text-center">No alerts!</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPENSES / TRANSACTIONS LEDGER */}
        {currentView === 'expenses' && currentUser && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Ledger Statement</h2>
              <button onClick={() => setShowAddTransactionModal(true)} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">New Entry</button>
            </div>
            
            <div className="glassmorphism rounded-2xl border overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-500">
                    <th className="p-4">Type</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-zinc-900/20">
                      <td className="p-4 font-semibold capitalize">{t.type}</td>
                      <td className="p-4 text-zinc-400">{t.date}</td>
                      <td className="p-4 font-medium">{t.notes}</td>
                      <td className={`p-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>{formatVal(t.amount)}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => removeTransaction(t.id)} className="text-rose-500 hover:text-rose-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BUDGETS MANAGER */}
        {currentView === 'budgets' && currentUser && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Category Budgets</h2>
              <button onClick={() => setShowAddBudgetModal(true)} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">Set Budget</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map(b => {
                const cat = categories.find(c => c.id === b.categoryId) || { name: 'Other' };
                const spent = transactions
                  .filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
                  .reduce((sum, t) => sum + t.amount, 0);
                const percent = Math.min((spent / b.limitAmount) * 100, 100);

                return (
                  <div key={b.id} className="glassmorphism p-5 rounded-2xl border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm">{cat.name} Limit</span>
                      <span className="text-xs font-semibold text-brand-500">{percent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-brand-500" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Spent: {formatVal(spent)}</span>
                      <span>Limit: {formatVal(b.limitAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BORROW & LEND LEDGER */}
        {currentView === 'borrow-lend' && currentUser && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Lend & Borrow Ledger</h2>
              <button onClick={() => setShowAddLoanModal(true)} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">Record Loan</button>
            </div>

            <div className="glassmorphism rounded-2xl border overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-500">
                    <th className="p-4">Person</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loans.map(l => (
                    <tr key={l.id} className="hover:bg-zinc-900/20">
                      <td className="p-4 font-semibold">{l.personName}</td>
                      <td className="p-4 font-medium capitalize">{l.type}</td>
                      <td className="p-4 font-bold">{formatVal(l.amount)}</td>
                      <td className="p-4 text-zinc-400">{l.dueDate}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${l.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {l.status === 'pending' && (
                          <button onClick={() => settleLoan(l.id)} className="px-2 py-1 bg-brand-500/10 text-brand-500 rounded font-semibold text-[10px]">Settle</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ADD TRANSACTION MODAL */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-xs">
            <h3 className="text-sm font-bold border-b border-zinc-800 pb-3 mb-4">Post Transaction</h3>
            <form onSubmit={handlePostTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Type</label>
                  <select name="type" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5 outline-none">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Amount</label>
                  <input required type="number" name="amount" step="0.01" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5 outline-none font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select name="categoryId" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5 outline-none">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Date</label>
                  <input required type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Family Sync</label>
                  <select name="familyMember" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5 outline-none">
                    {currentUser.familyMembers?.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Tags (Comma-separated)</label>
                  <input name="tags" placeholder="e.g. Travel, Dinner" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Notes</label>
                <textarea name="notes" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5 outline-none" rows="2"></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddTransactionModal(false)} className="px-4 py-2 bg-zinc-800 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD BUDGET MODAL */}
      {showAddBudgetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-xs">
            <h3 className="text-sm font-bold border-b border-zinc-800 pb-3 mb-4">Set Budget Limit</h3>
            <form onSubmit={handlePostBudget} className="space-y-4">
              <div>
                <label className="block text-zinc-400 mb-1">Category</label>
                <select name="categoryId" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Limit Amount (USD)</label>
                <input required type="number" name="limitAmount" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5 font-bold" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddBudgetModal(false)} className="px-4 py-2 bg-zinc-800 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD LOAN MODAL */}
      {showAddLoanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-xs">
            <h3 className="text-sm font-bold border-b border-zinc-800 pb-3 mb-4">Record Loan</h3>
            <form onSubmit={handlePostLoan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Loan Type</label>
                  <select name="type" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5">
                    <option value="lend">Lend</option>
                    <option value="borrow">Borrow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Amount</label>
                  <input required type="number" name="amount" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5 font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Person Name</label>
                <input required name="personName" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5" />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Due Date</label>
                <input required type="date" name="dueDate" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5" />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Notes</label>
                <textarea name="notes" className="w-full bg-zinc-850 border border-zinc-700 rounded p-2.5" rows="2"></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddLoanModal(false)} className="px-4 py-2 bg-zinc-800 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      {currentUser && currentUser.role !== 'admin' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-35 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800/80 py-2 px-4 flex justify-around text-xs font-medium backdrop-blur-md">
          <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center gap-1 ${currentView === 'dashboard' ? 'text-brand-500' : 'text-zinc-450'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>
            <span>Dashboard</span>
          </button>
          <button onClick={() => setCurrentView('expenses')} className={`flex flex-col items-center gap-1 ${currentView === 'expenses' ? 'text-brand-500' : 'text-zinc-450'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2" /></svg>
            <span>Ledger</span>
          </button>
          <button onClick={() => setCurrentView('budgets')} className={`flex flex-col items-center gap-1 ${currentView === 'budgets' ? 'text-brand-500' : 'text-zinc-450'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11" /></svg>
            <span>Budgets</span>
          </button>
        </div>
      )}
      
    </div>
  );
}