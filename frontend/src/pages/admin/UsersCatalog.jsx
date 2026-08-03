import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, Power, Eye, EyeOff, RotateCcw, KeyRound } from 'lucide-react';
import ProUpgradeModal from '../../components/ProUpgradeModal';
import { useLanguage } from '../../contexts/LanguageContext';

export default function UsersCatalog() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: 'mesero', pin: '', active: true });
  const [showPinText, setShowPinText] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/users');
      if (!res.ok) throw new Error('Error fetching users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    setShowPinText(false);
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, role: user.role, pin: user.pin, active: user.active });
    } else {
      setEditingUser(null);
      setFormData({ name: '', role: 'mesero', pin: '', active: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setShowPinText(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingUser ? `http://localhost:3000/api/users/${editingUser.id}` : 'http://localhost:3000/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
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
        throw new Error(errData.error || 'Error saving user');
      }
      
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    if (!confirm(`¿Estás seguro de ${user.active ? 'inactivar' : 'activar'} a ${user.name}?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, active: !user.active })
      });
      if (!res.ok) throw new Error('Error toggling status');
      fetchUsers();
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('staff_and_users')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('manage_staff_desc')}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center shadow-md shadow-primary-500/20 text-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> {t('new_user')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-extrabold tracking-wider">
            <tr>
              <th className="p-4">{t('id')}</th>
              <th className="p-4">{t('name')}</th>
              <th className="p-4">{t('role')}</th>
              <th className="p-4">{t('pin')}</th>
              <th className="p-4">{t('status')}</th>
              <th className="p-4 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {users.map(user => (
              <tr key={user.id} className={`transition-colors ${user.active ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-slate-50/50 dark:bg-slate-900/40 opacity-60'}`}>
                <td className="p-4 font-medium text-slate-500 dark:text-slate-400">#{user.id}</td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">{user.name}</td>
                <td className="p-4 capitalize text-slate-600 dark:text-slate-300 font-medium">{user.role}</td>
                <td className="p-4 font-mono text-slate-400">••••</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${user.active ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300'}`}>
                    {user.active ? t('active_m') : t('inactive_m')}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleOpenModal(user)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors" title="Editar">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleStatus(user)} className={`p-2 rounded-lg transition-colors ${user.active ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}`} title={user.active ? "Inactivar" : "Activar"}>
                    <Power className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">{t('no_users_registered')}</td>
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
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{editingUser ? t('edit_user') : t('new_user')}</h3>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4" autoComplete="off">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('full_name')}</label>
                <input 
                  type="text" 
                  name="new_user_name_catalog"
                  autoComplete="off"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 text-slate-900 dark:text-white font-bold transition-all"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('role')}</label>
                  <select 
                    name="new_user_role_catalog"
                    autoComplete="off"
                    required
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 text-slate-900 dark:text-white font-bold transition-all"
                  >
                    <option value="" disabled>{t('select_role', 'Seleccionar rol')}</option>
                    <option value="mesero">{t('waiter')}</option>
                    <option value="admin">{t('admin')}</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('pin_4_digits')}</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, pin: '1234' })}
                      className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                      title={t('reset_to_default_pin')}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{t('reset_to_default_pin')}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPinText ? 'text' : 'password'} 
                      name="new_user_pin_catalog"
                      autoComplete="new-password"
                      required
                      maxLength={4}
                      inputMode="numeric"
                      value={formData.pin}
                      onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
                      className="w-full p-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 text-slate-900 dark:text-white font-mono font-bold transition-all"
                      placeholder="••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPinText(!showPinText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      title={showPinText ? t('hide_pin') : t('show_pin')}
                    >
                      {showPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 flex justify-end space-x-3">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {t('cancel')}
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-colors flex items-center space-x-2">
                  <Check className="w-4 h-4" />
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
