import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';

const CMSContext = createContext();

export const useCMS = () => useContext(CMSContext);

export const CMSProvider = ({ children }) => {
  const [cmsSettings, setCmsSettings] = useState(() => db.getCmsSettings());
  const [categories, setCategories] = useState(() => db.getCategories());

  const updateSettings = (newSettings) => {
    const updated = { ...cmsSettings, ...newSettings };
    setCmsSettings(updated);
    db.saveCmsSettings(updated);
  };

  const addCategory = (category) => {
    const newCat = { id: `cat-${Date.now()}`, ...category };
    db.saveCategory(newCat);
    setCategories(db.getCategories());
  };

  const removeCategory = (id) => {
    db.deleteCategory(id);
    setCategories(db.getCategories());
  };

  return (
    <CMSContext.Provider value={{ cmsSettings, updateSettings, categories, addCategory, removeCategory }}>
      {children}
    </CMSContext.Provider>
  );
};
