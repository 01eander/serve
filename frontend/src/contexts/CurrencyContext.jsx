import { createContext, useState, useContext, useEffect } from 'react';

export const CURRENCIES = [
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', flag: '🇺🇸', locale: 'en-US', defaultTax: 8.25 },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽', locale: 'es-MX', defaultTax: 16 },
  { code: 'CAD', name: 'Dólar Canadiense', symbol: 'CA$', flag: '🇨🇦', locale: 'en-CA', defaultTax: 13 },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', flag: '🇧🇷', locale: 'pt-BR', defaultTax: 17 },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴', locale: 'es-CO', defaultTax: 19, decimals: 0 },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷', locale: 'es-AR', defaultTax: 21 },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱', locale: 'es-CL', defaultTax: 19, decimals: 0 },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪', locale: 'es-PE', defaultTax: 18 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', locale: 'es-ES', defaultTax: 21 },
];

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState(localStorage.getItem('currency_code') || 'USD');
  const [taxRate, setTaxRate] = useState(parseFloat(localStorage.getItem('tax_rate')) || 16);

  const activeCurrency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  const changeCurrency = (code) => {
    const selected = CURRENCIES.find(c => c.code === code);
    if (selected) {
      setCurrencyCode(selected.code);
      localStorage.setItem('currency_code', selected.code);
      if (!localStorage.getItem('custom_tax_set')) {
        setTaxRate(selected.defaultTax);
        localStorage.setItem('tax_rate', selected.defaultTax);
      }
    }
  };

  const updateTaxRate = (rate) => {
    const newRate = Math.max(0, parseFloat(rate) || 0);
    setTaxRate(newRate);
    localStorage.setItem('tax_rate', newRate);
    localStorage.setItem('custom_tax_set', 'true');
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    const decimals = activeCurrency.decimals !== undefined ? activeCurrency.decimals : 2;
    
    const formattedNum = num.toLocaleString(activeCurrency.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    if (activeCurrency.code === 'EUR') {
      return `${formattedNum} ${activeCurrency.symbol}`;
    }
    return `${activeCurrency.symbol}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currencyCode, 
      activeCurrency, 
      changeCurrency, 
      taxRate, 
      updateTaxRate, 
      formatCurrency 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
