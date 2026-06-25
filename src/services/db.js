"// Local Database Service using LocalStorage
// Provides zero-setup CRUD operations and can easily be replaced by direct Supabase calls.

const getStorageItem = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initial data states
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
  
<truncated 2764 bytes>