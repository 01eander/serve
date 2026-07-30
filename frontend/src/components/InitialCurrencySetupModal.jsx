import { useState } from 'react';
import { DollarSign, Check, Percent, Sparkles, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCompany } from '../contexts/CompanyContext';
import { useCurrency } from '../contexts/CurrencyContext';

const CURRENCIES = [
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', flag: '🇺🇸' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
  { code: 'CAD', name: 'Dólar Canadiense', symbol: '$', flag: '🇨🇦' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', flag: '🇧🇷' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪' },
];

export default function InitialCurrencySetupModal({ onComplete }) {
  const { company, updateCompanyConfig } = useCompany();
  const { setCurrency, setTaxRate } = useCurrency();

  const [selectedCurrency, setSelectedCurrency] = useState('MXN');
  const [taxPercentage, setTaxPercentage] = useState('16');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const taxNum = parseFloat(taxPercentage) || 0;
      await updateCompanyConfig(selectedCurrency, taxNum);
      setCurrency(selectedCurrency);
      setTaxRate(taxNum);
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Error setting initial currency:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden text-white"
      >
        <div className="p-8 pb-6 text-center bg-gradient-to-b from-primary-950/60 to-transparent border-b border-slate-800">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-xs rounded-full uppercase tracking-wider inline-flex items-center space-x-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Configuración Inicial Obligatoria</span>
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white">¡Bienvenido, {company?.name}!</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Antes de comenzar a operar, selecciona la moneda local y la tasa de impuestos de tu establecimiento.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Currency Selection Grid */}
          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-3">
              Moneda Principal del Establecimiento
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CURRENCIES.map((c) => {
                const isSelected = selectedCurrency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCurrency(c.code)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary-500 bg-primary-600/20 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{c.flag}</span>
                      <span className="font-mono text-xs font-black text-slate-300">{c.symbol}</span>
                    </div>
                    <span className="font-extrabold text-xs mt-2">{c.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tax Rate Input */}
          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
              Tasa de Impuestos Incluida (% IVA / Impuesto)
            </label>
            <div className="relative">
              <Percent className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl outline-none focus:border-primary-500 text-white text-sm font-black transition-all"
                placeholder="ej. 16"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Puedes modificar esta tasa o cambiar de moneda en cualquier momento en el menú Admin &gt; Región & Moneda.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <Check className="w-5 h-5" />
            <span>Guardar Configuración y Continuar</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
