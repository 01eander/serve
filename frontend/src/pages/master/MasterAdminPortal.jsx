import { useState, useEffect } from 'react';
import { ShieldCheck, Building2, Utensils, Users, LayoutGrid, FileText, Search, Filter, AlertTriangle, CheckCircle, Ban, Sparkles, RefreshCw, LogOut, DollarSign, Calendar, Edit3, Key, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../../contexts/CompanyContext';
import { API_BASE_URL } from '../../config/api';
import oleanderLogoWhite from '../../images/oleander_logo_white.png.png';

export default function MasterAdminPortal() {
  const { company, logoutCompany, isMasterAdmin } = useCompany();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ overview: {}, companies: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'moroso' | 'freemium' | 'pro'
  
  // Billing modal state
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [billingNotes, setBillingNotes] = useState('');
  const [billingDueDate, setBillingDueDate] = useState('');
  const [savingBilling, setSavingBilling] = useState(false);

  // Password reset state
  const [selectedCompanyForPassword, setSelectedCompanyForPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Company delete state
  const [selectedCompanyForDelete, setSelectedCompanyForDelete] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  const fetchMasterStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/master/stats`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching master stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterStats();
  }, []);

  const handleStatusChange = async (companyId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/master/companies/${companyId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchMasterStats();
      }
    } catch (err) {
      console.error('Error changing company status:', err);
    }
  };

  const handlePlanToggle = async (companyId, currentPlan) => {
    const nextPlan = currentPlan === 'pro' ? 'freemium' : 'pro';
    try {
      const res = await fetch(`${API_BASE_URL}/api/master/companies/${companyId}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: nextPlan })
      });
      if (res.ok) {
        fetchMasterStats();
      }
    } catch (err) {
      console.error('Error toggling company plan:', err);
    }
  };

  const handleRenewCompany = async (companyId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/master/companies/${companyId}/renew`, {
        method: 'PATCH'
      });
      if (res.ok) {
        fetchMasterStats();
      }
    } catch (err) {
      console.error('Error renewing company subscription:', err);
    }
  };

  const handleSaveBilling = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;
    setSavingBilling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/master/companies/${selectedCompany.id}/billing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          billing_notes: billingNotes,
          billing_due_date: billingDueDate ? new Date(billingDueDate).toISOString() : null
        })
      });
      if (res.ok) {
        setSelectedCompany(null);
        fetchMasterStats();
      }
    } catch (err) {
      console.error('Error saving billing notes:', err);
    } finally {
      setSavingBilling(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedCompanyForPassword || !newPassword) return;
    setSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/master/companies/${selectedCompanyForPassword.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
        setSelectedCompanyForPassword(null);
        setNewPassword('');
        alert('Contraseña reseteada con éxito');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al resetear la contraseña');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      alert('Error de red al resetear la contraseña');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteCompany = async (e) => {
    e.preventDefault();
    if (!selectedCompanyForDelete) return;

    setDeletingCompany(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/master/companies/${selectedCompanyForDelete.id}`, {
        method: 'DELETE'
      });
      const resData = await res.json();
      if (res.ok) {
        alert(resData.message || 'Empresa eliminada con éxito');
        setSelectedCompanyForDelete(null);
        setDeleteConfirmInput('');
        fetchMasterStats();
      } else {
        alert(resData.error || 'Error al eliminar empresa');
      }
    } catch (err) {
      console.error('Error deleting company:', err);
      alert('Error al conectar con el servidor para eliminar la empresa');
    } finally {
      setDeletingCompany(false);
    }
  };

  const handleLogout = () => {
    logoutCompany();
    navigate('/');
  };

  // Filtered companies logic
  const filteredCompanies = (data.companies || []).filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (statusFilter === 'active') return c.status === 'active';
    if (statusFilter === 'moroso') return c.status === 'moroso' || c.status === 'disabled';
    if (statusFilter === 'freemium') return c.plan === 'freemium';
    if (statusFilter === 'pro') return c.plan === 'pro';
    return true;
  });

  const overview = data.overview || {};

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-slate-950 text-slate-100 font-sans p-6 md:p-10 space-y-8">
      
      {/* SuperAdmin Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <div className="flex items-center space-x-5">
          <div className="p-4 bg-gradient-to-tr from-primary-600 via-indigo-600 to-violet-600 rounded-3xl shadow-xl shadow-primary-500/20">
            <ShieldCheck className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Administrador Maestro</h1>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-xs rounded-full border border-amber-500/30 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SuperAdmin Platform</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium mt-0.5">Gestión Global de Empresas, Catálogos, Suscripciones y Clientes Morosos</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <img src={oleanderLogoWhite} alt="Oleander Software" className="h-[100px] w-auto max-w-[280px] object-contain opacity-100 drop-shadow-lg" />
          <button
            onClick={handleLogout}
            className="px-5 py-3 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold text-xs rounded-2xl border border-red-800/80 transition-all flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión SuperAdmin</span>
          </button>
        </div>
      </header>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Companies */}
        <div className="p-6 bg-slate-900/80 rounded-[2rem] border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block mb-1">Empresas Totales</span>
            <span className="text-3xl font-black text-white">{overview.totalCompanies || 0}</span>
            <span className="text-[11px] text-slate-500 font-bold block mt-1">Registradas en el SaaS</span>
          </div>
          <div className="p-4 bg-primary-500/10 text-primary-400 rounded-2xl border border-primary-500/20">
            <Building2 className="w-7 h-7" />
          </div>
        </div>

        {/* Active Companies */}
        <button 
          onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
          className={`p-6 rounded-[2rem] border shadow-xl flex items-center justify-between text-left transition-all ${
            statusFilter === 'active' 
              ? 'bg-emerald-950/80 border-emerald-500/50 ring-2 ring-emerald-500/30' 
              : 'bg-slate-900/80 border-slate-800 hover:border-emerald-900'
          }`}
        >
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 block mb-1">Empresas Activas</span>
            <span className="text-3xl font-black text-emerald-400">{overview.activeCompanies || 0}</span>
            <span className="text-[11px] text-emerald-300/80 font-bold block mt-1">Clic para filtrar activas</span>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <CheckCircle className="w-7 h-7" />
          </div>
        </button>

        {/* Moroso Companies */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'moroso' ? 'all' : 'moroso')}
          className={`p-6 rounded-[2rem] border text-left transition-all flex items-center justify-between shadow-xl ${
            statusFilter === 'moroso' 
              ? 'bg-rose-950/80 border-rose-500/50 ring-2 ring-rose-500/30' 
              : 'bg-slate-900/80 border-slate-800 hover:border-rose-900'
          }`}
        >
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-rose-400 block mb-1">Clientes Morosos / Suspendidos</span>
            <span className="text-3xl font-black text-rose-400">{overview.morosoCompanies || 0}</span>
            <span className="text-[11px] text-rose-300/80 font-bold block mt-1">Clic para filtrar cuentas suspendidas</span>
          </div>
          <div className="p-4 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
            <Ban className="w-7 h-7" />
          </div>
        </button>

        {/* Global Dishes Count */}
        <div className="p-6 bg-slate-900/80 rounded-[2rem] border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400 block mb-1">Platillos en Plataforma</span>
            <span className="text-3xl font-black text-indigo-400">{overview.totalDishes || 0}</span>
            <span className="text-[11px] text-slate-500 font-bold block mt-1">Total acumulado de empresas</span>
          </div>
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <Utensils className="w-7 h-7" />
          </div>
        </div>

      </div>

      {/* Main Companies Table Section */}
      <div className="bg-slate-900/80 rounded-[2.5rem] border border-slate-800 shadow-2xl p-6 md:p-8 space-y-6">
        
        {/* Controls: Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre de empresa o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-primary-500 text-white text-sm font-bold transition-all"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'active', label: '🟢 Activas' },
              { id: 'moroso', label: '🔴 Clientes Morosos' },
              { id: 'freemium', label: '⚡ Freemium' },
              { id: 'pro', label: '👑 PRO' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                  statusFilter === f.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
            
            <button
              onClick={fetchMasterStats}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
              title="Recargar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>

        {/* Table Container */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4">Empresa / Cliente</th>
                <th className="py-4 px-4">Catálogos & Registros</th>
                <th className="py-4 px-4">Plan & Vencimiento PRO</th>
                <th className="py-4 px-4">Estado Operativo</th>
                <th className="py-4 px-4 text-right">Acciones & Facturación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 font-bold">
                    No se encontraron empresas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map(c => {
                  const isMoroso = c.status === 'moroso' || c.status === 'disabled';
                  
                  // Calculate days remaining for PRO subscription
                  let daysLeft = null;
                  if (c.billing_due_date) {
                    const diffMs = new Date(c.billing_due_date).getTime() - new Date().getTime();
                    daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                  }

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                      
                      {/* Empresa */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          {c.logo ? (
                            <img src={c.logo} alt={c.name} className="w-10 h-10 object-contain rounded-xl bg-slate-950 p-1 border border-slate-800" />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-indigo-600 text-white font-black text-sm rounded-xl flex items-center justify-center shadow-sm">
                              {c.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="font-extrabold text-white text-base leading-tight">{c.name}</h4>
                            <p className="text-xs text-slate-400 font-mono">{c.email}</p>
                            <span className="text-[10px] text-slate-500 block">ID: #{c.id} • Alta: {new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>

                      {/* Catálogos */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2 text-xs font-bold">
                          <span className="px-2.5 py-1 bg-indigo-950/80 text-indigo-300 rounded-lg border border-indigo-800/60 flex items-center space-x-1">
                            <Utensils className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{c.dishes_count} platillos</span>
                          </span>
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                            🪑 {c.tables_count} mesas
                          </span>
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                            👥 {c.users_count} usuarios
                          </span>
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                            📋 {c.orders_count} órdenes
                          </span>
                        </div>
                      </td>

                      {/* Plan (Freemium vs PRO Toggle & Fast Renewal) */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePlanToggle(c.id, c.plan)}
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5 ${
                                c.plan === 'pro'
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-amber-500'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{c.plan === 'pro' ? '👑 PRO' : '⚡ Freemium'}</span>
                            </button>

                            {c.plan === 'pro' && (
                              <button
                                onClick={() => handleRenewCompany(c.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-xl shadow-md transition-all flex items-center space-x-1 active:scale-95"
                                title="Renovar +30 días adicionales de PRO"
                              >
                                <span>+1 Mes PRO</span>
                              </button>
                            )}
                          </div>

                          {/* Days Left Badge */}
                          {c.plan === 'pro' && (
                            <div className="text-[11px] font-bold">
                              {daysLeft !== null && daysLeft > 5 && (
                                <span className="text-emerald-400 flex items-center space-x-1">
                                  <span>🟢 Vence en {daysLeft} días</span>
                                </span>
                              )}
                              {daysLeft !== null && daysLeft > 0 && daysLeft <= 5 && (
                                <span className="text-amber-400 font-extrabold flex items-center space-x-1 animate-pulse">
                                  <span>⚠️ Vence en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}</span>
                                </span>
                              )}
                              {daysLeft !== null && daysLeft <= 0 && (
                                <span className="text-rose-400 font-black flex items-center space-x-1">
                                  <span>🔴 Vencida ({Math.abs(daysLeft)}d atrasada)</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Estado Selector (Activa vs Moroso) */}
                      <td className="py-4 px-4">
                        <select
                          value={c.status || 'active'}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-extrabold outline-none border transition-all cursor-pointer ${
                            isMoroso 
                              ? 'bg-rose-950 text-rose-300 border-rose-800 font-black' 
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800 font-black'
                          }`}
                        >
                          <option value="active">🟢 Activa (Permitido)</option>
                          <option value="moroso">🔴 Cliente Moroso (Bloqueado)</option>
                          <option value="disabled">⚪ Desactivada</option>
                        </select>
                      </td>

                      {/* Facturación / Notas */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex flex-col items-end space-y-2">
                          <button
                            onClick={() => {
                              setSelectedCompanyForPassword(c);
                              setNewPassword('');
                            }}
                            className="px-3.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/80 inline-flex items-center space-x-1.5 transition-all w-fit"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Reset Password</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCompany(c);
                              setBillingNotes(c.billing_notes || '');
                              setBillingDueDate(c.billing_due_date ? c.billing_due_date.split('T')[0] : '');
                            }}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 inline-flex items-center space-x-1.5 transition-all w-fit"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.billing_notes ? 'Editar Notas' : '+ Facturación'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCompanyForDelete(c);
                              setDeleteConfirmInput('');
                            }}
                            className="px-3.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/80 text-rose-400 hover:text-rose-200 text-xs font-extrabold rounded-xl border border-rose-800/60 inline-flex items-center space-x-1.5 transition-all w-fit active:scale-95"
                            title="Eliminar empresa permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Eliminar Empresa</span>
                          </button>
                        </div>
                        {c.billing_notes && (
                          <p className="text-[10px] text-amber-300/80 italic mt-1 line-clamp-1 max-w-[160px] ml-auto">
                            {c.billing_notes}
                          </p>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Billing & Debt Notes Modal */}
      <AnimatePresence>
        {selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 space-y-6 text-white"
            >
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                <FileText className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-xl font-black text-white">Facturación y Fecha de Cobro PRO</h3>
                  <p className="text-xs text-slate-400 font-bold">{selectedCompany.name} ({selectedCompany.email})</p>
                </div>
              </div>

              <form onSubmit={handleSaveBilling} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Fecha de Próximo Vencimiento / Cobro PRO
                  </label>
                  <input
                    type="date"
                    value={billingDueDate}
                    onChange={(e) => setBillingDueDate(e.target.value)}
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-amber-500 text-white text-sm font-bold transition-all"
                  />
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Esta fecha se usa para mostrar alertas preventivas al cliente cuando falten 5 días o menos.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Notas Internas de Deuda / Cobro
                  </label>
                  <textarea
                    rows="4"
                    value={billingNotes}
                    onChange={(e) => setBillingNotes(e.target.value)}
                    placeholder="ej. Factura de Julio pendiente de pago ($150 USD). Se acordó pago para el día 25."
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-amber-500 text-white text-sm font-bold transition-all custom-scrollbar"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCompany(null)}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingBilling}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md"
                  >
                    {savingBilling ? 'Guardando...' : 'Guardar Facturación'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {selectedCompanyForPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 space-y-6 text-white"
            >
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                <Key className="w-6 h-6 text-rose-400" />
                <div>
                  <h3 className="text-xl font-black text-white">Resetear Password</h3>
                  <p className="text-xs text-slate-400 font-bold">{selectedCompanyForPassword.name}</p>
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Escribe la nueva contraseña"
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-rose-500 text-white text-sm font-bold transition-all"
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCompanyForPassword(null)}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition-all shadow-md"
                  >
                    {savingPassword ? 'Guardando...' : 'Resetear'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Company Confirmation Modal */}
      <AnimatePresence>
        {selectedCompanyForDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-slate-900 border border-rose-900/60 rounded-[2.5rem] shadow-2xl p-8 space-y-6 text-white"
            >
              <div className="flex items-center space-x-3 border-b border-rose-900/40 pb-4">
                <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">¿Eliminar Empresa Permanentemente?</h3>
                  <p className="text-xs text-rose-300 font-bold">{selectedCompanyForDelete.name} (ID #{selectedCompanyForDelete.id})</p>
                </div>
              </div>

              <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl space-y-2 text-xs text-rose-200">
                <div className="flex items-center space-x-2 font-black text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>¡ACCION DEPURADORA IRREVERSIBLE!</span>
                </div>
                <p className="leading-relaxed">
                  Se eliminarán permanentemente <strong>todos los platillos ({selectedCompanyForDelete.dishes_count})</strong>, <strong>mesas ({selectedCompanyForDelete.tables_count})</strong>, <strong>usuarios ({selectedCompanyForDelete.users_count})</strong>, <strong>órdenes ({selectedCompanyForDelete.orders_count})</strong>, promociones, caja chica y datos fiscales de esta empresa.
                </p>
              </div>

              <form onSubmit={handleDeleteCompany} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Para confirmar la eliminación escribe <strong>"{selectedCompanyForDelete.name}"</strong>:
                  </label>
                  <input
                    type="text"
                    required
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    placeholder={selectedCompanyForDelete.name}
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-rose-500 text-white text-sm font-bold transition-all"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCompanyForDelete(null)}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={deletingCompany || deleteConfirmInput.trim().toLowerCase() !== selectedCompanyForDelete.name.trim().toLowerCase()}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl text-xs transition-all shadow-md flex items-center space-x-2 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deletingCompany ? 'Eliminando...' : 'Eliminar Empresa Definitivamente'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
