import { useState, useEffect } from 'react';
import { Building2, Plus, Save, Shield, Lock, Loader2, Sparkles, Building } from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ProUpgradeModal from '../../components/ProUpgradeModal';
import { API_BASE_URL } from '../../config/api';

export default function FranchiseSection() {
  const { t } = useLanguage();
  const { company, loginCompany, companyFetch } = useCompany();
  const isFreemium = company?.plan !== 'pro';

  const [isFranchiseParent, setIsFranchiseParent] = useState(company?.is_franchise_parent || false);
  const [allowChildMenuEdit, setAllowChildMenuEdit] = useState(company?.allow_child_menu_edit !== false);
  const [branches, setBranches] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // New Branch Form
  const [showNewBranchForm, setShowNewBranchForm] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchEmail, setNewBranchEmail] = useState('');
  const [newBranchPassword, setNewBranchPassword] = useState('');
  const [creatingBranch, setCreatingBranch] = useState(false);

  useEffect(() => {
    if (isFranchiseParent) {
      fetchBranches();
    }
  }, [isFranchiseParent]);

  const fetchBranches = async () => {
    try {
      const res = await companyFetch(`${API_BASE_URL}/api/companies/${company.id}/branches`);
      if (res.ok) {
        const data = await res.json();
        setBranches(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const handleEnableFranchise = async () => {
    if (isFreemium) {
      setShowUpgradeModal(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/companies/${company.id}/franchise/enable`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        loginCompany(data.company); // Update local context
        setIsFranchiseParent(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Error enabling franchise mode');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMenuPermission = async () => {
    const newValue = !allowChildMenuEdit;
    setAllowChildMenuEdit(newValue);
    try {
      const res = await fetch(`${API_BASE_URL}/api/companies/${company.id}/franchise/menu-permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allow_child_menu_edit: newValue })
      });
      if (res.ok) {
        const data = await res.json();
        loginCompany(data.company);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    setCreatingBranch(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/companies/${company.id}/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBranchName,
          email: newBranchEmail,
          password: newBranchPassword
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setBranches([...branches, data.company]);
        setShowNewBranchForm(false);
        setNewBranchName('');
        setNewBranchEmail('');
        setNewBranchPassword('');
      } else {
        alert(data.error || 'Error creating branch');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setCreatingBranch(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 mt-8">
      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerReason="El Módulo de Franquicias"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Módulo de Franquicia (HQ)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gestiona tus sucursales y permisos centralizados</p>
          </div>
        </div>
        
        {isFreemium && (
          <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs rounded-full border border-amber-500/30 flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5" />
            <span>EXCLUSIVO PRO</span>
          </span>
        )}
      </div>

      {!isFranchiseParent ? (
        <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center">
          <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <h4 className="text-lg font-black text-slate-700 dark:text-slate-200 mb-2">¿Tienes múltiples sucursales?</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Convierte esta cuenta en el "Corporativo (HQ)". Podrás agregar sucursales, ver gráficas globales en tiempo real y decidir si las sucursales pueden editar su propio menú o si quieres forzar un menú global.
          </p>
          <button
            onClick={handleEnableFranchise}
            disabled={loading}
            className={`px-6 py-3.5 rounded-xl font-black shadow-md flex items-center space-x-2 transition-all active:scale-95 ${
              isFreemium
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isFreemium ? (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Actualizar a PRO para habilitar</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Habilitar Modo Franquicia</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Permissions Toggle */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-primary-500" />
                Control de Menú
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Si está apagado, las sucursales solo podrán ver y vender el menú que tú configures aquí en el corporativo.
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={allowChildMenuEdit}
                onChange={handleToggleMenuPermission}
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              <span className="ml-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                {allowChildMenuEdit ? 'Sucursales pueden editar menú' : 'Menú Global Estricto'}
              </span>
            </label>
          </div>

          {/* Branches List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-slate-800 dark:text-slate-100 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-indigo-500" />
                Tus Sucursales ({branches.length})
              </h4>
              <button
                onClick={() => setShowNewBranchForm(!showNewBranchForm)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm flex items-center space-x-1 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Sucursal</span>
              </button>
            </div>

            {showNewBranchForm && (
              <form onSubmit={handleCreateBranch} className="mb-6 p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h5 className="font-extrabold text-sm mb-3">Nueva Sucursal</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Nombre (ej. Pollo Feliz Sur)"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl outline-none focus:border-primary-500 text-sm font-bold !text-slate-900 dark:!text-white"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Correo de login"
                    value={newBranchEmail}
                    onChange={(e) => setNewBranchEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl outline-none focus:border-primary-500 text-sm font-bold !text-slate-900 dark:!text-white"
                  />
                  <input
                    type="password"
                    required
                    placeholder="Contraseña"
                    value={newBranchPassword}
                    onChange={(e) => setNewBranchPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl outline-none focus:border-primary-500 text-sm font-bold !text-slate-900 dark:!text-white"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewBranchForm(false)}
                    className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingBranch}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm flex items-center space-x-2"
                  >
                    {creatingBranch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Guardar Sucursal</span>
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.length === 0 ? (
                <div className="col-span-full p-6 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                  Aún no tienes sucursales registradas.
                </div>
              ) : (
                branches.map(branch => (
                  <div key={branch.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                      <h5 className="font-black text-slate-900 dark:text-white text-lg">{branch.name}</h5>
                      <p className="text-xs text-slate-500">{branch.email}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                      Activa
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
