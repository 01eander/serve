import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, X, Check, Power } from 'lucide-react';
import ProUpgradeModal from '../../components/ProUpgradeModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCompany } from '../../contexts/CompanyContext';
import { API_BASE_URL } from '../../config/api';
import { compressImage } from '../../utils/imageCompressor';

export default function MenuCatalog() {
  const { t } = useLanguage();
  const { companyFetch } = useCompany();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState(null);
  const [canEdit, setCanEdit] = useState(true);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'categories'

  // Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({ name: '', price: '', category_id: '', image: '', active: true });
  
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', active: true });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const fetchFn = companyFetch || fetch;
      const res = await fetchFn(`${API_BASE_URL}/api/menu`);
      if (!res.ok) throw new Error('Error fetching menu');
      const data = await res.json();
      setCategories(data.categories);
      setItems(data.items);
      setCanEdit(data.canEdit !== false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Item Handlers ---
  const handleOpenItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({ name: item.name, price: item.price, category_id: item.category_id, image: item.image || '', active: item.active });
    } else {
      setEditingItem(null);
      setItemForm({ name: '', price: '', category_id: categories[0]?.id || '', image: '', active: true });
    }
    setShowItemModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompressing(true);
      try {
        const compressedBase64 = await compressImage(file, 600, 600, 0.75);
        setItemForm(prev => ({ ...prev, image: compressedBase64 }));
      } catch (err) {
        console.error('Error compressing image:', err);
        alert('No se pudo procesar la imagen seleccionada.');
      } finally {
        setCompressing(false);
      }
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (isSavingItem || compressing) return;
    setIsSavingItem(true);
    try {
      const url = editingItem ? `${API_BASE_URL}/api/menu/items/${editingItem.id}` : `${API_BASE_URL}/api/menu/items`;
      const method = editingItem ? 'PUT' : 'POST';
      const fetchFn = companyFetch || fetch;
      const res = await fetchFn(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemForm)
      });

      if (!res.ok) {
        const errData = await res.json();
        if (errData.isLimitReached) {
          setShowItemModal(false);
          setUpgradeReason(errData.error);
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(errData.error || 'Error saving item');
      }

      setShowItemModal(false);
      fetchMenu();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleToggleItemStatus = async (item) => {
    if (!confirm(`¿Estás seguro de ${item.active ? 'agotar' : 'activar'} ${item.name}?`)) return;
    try {
      await fetch(`${API_BASE_URL}/api/menu/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, active: !item.active })
      });
      fetchMenu();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Category Handlers ---
  const handleOpenCatModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ name: cat.name, description: cat.description || '', active: cat.active });
    } else {
      setEditingCat(null);
      setCatForm({ name: '', description: '', active: true });
    }
    setShowCatModal(true);
  };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    if (isSavingCat) return;
    setIsSavingCat(true);
    try {
      const url = editingCat ? `${API_BASE_URL}/api/menu/categories/${editingCat.id}` : `${API_BASE_URL}/api/menu/categories`;
      const method = editingCat ? 'PUT' : 'POST';
      const fetchFn = companyFetch || fetch;
      const res = await fetchFn(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catForm)
      });

      if (!res.ok) {
        const errData = await res.json();
        if (errData.isLimitReached) {
          setShowCatModal(false);
          setUpgradeReason(errData.error);
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(errData.error || 'Error saving category');
      }

      setShowCatModal(false);
      fetchMenu();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleToggleCatStatus = async (cat) => {
    if (!confirm(`¿Estás seguro de ${cat.active ? 'ocultar' : 'activar'} la categoría ${cat.name}?`)) return;
    try {
      await fetch(`${API_BASE_URL}/api/menu/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cat, active: !cat.active })
      });
      fetchMenu();
    } catch (err) {
      alert(err.message);
    }
  };


  if (loading) return <div className="p-8 flex items-center text-gray-500"><Loader2 className="animate-spin mr-2" /> {t('loading')}</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 md:p-8 relative h-full text-slate-800 dark:text-slate-100 transition-colors">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('menu_catalog')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('menu_catalog_desc')}</p>
        </div>
        <div>
          {canEdit && (
            activeTab === 'items' ? (
              <button onClick={() => handleOpenItemModal()} className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center shadow-md shadow-primary-500/20 text-sm">
                <Plus className="w-5 h-5 mr-2" /> {t('new_item')}
              </button>
            ) : (
              <button onClick={() => handleOpenCatModal()} className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center shadow-md shadow-primary-500/20 text-sm">
                <Plus className="w-5 h-5 mr-2" /> {t('new_category')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('items')}
          className={`pb-3 font-extrabold text-sm transition-colors border-b-2 ${
            activeTab === 'items' ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t('dishes')} ({items.length})
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`pb-3 font-extrabold text-sm transition-colors border-b-2 ${
            activeTab === 'categories' ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t('categories')} ({categories.length})
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto overflow-y-auto max-h-[58vh] sm:max-h-[68vh] custom-scrollbar">
        {activeTab === 'items' ? (
          <table className="w-full text-left min-w-[650px]">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-extrabold tracking-wider z-10">
              <tr>
                <th className="p-4 whitespace-nowrap">{t('product')}</th>
                <th className="p-4 whitespace-nowrap">{t('category')}</th>
                <th className="p-4 whitespace-nowrap">{t('price')}</th>
                <th className="p-4 whitespace-nowrap">{t('inventory_stock')}</th>
                <th className="p-4 whitespace-nowrap">{t('status')}</th>
                <th className="p-4 text-right whitespace-nowrap">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {items.map((item, idx) => {
                const mockStock = item.active ? (idx % 3 === 0 ? 5 : 24) : 0;
                return (
                  <tr key={item.id} className={`transition-colors ${item.active ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-slate-50/50 dark:bg-slate-900/40 opacity-60'}`}>
                    <td className="p-4 flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{item.category_name}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">${parseFloat(item.price).toFixed(2)}</td>
                    <td className="p-4">
                      {mockStock === 0 ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300">
                          {t('out_of_stock')} (0 unids)
                        </span>
                      ) : mockStock < 10 ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 animate-pulse">
                          ⚠️ {t('low_stock')} ({mockStock} unids)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                          ✓ {t('in_stock')} ({mockStock} unids)
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.active ? 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        {item.active ? t('available') : t('inactive')}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {canEdit ? (
                        <>
                          <button onClick={() => handleOpenItemModal(item)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleToggleItemStatus(item)} className={`p-2 rounded-lg transition-colors ${item.active ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40' : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40'}`}>
                            <Power className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">Sólo Lectura</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-extrabold tracking-wider">
              <tr>
                <th className="p-4">{t('id')}</th>
                <th className="p-4">{t('category')}</th>
                <th className="p-4">{t('description')}</th>
                <th className="p-4">{t('status')}</th>
                <th className="p-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {categories.map(cat => (
                <tr key={cat.id} className={`transition-colors ${cat.active ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-slate-50/50 dark:bg-slate-900/40 opacity-60'}`}>
                  <td className="p-4 font-medium text-slate-500 dark:text-slate-400">#{cat.id}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{cat.name}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{cat.description}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${cat.active ? 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      {cat.active ? t('active_f') : t('hidden')}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {canEdit ? (
                      <>
                        <button onClick={() => handleOpenCatModal(cat)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleToggleCatStatus(cat)} className={`p-2 rounded-lg transition-colors ${cat.active ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40' : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40'}`}>
                          <Power className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">Sólo Lectura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Item Form Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{editingItem ? t('edit_dish') : t('new_item')}</h3>
              <button onClick={() => setShowItemModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 space-y-4" autoComplete="off">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('product_name')}</label>
                <input type="text" required value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 text-slate-900 dark:text-white font-bold transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('price_usd')}</label>
                  <input type="number" step="0.01" required value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 text-slate-900 dark:text-white font-bold transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('category')}</label>
                  <select required value={itemForm.category_id} onChange={e => setItemForm({...itemForm, category_id: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 text-slate-900 dark:text-white font-bold transition-all">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Photo Upload Section */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('dish_photo')}</label>
                <div className="flex items-center space-x-3">
                  {itemForm.image ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-primary-500 flex-shrink-0">
                      <img src={itemForm.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setItemForm({ ...itemForm, image: '' })}
                        className="absolute top-0 right-0 bg-red-600 text-white p-0.5 rounded-bl-md shadow-md"
                        title="Remover foto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-transparent rounded-xl flex items-center justify-center text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 flex-shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-md active:scale-95 space-x-1.5">
                      {compressing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Optimizando...</span>
                        </>
                      ) : (
                        <span>{t('upload_photo')}</span>
                      )}
                      <input type="file" accept="image/*" disabled={compressing} onChange={handleImageUpload} className="hidden" />
                    </label>
                    <input
                      type="url"
                      placeholder={t('paste_image_url')}
                      value={itemForm.image?.startsWith('http') ? itemForm.image : ''}
                      onChange={e => setItemForm({ ...itemForm, image: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowItemModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{t('cancel')}</button>
                <button 
                  type="submit" 
                  disabled={isSavingItem || compressing}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 shadow-md shadow-primary-500/20 transition-colors flex items-center space-x-2"
                >
                  {isSavingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{t('save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{editingCat ? t('edit_category') : t('new_category')}</h3>
              <button onClick={() => setShowCatModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCat} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('category_name')}</label>
                <input type="text" required value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 text-slate-900 dark:text-white font-bold transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('description')}</label>
                <textarea value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 text-slate-900 dark:text-white font-bold transition-all h-24 resize-none" />
              </div>
              <div className="pt-4 border-t border-gray-100 mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowCatModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">{t('cancel')}</button>
                <button 
                  type="submit" 
                  disabled={isSavingCat}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 shadow-md shadow-primary-500/20 transition-colors flex items-center space-x-2"
                >
                  {isSavingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
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
