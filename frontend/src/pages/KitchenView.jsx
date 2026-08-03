import { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle2, Flame, ArrowLeft, RefreshCw, AlertTriangle, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import ThemeLangToggles from '../components/ThemeLangToggles';
import { useCompany } from '../contexts/CompanyContext';
import ProUpgradeModal from '../components/ProUpgradeModal';
import { useLanguage } from '../contexts/LanguageContext';
import serveLogo from '../images/SERVE_Logo.png';
import smallLogo from '../images/small_LOGO.png';

export default function KitchenView() {
  const { company } = useCompany();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'preparing', 'served'
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/orders/active');
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
        setLastRefreshed(new Date());
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const getMinutesElapsed = (createdAt) => {
    const start = new Date(createdAt);
    const now = new Date();
    const diffMs = now - start;
    return Math.floor(diffMs / 60000);
  };

  const getTimerBadge = (minutes) => {
    if (minutes < 10) {
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
        label: `${minutes} min`
      };
    } else if (minutes < 20) {
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
        label: `${minutes} min`
      };
    } else {
      return {
        bg: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700 animate-pulse',
        label: `${minutes} min ⚠️`
      };
    }
  };

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    if (filter === 'pending') return order.status === 'pending';
    if (filter === 'preparing') return order.status === 'preparing';
    if (filter === 'served') return order.status === 'served';
    return true;
  });

  const isFreemium = company?.plan !== 'pro';
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col relative">
      
      {/* PRO Lockout Banner for Freemium */}
      {isFreemium && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border-2 border-amber-500/50 p-8 rounded-[2.5rem] shadow-2xl space-y-6 text-white">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
              <ChefHat className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-xs rounded-full border border-amber-500/30 inline-flex items-center space-x-1 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('pro_exclusive')}</span>
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white">{t('kds_title')}</h2>
              <p className="text-xs text-slate-300 font-medium mt-2 leading-relaxed">
                La gestión de comandas digitales en tiempo real para chefs y cocineros forma parte del plan <strong>👑 PRO</strong> de Oleander Serve.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black rounded-2xl shadow-xl shadow-amber-500/25 transition-all text-sm flex items-center justify-center space-x-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ver Beneficios & Solicitar Versión PRO</span>
              </button>

              <button
                onClick={() => navigate(-1)}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                {t('back_to_tables')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-200/90 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 font-extrabold text-sm transition-colors border border-slate-300 dark:border-slate-700 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_tables')}</span>
          </button>
          <div className="flex items-center space-x-3">
            <img src={smallLogo} alt="Serve" className="h-10 w-auto object-contain drop-shadow-md" />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight">{t('kds_title')}</h1>
                <span className="px-2.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-xs rounded-full border border-slate-300 dark:border-slate-700 flex items-center space-x-1 shadow-sm">
                  <span>{company?.name || 'Mi Empresa'}</span>
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.2 rounded-full text-[9px] font-black ${
                    company?.plan === 'pro' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{company?.plan === 'pro' ? '👑 PRO' : '⚡ Freemium'}</span>
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t('updated_at')} {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              {t('all')} ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'pending' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              {t('pending')} ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('preparing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'preparing' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              {t('preparing')} ({orders.filter(o => o.status === 'preparing').length})
            </button>
            <button
              onClick={() => setFilter('served')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'served' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              {t('served')} ({orders.filter(o => o.status === 'served').length})
            </button>
          </div>

          <button 
            onClick={fetchOrders}
            className="p-2.5 bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Refrescar comisiones"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <ThemeLangToggles />
        </div>
      </header>

      {/* Main KDS Grid */}
      <main className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-10 h-10 animate-spin mb-3" />
            <p className="font-bold">{t('loading_orders')}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <CheckCircle2 className="w-16 h-16 opacity-40 mb-4" />
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400">{t('no_active_orders')}</h3>
            <p className="text-sm mt-1">{t('new_orders_appear_here')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map(order => {
                const minutes = getMinutesElapsed(order.created_at);
                const timerInfo = getTimerBadge(minutes);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    key={order.id}
                    className={`bg-white dark:bg-slate-900 border-2 rounded-[1.75rem] shadow-lg overflow-hidden flex flex-col justify-between ${
                      order.status === 'pending' ? 'border-orange-400 dark:border-orange-500' :
                      order.status === 'preparing' ? 'border-blue-400 dark:border-blue-500' :
                      'border-emerald-400 dark:border-emerald-500'
                    }`}
                  >
                    {/* Order Header */}
                    <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">{t('table_short')}</span>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none mt-0.5">
                          {order.table_number}
                        </h2>
                      </div>

                      <div className="flex flex-col items-end space-y-1.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${timerInfo.bg} flex items-center space-x-1`}>
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          <span>{timerInfo.label}</span>
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                          order.status === 'pending' ? 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300' :
                          order.status === 'preparing' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' :
                          'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {order.status === 'pending' ? t('pending') : order.status === 'preparing' ? t('preparing') : t('ready_to_serve')}
                        </span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="p-5 flex-1 space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                      {order.items?.map(item => (
                        <div key={item.id} className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div className="flex items-start justify-between">
                            <span className="font-extrabold text-base text-slate-800 dark:text-slate-100 pr-2">
                              <span className="text-primary-600 dark:text-primary-400 font-black mr-2 text-lg">
                                {item.quantity}x
                              </span>
                              {item.item_name}
                            </span>
                          </div>
                          {item.notes && (
                            <div className="mt-2 text-xs font-bold text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 p-2 rounded-lg border border-orange-200 dark:border-orange-800 flex items-start">
                              <MessageSquare className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                              <span>{item.notes}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Order Action Footer */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                        >
                          <Flame className="w-5 h-5" />
                          <span>{t('start_prep')}</span>
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'served')}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>{t('mark_ready')}</span>
                        </button>
                      )}
                      {order.status === 'served' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'paid')}
                          className="w-full py-3.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all active:scale-95"
                        >
                          <span>{t('archive_delivered')}</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerReason={t('pro_exclusive')}
      />
    </div>
  );
}
