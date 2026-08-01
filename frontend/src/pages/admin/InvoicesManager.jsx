import { useState, useEffect } from 'react';
import { FileText, Search, Filter, AlertCircle, CheckCircle2, Clock, FileWarning, ExternalLink, Download } from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ProUpgradeModal from '../../components/ProUpgradeModal';

export default function InvoicesManager() {
  const { company } = useCompany();
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Freemium states
  const [showProModal, setShowProModal] = useState(false);
  const isFreemium = company?.plan !== 'pro';

  useEffect(() => {
    if (!isFreemium && company?.id) {
      fetchInvoices();
    } else {
      setLoading(false);
    }
  }, [company?.id, isFreemium]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/invoices', {
        headers: {
          'x-company-id': company.id
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar facturas');
      setInvoices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isFreemium) {
    return (
      <div className="p-8 max-w-5xl mx-auto h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-amber-500/20 rotate-3">
          <FileText className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">{t('invoicing_auto')}</h2>
        <p className="text-slate-500 max-w-md mb-8 text-lg font-medium leading-relaxed">
          {t('invoicing_promo')} <strong>PRO</strong>.
        </p>
        <button
          onClick={() => setShowProModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-2xl flex items-center space-x-2 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20"
        >
          <span>{t('discover_pro')}</span>
        </button>

        <ProUpgradeModal 
          isOpen={showProModal} 
          onClose={() => setShowProModal(false)} 
          triggerReason="Módulo de Facturación"
        />
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'generated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" /> Timbrada
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-3.5 h-3.5" /> Pendiente
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-100">
            <FileWarning className="w-3.5 h-3.5" /> Error SAT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('invoicing_electronic')}</h1>
          <p className="text-slate-500 font-medium">{t('invoicing_desc')}</p>
        </div>
        
        <div className="flex space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={t('search_rfc')} 
              className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
          </div>
          <button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{t('filter')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800">Error al cargar datos</h4>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">ID Factura</th>
                  <th className="px-6 py-4">Fecha Solicitud</th>
                  <th className="px-6 py-4">Datos Fiscales</th>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Monto</th>
                  <th className="px-6 py-4">Estatus</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No hay solicitudes de factura registradas.
                    </td>
                  </tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">FAC-{String(inv.id).padStart(4, '0')}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {new Date(inv.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 truncate max-w-[200px]">{inv.razon_social}</div>
                        <div className="text-xs text-slate-500 uppercase">{inv.rfc}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded-md text-xs">
                          #{String(inv.order_id).slice(0,8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
