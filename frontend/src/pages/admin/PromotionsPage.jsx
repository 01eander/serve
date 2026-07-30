import { useState, useEffect } from 'react';
import { Tag, Plus, Pencil, Trash2, Calendar, Clock, Sparkles, Check, X, Power, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCompany } from '../../contexts/CompanyContext';
import ProUpgradeModal from '../../components/ProUpgradeModal';

export default function PromotionsPage() {
  const { formatCurrency } = useCurrency();
  const { company } = useCompany();
  const isFreemium = company?.plan !== 'pro';
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({
    name: '',
    target_type: 'category', // 'category' | 'item'
    target_id: '',
    discount_type: 'percent', // 'percent' | 'fixed_price'
    discount_value: '',
    start_date: '',
    end_date: '',
    happy_hour_start: '',
    happy_hour_end: '',
    active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promoRes, menuRes] = await Promise.all([
        fetch('http://localhost:3000/api/promotions'),
        fetch('http://localhost:3000/api/menu')
      ]);
      if (promoRes.ok) setPromotions(await promoRes.json());
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setCategories(menuData.categories || []);
        setItems(menuData.items || []);
      }
    } catch (err) {
      console.error('Error fetching promotions data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setPromoForm({
        name: promo.name,
        target_type: promo.target_type,
        target_id: promo.target_id || '',
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        start_date: promo.start_date ? promo.start_date.split('T')[0] : '',
        end_date: promo.end_date ? promo.end_date.split('T')[0] : '',
        happy_hour_start: promo.happy_hour_start || '',
        happy_hour_end: promo.happy_hour_end || '',
        active: promo.active
      });
    } else {
      setEditingPromo(null);
      setPromoForm({
        name: '',
        target_type: 'category',
        target_id: categories[0]?.id || '',
        discount_type: 'percent',
        discount_value: '10',
        start_date: '',
        end_date: '',
        happy_hour_start: '',
        happy_hour_end: '',
        active: true
      });
    }
    setShowModal(true);
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    try {
      const url = editingPromo 
        ? `http://localhost:3000/api/promotions/${editingPromo.id}` 
        : 'http://localhost:3000/api/promotions';
      const method = editingPromo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoForm)
      });

      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Error al guardar la promoción');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTogglePromoStatus = async (promo) => {
    try {
      await fetch(`http://localhost:3000/api/promotions/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !promo.active })
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePromo = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta campaña de descuento?')) return;
    try {
      await fetch(`http://localhost:3000/api/promotions/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-slate-500 min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mr-3" />
        <span className="font-bold">Cargando ofertas y promociones...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
      
      {/* PRO Lockout Overlay for Freemium */}
      {isFreemium && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border-2 border-amber-500/50 p-8 rounded-[2.5rem] shadow-2xl space-y-6 text-white">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
              <Tag className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-xs rounded-full border border-amber-500/30 inline-flex items-center space-x-1 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MÓDULO EXCLUSIVO 👑 PRO</span>
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white">Descuentos & Ofertas Especiales</h2>
              <p className="text-xs text-slate-300 font-medium mt-2 leading-relaxed">
                La creación de campañas de descuentos, cupones y Happy Hour forma parte del plan <strong>👑 PRO</strong> de Oleander Serve.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black rounded-2xl shadow-xl shadow-amber-500/25 transition-all text-sm flex items-center justify-center space-x-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ver Beneficios & Solicitar Versión PRO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-md">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Descuentos por Temporada</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Crea ofertas especiales, Happy Hours y precios promocionales para tus clientes</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-primary-500/25 transition-all flex items-center justify-center space-x-2 text-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Campaña Promocional</span>
        </button>
      </div>

      {/* Grid of Promotions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => {
          const isPercent = promo.discount_type === 'percent';

          return (
            <motion.div
              key={promo.id}
              whileHover={{ y: -4 }}
              className={`p-6 rounded-[2rem] border-2 bg-white dark:bg-slate-900 shadow-sm transition-all relative overflow-hidden flex flex-col justify-between ${
                promo.active 
                  ? 'border-amber-400/60 dark:border-amber-500/30' 
                  : 'border-slate-200 dark:border-slate-800 opacity-70'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 ${
                  promo.active 
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{promo.active ? 'Activa Ahora' : 'Pausada'}</span>
                </span>

                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleOpenModal(promo)}
                    className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleTogglePromoStatus(promo)}
                    className={`p-2 rounded-xl transition-colors ${promo.active ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}`}
                    title={promo.active ? 'Pausar campaña' : 'Activar campaña'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeletePromo(promo.id)}
                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Discount */}
              <div className="space-y-3 mb-6">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight">{promo.name}</h3>

                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-amber-500 dark:text-amber-400">
                    {isPercent ? `${parseFloat(promo.discount_value)}% OFF` : formatCurrency(promo.discount_value)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {promo.target_type === 'category' ? `en la categoría ${promo.target_name || ''}` : `en ${promo.target_name || ''}`}
                  </span>
                </div>
              </div>

              {/* Timeframe Info */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {promo.start_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Vigencia: {new Date(promo.start_date).toLocaleDateString()} {promo.end_date ? `- ${new Date(promo.end_date).toLocaleDateString()}` : ''}</span>
                  </div>
                )}
                {promo.happy_hour_start && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Happy Hour: {promo.happy_hour_start} - {promo.happy_hour_end}</span>
                  </div>
                )}
                {!promo.start_date && !promo.happy_hour_start && (
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Check className="w-4 h-4" />
                    <span>Aplica siempre mientras esté activa</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-black text-xl text-slate-900 dark:text-white">
                {editingPromo ? 'Editar Campaña Promocional' : 'Nueva Campaña Promocional'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre de la Oferta / Campaña
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Happy Hour Verano, 20% OFF Postres..."
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-amber-500 font-bold text-slate-800 dark:text-white transition-all"
                />
              </div>

              {/* Target Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Aplicar A:
                  </label>
                  <select
                    value={promoForm.target_type}
                    onChange={(e) => {
                      const type = e.target.value;
                      const defaultId = type === 'category' ? categories[0]?.id : items[0]?.id;
                      setPromoForm({ ...promoForm, target_type: type, target_id: defaultId || '' });
                    }}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-amber-500 font-bold text-slate-800 dark:text-white transition-all"
                  >
                    <option value="category">Categoría Completa</option>
                    <option value="item">Platillo Específico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Selección:
                  </label>
                  <select
                    required
                    value={promoForm.target_id}
                    onChange={(e) => setPromoForm({ ...promoForm, target_id: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-amber-500 font-bold text-slate-800 dark:text-white transition-all"
                  >
                    {promoForm.target_type === 'category' ? (
                      categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                    ) : (
                      items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)
                    )}
                  </select>
                </div>
              </div>

              {/* Discount Value & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tipo de Rebaja:
                  </label>
                  <select
                    value={promoForm.discount_type}
                    onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-amber-500 font-bold text-slate-800 dark:text-white transition-all"
                  >
                    <option value="percent">Porcentaje (% OFF)</option>
                    <option value="fixed_price">Precio Fijo Especial ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    {promoForm.discount_type === 'percent' ? 'Porcentaje %' : 'Nuevo Precio $'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={promoForm.discount_value}
                    onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-amber-500 font-black text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>

              {/* Timeframe Optional */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Vigencia (Opcional)</span>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      value={promoForm.start_date}
                      onChange={(e) => setPromoForm({ ...promoForm, start_date: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Fecha Fin</label>
                    <input
                      type="date"
                      value={promoForm.end_date}
                      onChange={(e) => setPromoForm({ ...promoForm, end_date: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Happy Hour Desde</label>
                    <input
                      type="time"
                      value={promoForm.happy_hour_start}
                      onChange={(e) => setPromoForm({ ...promoForm, happy_hour_start: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Happy Hour Hasta</label>
                    <input
                      type="time"
                      value={promoForm.happy_hour_end}
                      onChange={(e) => setPromoForm({ ...promoForm, happy_hour_end: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-extrabold text-white bg-amber-500 hover:bg-amber-400 shadow-md transition-all flex items-center space-x-2 text-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Promoción</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Pro Benefits Modal */}
      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerReason="Módulo Exclusivo 👑 PRO"
      />
    </div>
  );
}
