import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeLangToggles from './ThemeLangToggles';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import oleanderLogoBlack from '../images/oleander_logo_black.png.png';
import oleanderLogoWhite from '../images/oleander_logo_white.png.png';

// Helper to get a random placeholder image based on category if none exists
const getPlaceholderImage = (categoryName, productId) => {
  const categories = {
    'Bebidas': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80',
    'Desayunos': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&q=80',
    'Platos Fuertes': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80',
    'Postres': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80',
    'Entradas': 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=500&q=80',
  };
  // Fallback abstract food image
  const defaultImage = `https://images.unsplash.com/photo-1495195134817-a1a28078aca9?w=500&q=80&sig=${productId}`;
  
  return categories[categoryName] || defaultImage;
};

export default function MenuArea({ categories, menuItems, onAddToOrder, onBackToMap, tableNumber }) {
  const [activeCategory, setActiveCategory] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [promotions, setPromotions] = useState([]);
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const { theme } = useTheme();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/promotions`)
      .then(res => res.json())
      .then(data => setPromotions(data.filter(p => p.active)))
      .catch(err => console.error('Error fetching promotions in POS:', err));
  }, []);
  
  const filteredProducts = menuItems?.filter(p => {
    const matchesCategory = p.category_id === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return searchQuery ? matchesSearch : matchesCategory;
  });

  const activeCategoryName = categories?.find(c => c.id === activeCategory)?.name || '';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="flex-1 flex flex-col lg:flex-row h-full bg-slate-100 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      
      {/* Narrow Sidebar (Desktop Only) */}
      <div className="hidden lg:flex w-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col items-center py-6 shadow-sm z-20">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBackToMap}
          className="p-3 bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl mb-8 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-inner"
          title={t('back_to_pos')}
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        
        <div className="flex-1 flex flex-col space-y-6 mt-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-[0_4px_12px_rgba(124,58,237,0.3)] border border-primary-400">
            {t('table_short').charAt(0)}{tableNumber}
          </div>
        </div>

        <div className="mt-auto flex justify-center w-full pb-4">
           <div className="transform -rotate-90 origin-center mb-16">
             <ThemeLangToggles />
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-8 py-3 sm:py-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm z-10 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="flex items-center justify-between sm:justify-start space-x-3">
            {/* Mobile Back Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onBackToMap}
              className="lg:hidden p-2.5 bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              title={t('back_to_pos')}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{t('menu_catalog')}</h1>
                <span className="lg:hidden bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 text-xs font-black px-2.5 py-0.5 rounded-lg border border-primary-200 dark:border-primary-700">
                  {t('table')} {tableNumber}
                </span>
              </div>
              <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{t('table')} {tableNumber}</p>
            </div>

            {/* Theme & Language Toggles */}
            <div className="ml-auto">
              <ThemeLangToggles />
            </div>
          </div>
          
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-full px-4 py-2.5 sm:px-5 sm:py-3 w-full sm:w-1/3 max-w-md border border-slate-200 dark:border-slate-700 shadow-inner focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2 sm:mr-3 flex-shrink-0" />
            <input 
              type="text" 
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </header>

        {/* Categories Bar */}
        <div className="px-4 sm:px-8 py-3 sm:py-4 flex space-x-2 sm:space-x-3 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
          {categories?.map(cat => {
            const isActive = activeCategory === cat.id && !searchQuery;
            return (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                className={`whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30' 
                    : 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {cat.name}
              </motion.button>
            )
          })}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar relative">
          {filteredProducts?.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500"
            >
              <div className="p-6 rounded-full bg-slate-200/50 dark:bg-slate-800/50 mb-4 backdrop-blur-md">
                <Search className="w-12 h-12 opacity-50" />
              </div>
              <span className="font-bold text-lg">No se encontraron productos</span>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              key={activeCategory + searchQuery} // Re-trigger animation on category change
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 pb-24 lg:pb-20"
            >
              {filteredProducts?.map(product => {
                const imageUrl = product.image || getPlaceholderImage(activeCategoryName, product.id);

                // Check for applicable active promotion
                const promo = promotions.find(p => 
                  (p.target_type === 'item' && Number(p.target_id) === Number(product.id)) ||
                  (p.target_type === 'category' && Number(p.target_id) === Number(product.category_id))
                );

                let finalPrice = Number(product.price);
                let promoBadge = null;

                if (promo) {
                  if (promo.discount_type === 'percent') {
                    finalPrice = finalPrice * (1 - Number(promo.discount_value) / 100);
                    promoBadge = `🔥 PROMO ${parseFloat(promo.discount_value)}% OFF`;
                  } else if (promo.discount_type === 'fixed_price') {
                    finalPrice = Number(promo.discount_value);
                    promoBadge = `⭐ OFERTA`;
                  }
                }

                const productWithPromo = { ...product, price: finalPrice };

                return (
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={product.id}
                    onClick={() => onAddToOrder(productWithPromo)}
                    className="bg-white dark:bg-slate-900 backdrop-blur-md rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200 dark:border-slate-800 flex flex-col group relative"
                  >
                    <div className="h-40 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                      <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Promo Badge */}
                      {promoBadge && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[11px] px-3 py-1 rounded-xl shadow-md flex items-center space-x-1 animate-bounce">
                          <Sparkles className="w-3 h-3" />
                          <span>{promoBadge}</span>
                        </div>
                      )}

                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-black shadow-sm border border-slate-200 dark:border-white/20 flex items-center">
                        {promo ? (
                          <>
                            <span className="line-through text-xs text-slate-400 dark:text-slate-500 mr-2 font-bold">{formatCurrency(product.price)}</span>
                            <span className="text-amber-600 dark:text-amber-400 font-black">{formatCurrency(finalPrice)}</span>
                          </>
                        ) : (
                          <span className="text-slate-800 dark:text-white font-black">{formatCurrency(product.price)}</span>
                        )}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between relative">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{product.name}</h3>
                      <div className="flex items-center justify-end mt-auto">
                        <span className="text-xs font-extrabold text-white bg-primary-500 group-hover:bg-primary-600 px-4 py-2 rounded-xl shadow-md transition-colors">
                          + Añadir
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Company Logo Aligned Bottom Right */}
      <div className="fixed bottom-4 right-6 z-30 pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
        <img 
          src={theme === 'dark' ? oleanderLogoWhite : oleanderLogoBlack} 
          alt="Oleander Software" 
          className="h-7 sm:h-9 w-auto object-contain drop-shadow-md"
        />
      </div>
    </main>
  );
}
