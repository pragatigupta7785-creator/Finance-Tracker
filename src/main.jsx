import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { CMSProvider } from './context/CMSContext.jsx';
import { FinanceProvider } from './context/FinanceContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CMSProvider>
        <FinanceProvider>
          <App />
        </FinanceProvider>
      </CMSProvider>
    </AuthProvider>
  </React.StrictMode>
);
