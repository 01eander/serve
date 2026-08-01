import { useRef } from 'react';
import { CheckCircle2, Printer, ArrowRight, Store, Calendar, User, Hash, Utensils, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCompany } from '../contexts/CompanyContext';
import { useLanguage } from '../contexts/LanguageContext';
import serveLogo from '../images/SERVE_Logo.png';

export default function ReceiptModal({ receiptData, onClose }) {
  const { taxRate, formatCurrency } = useCurrency();
  const { company } = useCompany();
  const { t } = useLanguage();
  const receiptRef = useRef();

  if (!receiptData) return null;

  const {
    orderId,
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
    perPersonAmount,
    isPreReceipt
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
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              {isPreReceipt ? 'Cuenta Preliminar / Ticket de Cobro' : 'Comprobante Digital de Consumo'}
            </p>
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
            {!isPreReceipt && tipAmount > 0 && (
              <div className="flex justify-between">
                <span>Propina:</span>
                <span>{formatCurrency(tipAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-black pt-2 text-slate-900 border-t border-slate-200 mt-2">
              <span>TOTAL:</span>
              <span>{formatCurrency(isPreReceipt ? subtotal + tax - (discountAmount||0) : finalTotal)}</span>
            </div>

            {splitMode === 'split' && (
              <div className="pt-2 text-primary-700 font-bold flex justify-between">
                <span>Cuenta dividida ({numPeople} pers):</span>
                <span>{formatCurrency(perPersonAmount)} / persona</span>
              </div>
            )}
          </div>

          {/* Payment Method & Change - Only if NOT pre-receipt */}
          {!isPreReceipt && (
            <div className="pt-4 text-xs space-y-1">
              <div className="flex justify-between font-bold">
                <span>{t('payment_method')}:</span>
                <span className="uppercase">{paymentMethod === 'card' ? t('debit_credit_card') : t('cash_payment')}</span>
              </div>
              {paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>{t('cash_received')}:</span>
                    <span>{formatCurrency(cashReceived)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>{t('change_given')}:</span>
                    <span>{formatCurrency(change)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Footer Note */}
          <div className="text-center pt-6 text-[10px] text-slate-500 font-sans border-t border-dashed border-slate-200 mt-4">
            {company?.plan === 'pro' && orderId && !isPreReceipt && (
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="font-bold text-slate-900 mb-1">{t('need_invoice')}</div>
                <div className="text-slate-600 mb-2">{t('invoice_scan_msg')}</div>
                <div className="font-mono font-bold text-primary-600 bg-white px-2 py-1.5 rounded-lg border border-slate-200 break-all">
                  serve.app/facturar/{orderId}
                </div>
              </div>
            )}
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
            <span>{t('print_receipt')}</span>
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm shadow-md"
          >
            <span>{isPreReceipt ? t('close_btn') : t('finish_order')}</span>
            {!isPreReceipt && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
