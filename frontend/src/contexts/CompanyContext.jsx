import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(() => {
    const saved = localStorage.getItem('active_company');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const loginCompany = (companyData) => {
    setCompany(companyData);
    localStorage.setItem('active_company', JSON.stringify(companyData));
  };

  const logoutCompany = () => {
    setCompany(null);
    localStorage.removeItem('active_company');
    localStorage.removeItem('pos_active_user'); // also logout PIN user
  };

  const updateCompanyConfig = async (configData, taxRateArgs) => {
    if (!company) return;
    try {
      const payload = typeof configData === 'object' ? configData : { currency: configData, tax_rate: taxRateArgs };
      const res = await fetch(`${API_BASE_URL}/api/companies/${company.id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.company) {
        loginCompany(data.company);
        return data.company;
      }
    } catch (err) {
      console.error('Error updating company config:', err);
    }
  };

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let [resource, config] = args;
      if (typeof resource === 'string' && resource.includes('/api')) {
        config = config || {};
        const activeCompany = JSON.parse(localStorage.getItem('active_company') || 'null');
        config.headers = {
          ...config.headers,
          'x-company-id': activeCompany?.id ? activeCompany.id.toString() : '1'
        };
      }
      return originalFetch(resource, config);
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [company]);

  // Helper function to make API requests with x-company-id header
  const companyFetch = (url, options = {}) => {
    const headers = {
      ...options.headers,
      'x-company-id': company?.id ? company.id.toString() : '1'
    };
    return fetch(url, { ...options, headers });
  };

  const isMasterAdmin = company?.id === 0 || company?.plan === 'master' || company?.email === 'oleander.gf@gmail.com';

  return (
    <CompanyContext.Provider value={{
      company,
      isMasterAdmin,
      loginCompany,
      logoutCompany,
      updateCompanyConfig,
      companyFetch
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);
