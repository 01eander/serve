import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react';
import ProUpgradeModal from '../../components/ProUpgradeModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCompany } from '../../contexts/CompanyContext';
import { API_BASE_URL } from '../../config/api';

export default function TablesCatalog() {
  const { t } = useLanguage();
  const { companyFetch } = useCompany();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({ table_number: '', capacity: 4, status: 'available' });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const fetchFn = companyFetch || fetch;
      const res = await fetchFn(`${API_BASE_URL}/api/tables`);
      if (!res.ok) throw new Error('Error fetching tables');
      const data = await res.json();
      setTables(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (table = null) => {
    if (table) {
      setEditingTable(table);
      setFormData({ table_number: table.table_number, capacity: table.capacity, status: table.status });
    } else {
      setEditingTable(null);
      setFormData({ table_number: '', capacity: 4, status: 'available' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTable(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const url = editingTable ? `${API_BASE_URL}/api/tables/${editingTable.id}` : `${API_BASE_URL}/api/tables`;
      const method = editingTable ? 'PUT' : 'POST';
      const fetchFn = companyFetch || fetch;
      
      const res = await fetchFn(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        if (errData.isLimitReached) {
          handleCloseModal();
          setUpgradeReason(errData.error);
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(errData.error || 'Error saving table');
      }
      
      handleCloseModal();
      fetchTables();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (table) => {
    if (!confirm(`${t('confirm_delete_table')} ${table.table_number}? ${t('confirm_delete_table_warning')}`)) return;
    try {
      const fetchFn = companyFetch || fetch;
      const res = await fetchFn(`${API_BASE_URL}/api/tables/${table.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error deleting table (posiblemente tiene órdenes históricas asociadas)');
      fetchTables();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 flex items-center text-gray-500"><Loader2 className="animate-spin mr-2" /> {t('loading')}</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 md:p-8 relative h-full text-slate-800 dark:text-slate-100 transition-colors">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('tables_catalog')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('manage_tables_desc')}</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center shadow-md shadow-primary-500/20 text-sm">
          <Plus className="w-5 h-5 mr-2" /> {t('new_table')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-extrabold tracking-wider">
            <tr>
              <th className="p-4">{t('id')}</th>
              <th className="p-4">{t('table_number')}</th>
              <th className="p-4">{t('capacity')}</th>
              <th className="p-4">{t('status')}</th>
              <th className="p-4 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {tables.map(table => (
              <tr key={table.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-medium text-slate-500 dark:text-slate-400">#{table.id}</td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">{t('table')} {table.table_number}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{table.capacity} {t('persons')}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    table.status === 'available' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 
                    table.status === 'occupied' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                  }`}>
                    {table.status === 'available' ? t('available') : table.status === 'occupied' ? t('occupied') : t('reserved')}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleOpenModal(table)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(table)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {tables.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">{t('no_tables_registered')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{editingTable ? t('edit_table') : t('new_table')}</h3>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4" autoComplete="off">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('table_number')}</label>
                  <input 
                    type="text" 
                    required
                    maxLength={100}
                    value={formData.table_number}
                    onChange={e => setFormData({...formData, table_number: e.target.value})}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 text-slate-900 dark:text-white font-bold transition-all"
                    placeholder="Ej. 12, Terraza 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('capacity_pax')}</label>
                  <input 
                    type="number" 
                    required min={1} max={50}
                    value={formData.capacity}
                    onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 1})}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 text-slate-900 dark:text-white font-bold transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('status')}</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 text-slate-900 dark:text-white font-bold transition-all"
                >
                  <option value="available">{t('available')}</option>
                  <option value="occupied">{t('occupied')}</option>
                  <option value="reserved">{t('reserved')}</option>
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('status_auto_update')}</p>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 flex justify-end space-x-3">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 shadow-md shadow-primary-500/20 transition-colors flex items-center space-x-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{t('save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pro Benefits Modal */}
      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerReason={upgradeReason}
      />
    </div>
  );
}
