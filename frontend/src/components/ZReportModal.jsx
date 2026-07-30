import { useState } from 'react';
import { X, Printer, CheckCircle2, AlertTriangle, DollarSign, Calendar, Clock, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ZReportModal({ onClose }) {
  const [actualCash, setActualCash] = useState('');
  const [shiftClosed, setShiftClosed] = useState(false);

  // Mocked shift system totals (would come from DB in production)
  const systemTotals = {
    shiftId: 'SHIFT-2026-0719',
    openedAt: '08:00 AM',
    closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cashSales: 845.50,
    cardSales: 620.00,
    totalTips: 145.00,
    totalTaxes: 234.48,
    totalOrders: 42,
    totalGrossSales: 1465.50
  };

  const cashCountedNum = parseFloat(actualCash) || 0;
  const difference = cashCountedNum - systemTotals.cashSales;

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmCloseShift = () => {
    setShiftClosed(true);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white tracking-tight">Corte de Caja (Reporte Z)</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Arqueo de efectivo y cierre de turno</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Shift Details Banner */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>Turno: {systemTotals.shiftId}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>Apertura: {systemTotals.openedAt}</span>
            </div>
          </div>

          {/* System Sales Summary Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Ventas en Efectivo Esperadas</span>
              <h4 className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">${systemTotals.cashSales.toFixed(2)}</h4>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/50">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">Ventas con Tarjeta</span>
              <h4 className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">${systemTotals.cardSales.toFixed(2)}</h4>
            </div>
          </div>

          {/* Cash Count Input */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
            <label className="block text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-2">
              Efectivo Físico en Caja Registradora ($)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">$</span>
              <input
                type="number"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                placeholder="Ingresa monto en efectivo contado..."
                disabled={shiftClosed}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl outline-none focus:border-primary-500 text-xl font-black text-slate-800 dark:text-white transition-all"
              />
            </div>

            {actualCash !== '' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl font-bold flex justify-between items-center text-sm ${
                  difference === 0
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                    : difference > 0
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                    : 'bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-300 border border-red-300 dark:border-red-700'
                }`}
              >
                <span>Diferencia de Caja:</span>
                <span className="text-xl font-black">
                  {difference === 0 ? '✓ Caja Cuadrada ($0.00)' : difference > 0 ? `+ $${difference.toFixed(2)} (Sobrante)` : `- $${Math.abs(difference).toFixed(2)} (Faltante)`}
                </span>
              </motion.div>
            )}
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <div className="bg-slate-100 dark:bg-slate-800 p-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              Resumen Financiero del Turno
            </div>
            <div className="p-4 space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between"><span>Órdenes Totales Atendidas:</span><span className="font-bold">{systemTotals.totalOrders}</span></div>
              <div className="flex justify-between"><span>Impuestos Cobrados (IVA 16%):</span><span className="font-bold">${systemTotals.totalTaxes.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Propinas Totales:</span><span className="font-bold">${systemTotals.totalTips.toFixed(2)}</span></div>
              <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>VENTAS BRUTAS TOTALES:</span>
                <span className="text-primary-600 dark:text-primary-400">${systemTotals.totalGrossSales.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Reporte Z</span>
          </button>

          {!shiftClosed ? (
            <button
              onClick={handleConfirmCloseShift}
              disabled={actualCash === ''}
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm shadow-md disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Cerrar Turno</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3.5 px-4 bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm shadow-md"
            >
              <span>Turno Cerrado✓ Exit</span>
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
}
