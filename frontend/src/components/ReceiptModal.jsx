import { useRef } from 'react';
import { CheckCircle2, Printer, ArrowRight, Store, Calendar, User, Hash, Utensils, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCompany } from '../contexts/CompanyContext';
import serveLogo from '../images/SERVE_Logo.png';

export default function ReceiptModal({ receiptData, onClose }) {
  const { taxRate, formatCurrency } = useCurrency();
  const { company } = useCompany();
  const receiptRef = useRef();

  if (!receiptData) return null;

  const {
    tableName,
    waiterName,
    items = [],
    subtotal,
    discountAmount,
    tax,
    tipAmount,
    finalTotal,
    paymentMethod,
    cashReceived,
    change,
    splitMode,
    numPeople,
    perPersonAmount
  } = receiptData;

  const ticketId = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Printable Ticket Area */}
        <div ref={receiptRef} className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white text-slate-900 font-mono text-sm shadow-inner print:p-0 print:shadow-none">
          
          {/* Header Branding */}
          <div className="text-center pb-6 border-b border-dashed border-slate-300">
            {company?.logo ? (
              <img 
                src={company.logo} 
                alt={company.name} 
                className="h-16 w-auto max-w-[180px] object-contain mx-auto mb-2"
              />
            ) : (
              <img 
                src={serveLogo} 
                alt="SERVE POS" 
                className="h-16 w-auto object-contain mx-auto mb-2 drop-shadow-md" 
              />
            )}
            <div className="flex items-center justify-center space-x-2">
              <h2 className="font-extrabold text-xl tracking-tight text-slate-900 uppercase">{company?.name || 'OLEANDER SERVE'}</h2>
              <span className={`inline-flex items-center space-x-1 px-2 py-0.2 rounded-full text-[9px] font-black ${
                company?.plan === 'pro' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                  : 'bg-slate-200 text-slate-700'
              }`}>
                <Sparkles className="w-2.5 h-2.5" />
                <span>{company?.plan === 'pro' ? '👑 PRO' : '⚡ Freemium'}</span>
              </span>
            </div>
            {company?.address && (
              <p className="text-[11px] font-sans font-bold text-slate-700 mt-0.5">{company.address}</p>
            )}
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">Comprobante Digital de Consumo</p>
            <div className="mt-3 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <Hash className="w-3 h-3 text-slate-400" />
                <span>Ticket #{ticketId}</span>
              </div>
              <div className="flex items-center justify-center space-x-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{now.toLocaleDateString()} - {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Table & Waiter Info */}
          <div className="py-4 border-b border-dashed border-slate-300 flex justify-between text-xs text-slate-700">
            <div className="flex items-center space-x-1">
              <Utensils className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold">Mesa: {tableName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold">Atendió: {waiterName || 'Mesero'}</span>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="py-4 border-b border-dashed border-slate-300 space-y-2">
            <div className="flex justify-between font-bold text-xs uppercase text-slate-500 pb-1">
              <span>Cant. / Platillo</span>
              <span>Total</span>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs">
                <div>
                  <span className="font-bold mr-2">{item.quantity}x</span>
                  <span>{item.name}</span>
                  {item.notes && <div className="text-[10px] text-slate-500 italic ml-5">Note: {item.notes}</div>}
                </div>
                <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div className="py-4 border-b border-dashed border-slate-300 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-orange-600 font-bold">
                <span>Descuento:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Impuestos ({taxRate}%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Propina:</span>
              <span>{formatCurrency(tipAmount)}</span>
            </div>

            <div className="flex justify-between text-base font-black pt-2 text-slate-900 border-t border-slate-200 mt-2">
              <span>TOTAL:</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>

            {splitMode === 'split' && (
              <div className="pt-2 text-primary-700 font-bold flex justify-between">
                <span>Cuenta dividida ({numPeople} pers):</span>
                <span>{formatCurrency(perPersonAmount)} / persona</span>
              </div>
            )}
          </div>

          {/* Payment Method & Change */}
          <div className="pt-4 text-xs space-y-1">
            <div className="flex justify-between font-bold">
              <span>Método de Pago:</span>
              <span className="uppercase">{paymentMethod === 'card' ? 'Tarjeta de Débito/Crédito' : 'Efectivo'}</span>
            </div>
            {paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between">
                  <span>Efectivo Recibido:</span>
                  <span>{formatCurrency(cashReceived)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Cambio Entregado:</span>
                  <span>{formatCurrency(change)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center pt-6 text-[10px] text-slate-500 font-sans border-t border-dashed border-slate-200 mt-4">
            <p className="font-extrabold text-xs text-slate-800">
              {company?.ticket_footer_phrase || '¡Gracias por su preferencia! Vuelva pronto.'}
            </p>
            <p className="mt-0.5 text-slate-400">Este ticket es un comprobante digital de consumo.</p>
          </div>

        </div>

        {/* Action Controls */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Recibo</span>
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm shadow-md"
          >
            <span>Finalizar Orden</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </motion.div>
    </div>
  );
}
