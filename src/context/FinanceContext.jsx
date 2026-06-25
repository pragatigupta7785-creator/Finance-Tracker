"import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../services/db';
import { useAuth } from './AuthContext';
import { useCMS } from './CMSContext';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { cmsSettings, categories } = useCMS();
  
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loans, setLoans] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Load user data on login
  useEffect(() => {
    if (currentUser) {
      setTransactions(db.getTransactions(currentUser.id));
      setBudgets(db.getBudgets(currentUser.id));
      setLoans(db.getLoans(currentUser.id));
    } else {
      setTransactions([]);
      setBudgets([]);
      setLoans([]);
    }
  }, [currentUser]);

  // Real-time calculations
  const stats = useMemo(() => {
    if (!currentUser) return { income: 0, expenses: 0, savings: 0, borrow: 0, lend: 0, savingsPercent: 0 };
    
    const userT = transactions.filter(t => t.userId === currentUser.id);
    const income = userT.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = userT.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expenses;
    const savingsPercent = income > 0 ? (savings / income) * 100 : 0;
    
    const userL = loans.filter(l => l.userId === currentUser.id && l.status !== 'paid');
    const borrow = userL.filter(l => l.type === 'borrow').reduce((sum, l) => sum + l.amount, 0);
    const lend = userL.filter(l => l.type === 'lend').reduce((sum, l) => sum + l.amount, 0);

    return { income, expenses, savings, borrow, lend, savingsPercent };
  }, [transactions, loans, currentUser]);

  // Check budgets & generate notifications
  useEffect(() =>
<truncated 3676 bytes>