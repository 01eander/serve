import { useState, useEffect } from 'react';
import { Building2, DollarSign, Users, Store, LineChart, Loader2, ArrowUpRight } from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { motion } from 'framer-motion';

export default function FranchiseHQ() {
  const { company, companyFetch } = useCompany();
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [company]);

  const fetchStats = async () => {
    try {
      const res = await companyFetch(`http://localhost:3000/api/companies/${company.id}/franchise/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching franchise stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!company?.is_franchise_parent) {
    return (
      <div className="p-8 text-center text-slate-500">
        Esta cuenta no está configurada como Franquicia Corporativa. Actívalo en la sección Configuración.
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-indigo-600" />
            Centro de Comando HQ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Monitoreo en tiempo real de todas tus sucursales
          </p>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              Hoy
            </span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
            {formatCurrency(stats?.globalSales || 0)}
          </h3>
          <p className="text-sm font-bold text-slate-500 mt-1">Ventas Globales (Red)</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-600">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              En Vivo
            </span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
            {stats?.globalTables || 0}
          </h3>
          <p className="text-sm font-bold text-slate-500 mt-1">Mesas Ocupadas Globales</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
              <Store className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
            {stats?.branches?.length || 0}
          </h3>
          <p className="text-sm font-bold text-slate-500 mt-1">Sucursales Activas</p>
        </motion.div>
      </div>

      {/* Branches Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center">
            <LineChart className="w-5 h-5 mr-2 text-indigo-500" />
            Rendimiento por Sucursal
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-wider">
                <th className="px-6 py-4">Sucursal</th>
                <th className="px-6 py-4 text-center">Mesas Activas</th>
                <th className="px-6 py-4 text-right">Ventas (Hoy)</th>
                <th className="px-6 py-4 text-right">Aportación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats?.branches?.map(branch => {
                const percentage = stats.globalSales > 0 ? (branch.totalSales / stats.globalSales) * 100 : 0;
                return (
                  <tr key={branch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {branch.name}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {branch.id}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-xl text-xs font-black ${
                        branch.activeTables > 0 
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' 
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {branch.activeTables} mesas
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                      {formatCurrency(branch.totalSales)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-xs font-bold text-slate-500">{percentage.toFixed(1)}%</span>
                        <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
