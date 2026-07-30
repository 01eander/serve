import { useState } from 'react';
import { X, CreditCard, Banknote, CheckCircle2, Users, Percent, DollarSign, Split } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../contexts/CurrencyContext';

export default function CheckoutModal({ subtotal, tax, total, onClose, onConfirm }) {
  const { taxRate, formatCurrency, activeCurrency } = useCurrency();
  // Discount state
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customDiscount, setCustomDiscount] = useState('');
  const [isCustomDiscount, setIsCustomDiscount] = useState(false);

  // Tip state
  const [tipPercentage, setTipPercentage] = useState(10);
  const [customTip, setCustomTip] = useState('');
  const [isCustomTip, setIsCustomTip] = useState(false);

  // Split bill state
  const [splitMode, setSplitMode] = useState('single'); // 'single', 'split'
  const [numPeople, setNumPeople] = useState(2);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cashReceived, setCashReceived] = useState('');

  // Calculations
  const discountAmount = isCustomDiscount 
    ? (parseFloat(customDiscount) || 0) 
    : subtotal * (discountPercent / 100);

  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  
  const tipAmount = isCustomTip 
    ? (parseFloat(customTip) || 0) 
    : subtotalAfterDiscount * (tipPercentage / 100);

  const finalTotal = subtotalAfterDiscount + tax + tipAmount;
  const perPersonAmount = splitMode === 'split' ? finalTotal / numPeople : finalTotal;

  const change = paymentMethod === 'cash' && cashReceived 
    ? parseFloat(cashReceived) - (splitMode === 'split' ? perPersonAmount : finalTotal) 
    : 0;

  const handleConfirm = () => {
    onConfirm({
      subtotal,
      discountAmount,
      tax,
      tipAmount,
      finalTotal,
      splitMode,
      numPeople,
      perPersonAmount,
      paymentMethod,
      cashReceived: parseFloat(cashReceived) || 0,
      change: Math.max(0, change)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div>
            <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white tracking-tight">Procesar Pago</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">División de cuenta, propinas y método de pago</p>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Split Bill Option */}
          <div>
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest flex items-center space-x-2">
              <Split className="w-4 h-4 text-primary-500" />
              <span>Modalidad de Pago</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSplitMode('single')}
                className={`py-3.5 px-4 rounded-xl font-bold transition-all border-2 text-sm flex items-center justify-center space-x-2 ${
                  splitMode === 'single'
                    ? 'border-primary-500 bg-primary-600 text-white shadow-md'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>Cuenta Única</span>
              </button>
              <button
                onClick={() => setSplitMode('split')}
                className={`py-3.5 px-4 rounded-xl font-bold transition-all border-2 text-sm flex items-center justify-center space-x-2 ${
                  splitMode === 'split'
                    ? 'border-primary-500 bg-primary-600 text-white shadow-md'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Dividir Cuenta</span>
              </button>
            </div>

            {splitMode === 'split' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Número de Personas:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setNumPeople(Math.max(2, numPeople - 1))}
                    className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-black hover:bg-slate-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-black text-primary-600 dark:text-primary-400 w-8 text-center">{numPeople}</span>
                  <button
                    onClick={() => setNumPeople(numPeople + 1)}
                    className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-black hover:bg-slate-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Discount Section */}
          <div>
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest flex items-center space-x-2">
              <Percent className="w-4 h-4 text-orange-500" />
              <span>Descuento Aplicado</span>
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {[0, 5, 10, 15].map(d => (
                <button
                  key={d}
                  onClick={() => {
                    setIsCustomDiscount(false);
                    setDiscountPercent(d);
                  }}
                  className={`py-3 rounded-xl font-bold transition-all border-2 text-xs ${
                    !isCustomDiscount && discountPercent === d
                      ? 'border-orange-500 bg-orange-600 text-white shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {d === 0 ? 'Sin desc.' : `${d}%`}
                </button>
              ))}
              <button
                onClick={() => setIsCustomDiscount(true)}
                className={`py-3 rounded-xl font-bold transition-all border-2 text-xs ${
                  isCustomDiscount
                    ? 'border-orange-500 bg-orange-600 text-white shadow-md'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                Fijo $
              </button>
            </div>

            {isCustomDiscount && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(e.target.value)}
                    placeholder="Monto de descuento en $"
                    className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-orange-500 font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Tips Section */}
          <div>
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>Propina Sugerida</span>
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {[0, 10, 15, 20].map(tip => (
                <button
                  key={tip}
                  onClick={() => {
                    setIsCustomTip(false);
                    setTipPercentage(tip);
                  }}
                  className={`py-3 rounded-xl font-bold transition-all border-2 text-xs ${
                    !isCustomTip && tipPercentage === tip
                      ? 'border-primary-500 bg-primary-600 text-white shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="text-sm">{tip}%</div>
                  <div className="text-[10px] opacity-80 mt-0.5">${(subtotalAfterDiscount * (tip / 100)).toFixed(2)}</div>
                </button>
              ))}
              <button
                onClick={() => setIsCustomTip(true)}
                className={`py-3 rounded-xl font-bold transition-all border-2 text-xs flex flex-col items-center justify-center ${
                  isCustomTip
                    ? 'border-primary-500 bg-primary-600 text-white shadow-md'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>Otro $</span>
              </button>
            </div>

            {isCustomTip && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    placeholder="Monto de propina en $"
                    className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Totals Summary */}
          <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-inner">
            <div className="space-y-2.5 text-sm mb-3">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                <span>Subtotal</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-orange-600 dark:text-orange-400 font-bold">
                  <span>Descuento</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                <span>Impuestos (16%)</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                <span>Propina</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">${tipAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-2xl font-black text-slate-800 dark:text-white pt-3 border-t border-slate-300 dark:border-slate-700 border-dashed">
              <span>Total General</span>
              <span className="text-primary-600 dark:text-primary-400">${finalTotal.toFixed(2)}</span>
            </div>

            {splitMode === 'split' && (
              <div className="mt-3 p-3 bg-primary-100 dark:bg-primary-950/60 rounded-xl flex justify-between items-center text-primary-900 dark:text-primary-300 font-black border border-primary-300 dark:border-primary-700">
                <span>Total por Persona ({numPeople} pers):</span>
                <span className="text-xl">${perPersonAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest">Método de Pago</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-center space-x-3 py-4 rounded-xl font-bold transition-all border-2 ${
                  paymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-600 text-white shadow-md' 
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Tarjeta</span>
              </button>
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center space-x-3 py-4 rounded-xl font-bold transition-all border-2 ${
                  paymentMethod === 'cash' 
                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-md' 
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Efectivo</span>
              </button>
            </div>
          </div>

          {/* Cash Input */}
          <AnimatePresence>
            {paymentMethod === 'cash' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Efectivo Recibido</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">$</span>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl outline-none focus:border-emerald-500 text-xl font-black text-slate-800 dark:text-white transition-all shadow-inner"
                    />
                  </div>
                  {change > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl flex justify-between items-center text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700"
                    >
                      <span>Cambio a devolver:</span>
                      <span className="text-2xl">${change.toFixed(2)}</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button 
            onClick={handleConfirm}
            disabled={paymentMethod === 'cash' && change < 0}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4.5 rounded-[1.25rem] shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center space-x-2 text-lg"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>Confirmar Pago de ${ (splitMode === 'split' ? perPersonAmount : finalTotal).toFixed(2) }</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
}
