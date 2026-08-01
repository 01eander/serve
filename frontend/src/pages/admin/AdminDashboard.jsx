import { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, Lock, Award, 
  Flame, BarChart3, AlertCircle, RefreshCw, Sparkles, PieChart as PieChartIcon, 
  Calendar as CalendarIcon, Clock, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import ZReportModal from '../../components/ZReportModal';
import ProUpgradeModal from '../../components/ProUpgradeModal';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCompany } from '../../contexts/CompanyContext';
import { useLanguage } from '../../contexts/LanguageContext';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function AdminDashboard() {
  const { company } = useCompany();
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();
  const [showZReport, setShowZReport] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeHeatmapTooltip, setActiveHeatmapTooltip] = useState(null);

  const isFreemium = company?.plan !== 'pro';

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/dashboard/stats', {
        headers: {
          'x-company-id': company?.id?.toString() || '1'
        }
      });
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
          <p className="font-bold mb-1 text-slate-300">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-black">{formatPrice(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const todaySales = stats?.metrics?.todaySales || 0;
  const todayOrdersCount = stats?.metrics?.todayOrdersCount || 0;
  const avgTicket = stats?.metrics?.avgTicket || 0;
  const activeStaffCount = stats?.metrics?.activeStaffCount || 0;

  const metrics = [
    { label: t('today_sales'), value: formatPrice(todaySales), icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
    { label: t('orders_made'), value: todayOrdersCount.toString(), icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/60' },
    { label: t('avg_ticket'), value: formatPrice(avgTicket), icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-950/60' },
    { label: t('active_staff'), value: `${activeStaffCount} ${t('on_shift')}`, icon: Users, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-950/60' },
  ];

  const salesData = stats?.salesTrend || [];
  const topItems = stats?.topItems || [];
  const staffPerformance = stats?.staffPerformance || [];
  const paymentStats = stats?.paymentStats || [];
  const heatmapData = stats?.heatmapData || [];

  const maxHeat = Math.max(...heatmapData.map(d => d.value), 1);

  // Helper to render heatmap cells
  const renderHeatmap = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return (
      <div className="relative">
        <div className="flex">
          {/* Y-axis labels (Days) */}
          <div className="flex flex-col justify-between pr-2 text-[10px] font-bold text-slate-400 mt-6">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="h-6 flex items-center">{day}</div>
            ))}
          </div>
          
          <div className="flex-1 overflow-x-auto custom-scrollbar pb-2">
            <div className="min-w-[600px]">
              {/* X-axis labels (Hours) */}
              <div className="flex mb-1">
                {hours.map(hour => (
                  <div key={hour} className="flex-1 text-center text-[9px] font-bold text-slate-400">
                    {hour}h
                  </div>
                ))}
              </div>
              
              {/* Grid */}
              <div className="flex flex-col gap-1">
                {DAYS_OF_WEEK.map((dayName, dayIndex) => (
                  <div key={dayIndex} className="flex gap-1">
                    {hours.map(hour => {
                      const dataPoint = heatmapData.find(d => d.day === dayIndex && d.hour === hour);
                      const value = dataPoint ? dataPoint.value : 0;
                      const intensity = value > 0 ? Math.max(0.2, value / maxHeat) : 0.02;
                      
                      return (
                        <div 
                          key={`${dayIndex}-${hour}`}
                          className="flex-1 h-5 rounded-sm relative group cursor-pointer transition-all hover:ring-2 hover:ring-primary-400"
                          style={{
                            backgroundColor: value > 0 ? `rgba(249, 115, 22, ${intensity})` : 'transparent',
                            border: value > 0 ? 'none' : '1px solid rgba(203, 213, 225, 0.3)'
                          }}
                          onMouseEnter={() => setActiveHeatmapTooltip({ day: dayName, hour, value })}
                          onMouseLeave={() => setActiveHeatmapTooltip(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Tooltip */}
        <AnimatePresence>
          {activeHeatmapTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 right-0 bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl pointer-events-none z-10"
            >
              <div className="font-bold text-amber-400 mb-1">
                {activeHeatmapTooltip.day}, {activeHeatmapTooltip.hour}:00 - {activeHeatmapTooltip.hour}:59
              </div>
              <div><span className="text-slate-400">Órdenes:</span> <span className="font-black text-sm">{activeHeatmapTooltip.value}</span></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

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
                Descubre tus horas pico, tendencias de ventas, análisis de métodos de pago y el rendimiento exacto de tu personal para tomar mejores decisiones.
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

      <div className={isFreemium ? 'filter grayscale blur-[4px] opacity-30 pointer-events-none select-none space-y-8' : 'space-y-8'}>
      
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
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('dashboard_control')}</p>
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
              </div>
              <div className={`p-4 rounded-2xl ${metric.bg}`}>
                <Icon className={`w-8 h-8 ${metric.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Main Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recharts Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                <span>{t('income_trend')}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('sales_by_day')}</p>
            </div>
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold text-xs rounded-full border border-primary-200 dark:border-primary-800 flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" /> {t('last_7_days')}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8b5cf6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#8b5cf6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Donut */}
        <div className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <PieChartIcon className="w-5 h-5 text-emerald-500" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('payment_methods')}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">{t('payment_dist_30d')}</p>

            {paymentStats.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="font-bold text-sm">{t('no_payment_data')}</p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {paymentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-slate-600 dark:text-slate-300 font-bold text-xs">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap & Staff Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Peak Hours Heatmap */}
        <div className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('peak_hours')}</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{t('last_30_days')}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">{t('peak_hours_desc')}</p>
          
          {heatmapData.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <p className="font-bold text-sm">{t('not_enough_data')}</p>
            </div>
          ) : (
            renderHeatmap()
          )}
        </div>

        {/* Staff Performance Table */}
        <div className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 mb-6">
            <Award className="w-5 h-5 text-purple-500" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('staff_performance')}</h3>
          </div>

          {staffPerformance.length === 0 ? (
            <div className="py-8 text-center text-slate-400 flex-1 flex flex-col justify-center">
              <p className="font-bold text-sm">{t('no_users_registered')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black rounded-xl">
                  <tr>
                    <th className="p-4 rounded-l-xl">{t('user_staff')}</th>
                    <th className="p-4">{t('orders_today')}</th>
                    <th className="p-4 rounded-r-xl text-right">{t('generated_sales')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {staffPerformance.map((staff, idx) => {
                    const maxStaffSales = Math.max(...staffPerformance.map(s => s.total), 1);
                    const perfPercent = (staff.total / maxStaffSales) * 100;
                    
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="font-black text-slate-900 dark:text-white text-sm">{staff.name}</div>
                          <div className="text-[10px] uppercase text-slate-400">{staff.role}</div>
                        </td>
                        <td className="p-4 text-slate-800 dark:text-slate-200 font-bold">{staff.orders}</td>
                        <td className="p-4 text-right">
                          <div className="text-primary-600 dark:text-primary-400 font-black text-sm mb-1">{formatPrice(staff.total)}</div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex justify-end">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${perfPercent}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Top Products Row */}
      <div className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <Flame className="w-5 h-5 text-rose-500" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('top_selling_dishes')}</h3>
        </div>

        {topItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-bold text-sm">{t('no_dishes_sold')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topItems.map((item, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl">
                <div className="text-[10px] font-black text-rose-500 uppercase tracking-wider mb-1">{t('top_n')} {idx + 1}</div>
                <div className="font-bold text-slate-900 dark:text-white leading-tight mb-2 truncate" title={item.name}>{item.name}</div>
                <div className="flex items-end justify-between mt-auto">
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-200">{item.sales}</div>
                  <div className="text-[10px] font-bold text-slate-400 mb-1">{t('units')}</div>
                </div>
              </div>
            ))}
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
        triggerReason="Analíticas Avanzadas"
      />
    </div>
  );
}
