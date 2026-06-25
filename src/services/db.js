const getStorageItem = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Grocery', icon: 'shopping-bag', color: '#10b981' },
  { id: 'cat-2', name: 'Bills', icon: 'credit-card', color: '#3b82f6' },
  { id: 'cat-3', name: 'Personal', icon: 'user', color: '#8b5cf6' },
  { id: 'cat-4', name: 'Travel', icon: 'map-pin', color: '#f59e0b' },
  { id: 'cat-5', name: 'Shopping', icon: 'tag', color: '#ec4899' },
  { id: 'cat-6', name: 'Medical', icon: 'activity', color: '#ef4444' },
  { id: 'cat-7', name: 'Education', icon: 'book-open', color: '#6366f1' },
  { id: 'cat-8', name: 'Entertainment', icon: 'film', color: '#a855f7' },
  { id: 'cat-9', name: 'Investments', icon: 'trending-up', color: '#06b6d4' },
  { id: 'cat-10', name: 'Other', icon: 'help-circle', color: '#71717a' }
];

export const db = {
  // Profiles
  getProfiles: () => getStorageItem('apex_users', []),
  saveProfile: (profile) => {
    const profiles = db.getProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx > -1) {
      profiles[idx] = { ...profiles[idx], ...profile };
    } else {
      profiles.push(profile);
    }
    setStorageItem('apex_users', profiles);
  },

  // Transactions
  getTransactions: (userId) => {
    const all = getStorageItem('apex_transactions', []);
    return userId ? all.filter(t => t.userId === userId) : all;
  },
  saveTransaction: (transaction) => {
    const all = getStorageItem('apex_transactions', []);
    const idx = all.findIndex(t => t.id === transaction.id);
    if (idx > -1) {
      all[idx] = transaction;
    } else {
      all.unshift(transaction);
    }
    setStorageItem('apex_transactions', all);
  },
  deleteTransaction: (id) => {
    const all = getStorageItem('apex_transactions', []);
    const filtered = all.filter(t => t.id !== id);
    setStorageItem('apex_transactions', filtered);
  },

  // Categories
  getCategories: () => getStorageItem('apex_categories', DEFAULT_CATEGORIES),
  saveCategory: (category) => {
    const all = db.getCategories();
    const idx = all.findIndex(c => c.id === category.id);
    if (idx > -1) {
      all[idx] = category;
    } else {
      all.push(category);
    }
    setStorageItem('apex_categories', all);
  },
  deleteCategory: (id) => {
    const all = db.getCategories();
    const filtered = all.filter(c => c.id !== id);
    setStorageItem('apex_categories', filtered);
  },

  // Budgets
  getBudgets: (userId) => {
    const all = getStorageItem('apex_budgets', []);
    return userId ? all.filter(b => b.userId === userId) : all;
  },
  saveBudget: (budget) => {
    const all = getStorageItem('apex_budgets', []);
    const idx = all.findIndex(b => b.userId === budget.userId && b.categoryId === budget.categoryId);
    if (idx > -1) {
      all[idx] = { ...all[idx], ...budget };
    } else {
      all.push(budget);
    }
    setStorageItem('apex_budgets', all);
  },
  deleteBudget: (id) => {
    const all = getStorageItem('apex_budgets', []);
    const filtered = all.filter(b => b.id !== id);
    setStorageItem('apex_budgets', filtered);
  },

  // Loans (Borrow & Lend)
  getLoans: (userId) => {
    const all = getStorageItem('apex_loans', []);
    return userId ? all.filter(l => l.userId === userId) : all;
  },
  saveLoan: (loan) => {
    const all = getStorageItem('apex_loans', []);
    const idx = all.findIndex(l => l.id === loan.id);
    if (idx > -1) {
      all[idx] = loan;
    } else {
      all.unshift(loan);
    }
    setStorageItem('apex_loans', all);
  },

  // CMS Settings
  getCmsSettings: () => getStorageItem('apex_cms_settings', {
    enableBiometrics: true,
    enableBorrowLend: true,
    enableRecurring: true,
    enableExport: true,
    dashboardBannerText: '🎉 Welcome to ApexFinance Admin Controlled Portal. Manage your parameters on the CMS panel!',
    showDashboardBanner: true,
    currencies: [
      { code: 'USD', symbol: '$', rate: 1.0, format: 'en-US' },
      { code: 'EUR', symbol: '€', rate: 0.92, format: 'de-DE' },
      { code: 'GBP', symbol: '£', rate: 0.79, format: 'en-GB' },
      { code: 'INR', symbol: '₹', rate: 83.5, format: 'en-IN' },
      { code: 'JPY', symbol: '¥', rate: 155.2, format: 'ja-JP' }
    ]
  }),
  saveCmsSettings: (settings) => {
    setStorageItem('apex_cms_settings', settings);
  }
};