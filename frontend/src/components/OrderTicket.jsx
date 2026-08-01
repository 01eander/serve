import { ShoppingCart, MessageSquare, ChefHat, CreditCard, X, Printer, Unlock, ArrowRightLeft, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function OrderTicket({ 
  orderItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onAddNote, 
  onSendToKitchen, 
  onCheckout,
  onPrintBill,
  onReopenBill,
  onOpenTransfer,
  isPrinted,
  tableNumber,
  orderStatus, // 'new', 'pending_kitchen', 'in_kitchen', 'served'
  assignedWaiter,
  loggedInWaiter,
  onTakeControl,
  isMobileOpen,
  onCloseMobile,
  isFreemium,
  onRequirePro
}) {
  const { taxRate, formatCurrency } = useCurrency();
  const { t } = useLanguage();
  const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const hasUnsentItems = orderStatus === 'new' || orderStatus === 'pending_kitchen';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
        />
      )}

      <aside className={`
        fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-slate-900 flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out
        lg:static lg:w-[420px] lg:translate-x-0 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:z-20
        ${isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Ticket Header */}
        <div className="p-6 sm:p-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('current_order')}</h2>
              <span className="bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 text-sm font-bold px-3 py-1 rounded-full shadow-inner border border-primary-200 dark:border-primary-700">{t('table')} {tableNumber}</span>
            </div>
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center bg-slate-200/70 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300">
              {t('status')}: 
              <span className={`ml-2 font-bold ${
                isPrinted ? 'text-indigo-600 dark:text-indigo-400' :
                orderStatus === 'in_kitchen' ? 'text-orange-600 dark:text-orange-400' : 
                orderStatus === 'served' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
              }`}>
                {isPrinted ? 'IMPRESA (BLOQUEADA)' :
                 orderStatus === 'in_kitchen' ? t('in_kitchen') : 
                 orderStatus === 'served' ? t('served') : t('modifying')}
              </span>
            </span>
          </div>
          {assignedWaiter && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5" />
                Atiende: <span className="font-bold text-slate-700 dark:text-slate-300">{assignedWaiter.name}</span>
              </span>
              {loggedInWaiter && assignedWaiter.id !== loggedInWaiter.id && (
                <button
                  onClick={isFreemium ? () => onRequirePro('Control de Meseros (Tomar Cuenta)') : onTakeControl}
                  className="flex items-center gap-1.5 text-xs font-bold bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                >
                  {isFreemium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                  <span>Tomar Cuenta</span>
                </button>
              )}
            </div>
          )}
        </div>

      {/* Ticket Items */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
        {orderItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500"
          >
            <div className="p-6 rounded-full bg-slate-200/50 dark:bg-slate-800/50 mb-4 backdrop-blur-md">
              <ShoppingCart className="w-12 h-12 opacity-50" />
            </div>
            <p className="font-bold text-lg text-slate-600 dark:text-slate-400">{t('empty_order')}</p>
            <p className="text-sm mt-1 font-medium text-slate-500 dark:text-slate-500">{t('select_products')}</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {orderItems.map(item => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                key={item.id} 
                className="flex p-4 rounded-[1.25rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary-400 dark:hover:border-primary-500 transition-colors group"
              >
                {item.image ? (
                   <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover mr-4 shadow-sm" />
                ) : (
                   <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-700 mr-4 shadow-sm flex items-center justify-center">
                     <span className="text-xs text-slate-400">{t('no_image')}</span>
                   </div>
                )}
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight pr-2">{item.name}</span>
                    <span className="font-black text-sm text-slate-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                  
                  {/* Notes Display */}
                  {item.notes && (
                    <div className="text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 px-2.5 py-1.5 rounded-lg mb-3 flex items-start">
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                      <span>{item.notes}</span>
                    </div>
                  )}
                  
                  <div className={`flex items-center justify-between mt-auto ${isPrinted ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-l-xl transition-colors font-bold">-</button>
                      <span className="px-3 text-sm font-black w-8 text-center text-slate-800 dark:text-white">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-r-xl transition-colors font-bold">+</button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onAddNote(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                        title={t('add_note')}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onRemoveItem(item.id)} 
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                      >
                        {t('remove')}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Ticket Footer / Actions */}
      <div className="p-7 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 font-medium">
            <span>{t('subtotal')}</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 font-medium">
            <span>{t('tax').replace('16%', taxRate + '%')}</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-black text-3xl text-slate-900 dark:text-white pt-4 border-t border-slate-200 dark:border-slate-800">
            <span>{t('total')}</span>
            <span className="text-primary-600 dark:text-primary-400">{formatCurrency(total)}</span>
          </div>
          
          {/* Transfer Button - Only show if order has items and is not printed */}
          {orderItems.length > 0 && !isPrinted && (
            <div className="pt-2">
              <button 
                onClick={isFreemium ? () => onRequirePro('Traspaso de Mesas') : onOpenTransfer}
                className="w-full flex items-center justify-center space-x-2 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
              >
                {isFreemium ? <Crown className="w-4 h-4 text-amber-500" /> : <ArrowRightLeft className="w-4 h-4" />}
                <span>Mudar de Mesa</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {isPrinted ? (
            <>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={isFreemium ? () => onRequirePro('Reapertura de Cuentas Impresas') : onReopenBill}
                className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-4 rounded-[1.25rem] transition-all flex items-center justify-center space-x-3 shadow-inner"
              >
                {isFreemium ? <Crown className="w-6 h-6 text-amber-500" /> : <Unlock className="w-6 h-6" />}
                <span className="text-lg">Reabrir Cuenta</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-[1.25rem] shadow-[0_8px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_25px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center space-x-3"
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-lg">{t('checkout')}</span>
              </motion.button>
            </>
          ) : hasUnsentItems ? (
            <motion.button 
              whileHover={{ scale: orderItems.length > 0 ? 1.02 : 1 }}
              whileTap={{ scale: orderItems.length > 0 ? 0.98 : 1 }}
              onClick={onSendToKitchen}
              disabled={orderItems.length === 0}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-white font-bold py-5 rounded-[1.25rem] shadow-[0_8px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_25px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <ChefHat className="w-6 h-6" />
              <span className="text-lg">{t('send_kitchen')}</span>
            </motion.button>
          ) : (
            <>
              <motion.button 
                whileHover={{ scale: orderItems.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: orderItems.length > 0 ? 0.98 : 1 }}
                onClick={onPrintBill}
                disabled={orderItems.length === 0}
                className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-4 rounded-[1.25rem] shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
              >
                <Printer className="w-6 h-6" />
                <span className="text-lg">Imprimir Cuenta</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: orderItems.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: orderItems.length > 0 ? 0.98 : 1 }}
                onClick={onCheckout}
                disabled={orderItems.length === 0}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-[1.25rem] shadow-[0_8px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_25px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-lg">{t('checkout')}</span>
              </motion.button>
            </>
          )}
        </div>
      </div>

    </aside>
  </>
  );
}
