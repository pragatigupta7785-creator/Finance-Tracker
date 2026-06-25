import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../services/db';
import { useAuth } from './AuthContext';
import { useCMS } from './CMSContext';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { categories } = useCMS();
  
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
  useEffect(() => {
    if (!currentUser) return;
    const list = [];

    // Check budget boundaries
    budgets.forEach(b => {
      const category = categories.find(c => c.id === b.categoryId);
      if (!category) return;

      const spent = transactions
        .filter(t => t.userId === currentUser.id && t.type === 'expense' && t.categoryId === b.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);

      const ratio = spent / b.limitAmount;
      if (ratio >= 1.0) {
        list.push({
          id: `b-alert-100-${b.id}`,
          type: 'critical',
          title: `Overbudget Alert: ${category.name}`,
          message: `Spent $${spent} exceeding limit of $${b.limitAmount}.`
        });
      } else if (ratio >= 0.9) {
        list.push({
          id: `b-alert-90-${b.id}`,
          type: 'warning',
          title: `Budget Limit Warning (90%): ${category.name}`,
          message: `Spent $${spent} of $${b.limitAmount}.`
        });
      } else if (ratio >= 0.8) {
        list.push({
          id: `b-alert-80-${b.id}`,
          type: 'info',
          title: `Budget warning (80%): ${category.name}`,
          message: `Spent $${spent} of $${b.limitAmount}.`
        });
      }
    });

    // Check overdue loans
    loans.forEach(loan => {
      if (loan.status === 'pending') {
        const isOverdue = new Date(loan.dueDate) < new Date();
        if (isOverdue) {
          list.push({
            id: `loan-overdue-${loan.id}`,
            type: 'critical',
            title: `Overdue Loan Reminder`,
            message: `${loan.type === 'borrow' ? 'Repayment to' : 'Collection from'} ${loan.personName} is overdue.`
          });
        }
      }
    });

    setNotifications(list);
  }, [transactions, budgets, loans, categories, currentUser]);

  // Methods
  const addTransaction = (t) => {
    const entry = { id: `t-${Date.now()}`, userId: currentUser.id, ...t };
    db.saveTransaction(entry);
    setTransactions(db.getTransactions(currentUser.id));
  };

  const removeTransaction = (id) => {
    db.deleteTransaction(id);
    setTransactions(db.getTransactions(currentUser.id));
  };

  const addBudget = (b) => {
    const entry = { id: `b-${Date.now()}`, userId: currentUser.id, ...b };
    db.saveBudget(entry);
    setBudgets(db.getBudgets(currentUser.id));
  };

  const removeBudget = (id) => {
    db.deleteBudget(id);
    setBudgets(db.getBudgets(currentUser.id));
  };

  const addLoan = (l) => {
    const entry = { id: `l-${Date.now()}`, userId: currentUser.id, ...l, status: 'pending' };
    db.saveLoan(entry);
    setLoans(db.getLoans(currentUser.id));
  };

  const settleLoan = (id) => {
    const found = loans.find(l => l.id === id);
    if (found) {
      const updated = { ...found, status: 'paid' };
      db.saveLoan(updated);
      setLoans(db.getLoans(currentUser.id));
      
      // Inject transaction record
      addTransaction({
        type: found.type === 'lend' ? 'income' : 'expense',
        amount: found.amount,
        categoryId: 'cat-10', // Default other
        date: new Date().toISOString().split('T')[0],
        notes: `Settlement of ${found.type} to ${found.personName}`,
        familyMember: 'Self',
        tags: ['Settlement']
      });
    }
  };

  return (
    <FinanceContext.Provider value={{
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
    }}>
      {children}
    </FinanceContext.Provider>
  );
};