import { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Receipt, RefreshCw, CreditCard, Banknote, Edit3, X, AlertCircle, Crown } from 'lucide-react';
import ProUpgradeModal from '../../components/ProUpgradeModal';
import { API_BASE_URL } from '../../config/api';

export default function OrdersHistory() {
  const { company } = useCompany();
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [editingOrder, setEditingOrder] = useState(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState('cash');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Freemium states
  const [showProModal, setShowProModal] = useState(false);
  const isFreemium = company?.plan !== 'pro';

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/orders/history`, {
        headers: { 'x-company-id': company?.id || '1' }
      });
      if (!res.ok) throw new Error('Error al obtener el historial de cuentas');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [company]);

  const handleEditClick = (order) => {
    if (isFreemium) {
      setShowProModal(true);
      return;
    }
    setEditingOrder(order);
    setNewPaymentMethod(order.payment_method === 'cash' ? 'card' : 'cash');
    setModalError(null);
  };

  const handleSaveMethod = async () => {
    if (!editingOrder) return;
    
    setActionLoading(true);
    setModalError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${editingOrder.id}/payment-method`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-company-id': company?.id || '1'
        },
        body: JSON.stringify({ payment_method: newPaymentMethod })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar el método de pago');
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === editingOrder.id ? { ...o, payment_method: newPaymentMethod } : o));
      setEditingOrder(null);
    } catch (err) {
      console.error(err);
      setModalError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="text-primary-500" /> Historial de Cuentas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Visualiza las cuentas cobradas y corrige el método de pago si es necesario.
          </p>
        </div>
        <button onClick={fetchHistory} className="p-2 bg-white dark:bg-slate-800 shadow-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
          <RefreshCw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex gap-2 items-center text-sm font-medium border border-red-100">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Cargando historial...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No hay cuentas cobradas recientemente.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Orden / Mesa</th>
                  <th className="px-6 py-3">Hora de Cobro</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Propina</th>
                  <th className="px-6 py-3">Método de Pago</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">Mesa {order.table_number || order.table_id}</div>
                      <div className="text-xs text-slate-500">#{String(order.id).slice(0,8)}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {new Date(order.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {formatCurrency(order.tip_amount || 0)}
                    </td>
                    <td className="px-6 py-4">
                      {order.payment_method === 'cash' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                          <Banknote className="w-3.5 h-3.5" /> Efectivo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100 dark:border-blue-800">
                          <CreditCard className="w-3.5 h-3.5" /> Tarjeta
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEditClick(order)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        {isFreemium ? <Crown className="w-4 h-4 text-amber-500" /> : <Edit3 className="w-4 h-4" />} Corregir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Payment Method Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Cambiar Método de Pago</h3>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Selecciona el método de pago correcto para la <strong>Mesa {editingOrder.table_number || editingOrder.table_id}</strong>.
              </p>

              {modalError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg flex gap-2 text-xs font-medium border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {modalError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setNewPaymentMethod('cash')}
                  className={`py-3 px-4 rounded-xl flex flex-col items-center gap-2 border-2 transition-all ${
                    newPaymentMethod === 'cash' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/50'
                  }`}
                >
                  <Banknote className="w-6 h-6" />
                  <span className="font-bold text-sm">Efectivo</span>
                </button>
                <button
                  onClick={() => setNewPaymentMethod('card')}
                  className={`py-3 px-4 rounded-xl flex flex-col items-center gap-2 border-2 transition-all ${
                    newPaymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="font-bold text-sm">Tarjeta</span>
                </button>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-medium">
                Nota: Al guardar este cambio, el balance de la caja de efectivo se actualizará automáticamente.
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setEditingOrder(null)} 
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveMethod} 
                disabled={actionLoading || newPaymentMethod === editingOrder.payment_method} 
                className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Guardando...' : 'Guardar Cambio'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProUpgradeModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
        triggerReason="Corrección de Método de Pago" 
      />
    </div>
  );
}
