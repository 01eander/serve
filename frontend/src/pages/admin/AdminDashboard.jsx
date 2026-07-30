import { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, Lock, Award, ArrowUpRight, Flame, BarChart3, AlertCircle, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import ZReportModal from '../../components/ZReportModal';
import ProUpgradeModal from '../../components/ProUpgradeModal';
import { useCurrency } from '../../contexts/CurrencyContext'; // Or CurrencyContext
import { useCompany } from '../../contexts/CompanyContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AdminDashboard() {
  const { company } = useCompany();
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();
  const [showZReport, setShowZReport] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const isFreemium = company?.plan !== 'pro';

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [company]);

  const formatPrice = (amount) => {
    return formatCurrency(amount);
  };

  const todaySales = stats?.metrics?.todaySales || 0;
  const todayOrdersCount = stats?.metrics?.todayOrdersCount || 0;
  const avgTicket = stats?.metrics?.avgTicket || 0;
  const activeStaffCount = stats?.metrics?.activeStaffCount || 0;

  const metrics = [
    { label: t('today_sales'), value: formatPrice(todaySales), change: todaySales > 0 ? '+100%' : '0%', icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
    { label: t('orders_made'), value: todayOrdersCount.toString(), change: todayOrdersCount > 0 ? '+100%' : '0%', icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/60' },
    { label: t('avg_ticket'), value: formatPrice(avgTicket), change: avgTicket > 0 ? '+100%' : '0%', icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-950/60' },
    { label: t('active_staff'), value: `${activeStaffCount} ${t('on_shift')}`, change: t('active'), icon: Users, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-950/60' },
  ];

  const salesData = stats?.salesTrend || [
    { day: 'Lun', sales: 0 },
    { day: 'Mar', sales: 0 },
    { day: 'Mié', sales: 0 },
    { day: 'Jue', sales: 0 },
    { day: 'Vie', sales: 0 },
    { day: 'Sáb', sales: 0 },
    { day: 'Dom', sales: 0 },
  ];

  const maxSales = Math.max(...salesData.map(d => d.sales), 1);
  const topItems = stats?.topItems || [];
  const staffPerformance = stats?.staffPerformance || [];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      
      {/* PRO Lockout Overlay for Freemium Dashboard */}
      {isFreemium && (
        <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="max-w-lg bg-slate-900 border-2 border-amber-500/50 p-8 rounded-[2.5rem] shadow-2xl space-y-6 text-white pointer-events-auto">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3.5 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-xs rounded-full border border-amber-500/30 inline-flex items-center space-x-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('pro_exclusive')}</span>
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">{t('advanced_analytics')}</h2>
              <p className="text-xs md:text-sm text-slate-300 font-medium mt-2 leading-relaxed">
                {t('pro_dashboard_desc')}
              </p>
            </div>

            <button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black rounded-2xl shadow-xl shadow-amber-500/25 transition-all text-sm flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>{t('upgrade_to_pro')}</span>
            </button>
          </div>
        </div>
      )}

      <div className={isFreemium ? 'filter grayscale blur-[2px] opacity-40 pointer-events-none select-none space-y-8' : 'space-y-8'}>
      
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center space-x-3">
            <span>{t('analytics_panel')}</span>
            <span className="px-3 py-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full border border-primary-500/20 flex items-center space-x-1.5">
              <span>{company?.name || 'Mi Empresa'}</span>
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                company?.plan === 'pro' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{company?.plan === 'pro' ? '👑 PRO' : '⚡ Freemium'}</span>
              </span>
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('exclusive_summary')}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardStats}
            className="p-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title={t('refresh_data')}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowZReport(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center space-x-2.5 active:scale-95"
          >
            <Lock className="w-5 h-5" />
            <span>{t('z_report')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-[1.75rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{metric.label}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{metric.value}</h3>
                <div className="flex items-center space-x-1 mt-2 text-xs font-extrabold text-slate-500 dark:text-slate-400">
                  <span>{metric.change}</span>
                </div>
              </div>
              <div className={`p-4 rounded-2xl ${metric.bg}`}>
                <Icon className={`w-8 h-8 ${metric.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts & Rankings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly Sales Interactive Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                <span>{t('weekly_sales_trend')}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('income_behavior')} ({company?.currency || 'USD'})</p>
            </div>
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold text-xs rounded-full border border-primary-200 dark:border-primary-800">
              {t('last_7_days')}
            </span>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="h-64 flex items-end justify-between space-x-4 pt-6 border-b border-slate-100 dark:border-slate-800 pb-2">
            {salesData.map((d, i) => {
              const heightPercent = maxSales > 0 ? (d.sales / maxSales) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[11px] font-black text-slate-700 dark:text-slate-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm">
                    {formatPrice(d.sales)}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPercent, 4)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={`w-full rounded-t-xl transition-all ${
                      d.sales > 0
                        ? 'bg-gradient-to-t from-primary-600 to-primary-400 shadow-lg shadow-primary-500/30'
                        : 'bg-slate-200 dark:bg-slate-800/60 opacity-40'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-3">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('top_selling_dishes')}</h3>
            </div>

            {topItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="font-bold text-sm">{t('no_dishes_sold')}</p>
                <p className="text-xs mt-1">{t('no_dishes_desc')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topItems.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-100">{item.name}</span>
                      <span className="text-primary-600 dark:text-primary-400 font-extrabold">{item.sales} unids.</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Staff Performance Table */}
      <div className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-500" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('staff_performance')} ({company?.name})</h3>
          </div>
        </div>

        {staffPerformance.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <p className="font-bold text-sm">{t('no_users_registered')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black rounded-xl">
                <tr>
                  <th className="p-4 rounded-l-xl">{t('user_staff')}</th>
                  <th className="p-4">{t('role')}</th>
                  <th className="p-4">{t('orders_today')}</th>
                  <th className="p-4">{t('generated_sales')}</th>
                  <th className="p-4 rounded-r-xl">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {staffPerformance.map((staff, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 font-bold transition-colors">
                    <td className="p-4 font-black text-slate-900 dark:text-white text-sm">{staff.name}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{staff.role}</td>
                    <td className="p-4 text-slate-800 dark:text-slate-200">{staff.orders} órdenes</td>
                    <td className="p-4 text-primary-600 dark:text-primary-400 font-black text-sm">{formatPrice(staff.total)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full font-black ${
                        staff.total > 0 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {staff.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>

      {/* Z Report Modal */}
      {showZReport && (
        <ZReportModal onClose={() => setShowZReport(false)} />
      )}

      {/* Pro Benefits Modal */}
      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerReason={t('pro_exclusive')}
      />
    </div>
  );
}
