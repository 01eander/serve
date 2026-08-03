import { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { useCurrency } from '../../contexts/CurrencyContext'; // Or wherever formatCurrency is
import { DollarSign, PlusCircle, MinusCircle, Lock, RefreshCw, AlertCircle, ArrowUpCircle, ArrowDownCircle, CheckCircle, Crown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { API_BASE_URL } from '../../config/api';
import ProUpgradeModal from '../../components/ProUpgradeModal';

export default function CashManagement() {
  const { company } = useCompany();
  const [session, setSession] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [initialBalance, setInitialBalance] = useState('');

  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState('deposit'); // 'deposit' or 'withdrawal'
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [finalBalance, setFinalBalance] = useState('');

  // Freemium states
  const [showProModal, setShowProModal] = useState(false);
  const isFreemium = company?.plan !== 'pro';

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/cash/current`, {
        headers: { 'x-company-id': company?.id || '1' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch cash session');

      if (data.session) {
        setSession(data.session);
        setTransactions(data.transactions || []);
      } else {
        setSession(null);
        setTransactions([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [company]);

  const handleOpenCash = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/cash/open`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-company-id': company?.id || '1'
        },
        body: JSON.stringify({ initial_balance: parseFloat(initialBalance) || 0 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al abrir caja');
      
      setShowOpenModal(false);
      setInitialBalance('');
      fetchSession();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/cash/transaction`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-company-id': company?.id || '1'
        },
        body: JSON.stringify({ 
          type: txType, 
          amount: parseFloat(txAmount), 
          description: txDescription 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar transacción');
      
      setShowTxModal(false);
      setTxAmount('');
      setTxDescription('');
      fetchSession();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseCash = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/cash/close`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-company-id': company?.id || '1'
        },
        body: JSON.stringify({ final_balance: parseFloat(finalBalance) || 0 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cerrar caja');
      
      setShowCloseModal(false);
      setFinalBalance('');
      fetchSession();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  // Define a simple format function if CurrencyContext doesn't provide one
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="text-emerald-500" /> Control de Caja (Efectivo)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gestiona el fondo de caja, depósitos y retiros.
          </p>
        </div>
        <button onClick={fetchSession} className="p-2 bg-white dark:bg-slate-800 shadow-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
          <RefreshCw className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex gap-2 items-center text-sm font-medium border border-red-100">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {!session ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">La caja está cerrada</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Para empezar a cobrar en efectivo o registrar movimientos, necesitas abrir la caja con un fondo inicial.
          </p>
          <button
            onClick={() => setShowOpenModal(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 mx-auto"
          >
            <DollarSign className="w-5 h-5" /> Abrir Caja
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
              <p className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Saldo Actual Esperado</p>
              <h2 className="text-4xl font-black text-emerald-900 dark:text-emerald-300">
                {formatMoney(session.current_balance)}
              </h2>
              <div className="text-xs text-emerald-600 dark:text-emerald-500 mt-2 font-medium">
                Fondo inicial: {formatMoney(session.initial_balance)}
              </div>
            </div>

            <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center gap-4">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (isFreemium) {
                      setShowProModal(true);
                      return;
                    }
                    setTxType('deposit'); 
                    setShowTxModal(true); 
                  }}
                  className="flex-1 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-blue-200"
                >
                  {isFreemium ? <Crown className="w-5 h-5 text-amber-500" /> : <ArrowUpCircle className="w-5 h-5" />} Ingreso (Depósito)
                </button>
                <button
                  onClick={() => {
                    if (isFreemium) {
                      setShowProModal(true);
                      return;
                    }
                    setTxType('withdrawal'); 
                    setShowTxModal(true); 
                  }}
                  className="flex-1 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-orange-200"
                >
                  {isFreemium ? <Crown className="w-5 h-5 text-amber-500" /> : <ArrowDownCircle className="w-5 h-5" />} Retiro
                </button>
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <CheckCircle className="w-5 h-5" /> Cerrar Caja
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">Movimientos de la Sesión</h3>
            </div>
            
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No hay movimientos registrados.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Hora</th>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Descripción</th>
                      <th className="px-6 py-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {new Date(tx.created_at).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4">
                          {tx.type === 'payment' && <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">Pago Orden</span>}
                          {tx.type === 'deposit' && <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold">Ingreso</span>}
                          {tx.type === 'withdrawal' && <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-bold">Retiro</span>}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-200">
                          {tx.description}
                          {tx.order_id && <span className="ml-2 text-xs text-slate-400">(Orden #{tx.order_id})</span>}
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${tx.type === 'withdrawal' ? 'text-red-500' : 'text-emerald-600'}`}>
                          {tx.type === 'withdrawal' ? '-' : '+'}{formatMoney(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Open Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Abrir Caja</h3>
            <form onSubmit={handleOpenCash}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto Inicial (Fondo)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={initialBalance}
                  onChange={e => setInitialBalance(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Ej. 500"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowOpenModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50">Abrir</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
              {txType === 'deposit' ? 'Registrar Ingreso' : 'Registrar Retiro'}
            </h3>
            <form onSubmit={handleAddTransaction}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={txAmount}
                  onChange={e => setTxAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Ej. 100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo / Descripción</label>
                <input
                  type="text"
                  required
                  value={txDescription}
                  onChange={e => setTxDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder={txType === 'deposit' ? 'Fondo extra del patrón' : 'Compra de hielo'}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowTxModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="flex-1 py-2 bg-primary-600 text-white font-bold rounded-xl disabled:opacity-50">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Cerrar Caja</h3>
            <p className="text-sm text-slate-500 mb-4">El sistema espera que haya <strong>{formatMoney(session?.current_balance)}</strong> en caja. Ingresa el monto real contado.</p>
            <form onSubmit={handleCloseCash}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto Real (Contado)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={finalBalance}
                  onChange={e => setFinalBalance(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ej. 1700"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowCloseModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl disabled:opacity-50">Cerrar Caja</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ProUpgradeModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
        triggerReason="Control Avanzado de Caja Chica" 
      />
    </div>
  );
}
