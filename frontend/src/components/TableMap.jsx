import { Users, LogOut, ChefHat, Clock, Building2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useCompany } from '../contexts/CompanyContext';
import ThemeLangToggles from './ThemeLangToggles';
import serveLogo from '../images/SERVE_Logo.png';
import oleanderLogoBlack from '../images/oleander_logo_black.png.png';
import oleanderLogoWhite from '../images/oleander_logo_white.png.png';
import smallLogo from '../images/small_LOGO.png';
import table2pax from '../images/table_2pax.png';
import table4pax from '../images/table_4pax.png';
import table6pax from '../images/table_6pax.png';
import { useLanguage } from '../contexts/LanguageContext';

export default function TableMap({ tables, onSelectTable, onLogout, waiterName }) {
  const { theme } = useTheme();
  const { company } = useCompany();
  const { t } = useLanguage();

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-white dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-emerald-100 dark:hover:shadow-emerald-950 text-emerald-800 dark:text-emerald-300';
      case 'occupied': return 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-300 dark:border-orange-500/40 hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-orange-100 dark:hover:shadow-orange-950 text-orange-800 dark:text-orange-300';
      case 'reserved': return 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-500/40 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-blue-100 dark:hover:shadow-blue-950 text-blue-800 dark:text-blue-300';
      default: return 'bg-white dark:bg-slate-800/80';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return t('available');
      case 'occupied': return t('occupied');
      case 'reserved': return t('reserved');
      default: return '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 15 } }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-8 py-3 sm:py-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 z-10 gap-3">
        <div className="flex items-center space-x-3 sm:space-x-4 max-w-full">
          <img src={smallLogo} alt="Serve" className="h-9 sm:h-12 w-auto object-contain drop-shadow-md shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight shrink-0">{t('table_map')}</h1>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-[11px] sm:text-xs rounded-full border border-slate-300 dark:border-slate-700 flex items-center space-x-1.5 shadow-sm max-w-full truncate">
                <img src={smallLogo} alt="Logo" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
                <span className="truncate">{company?.name || 'Mi Empresa'}</span>
                <span className={`inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] font-black shrink-0 ${
                  company?.plan === 'pro' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{company?.plan === 'pro' ? '👑 PRO' : '⚡ Freemium'}</span>
                </span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">{t('select_table_prompt')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-4 max-w-full">
          <ThemeLangToggles />
          <Link
            to="/kitchen"
            className="flex items-center space-x-1 sm:space-x-2 text-orange-700 dark:text-orange-300 transition-colors bg-orange-100 hover:bg-orange-200 dark:bg-orange-950/60 dark:hover:bg-orange-900/60 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm border border-orange-300 dark:border-orange-700 shadow-sm shrink-0"
          >
            <ChefHat className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            <span>{t('kitchen')}</span>
          </Link>
          <div className="flex items-center space-x-1.5 sm:space-x-3 bg-slate-200/70 dark:bg-slate-800 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-inner max-w-[140px] sm:max-w-none truncate shrink-0">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{waiterName}</span>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center space-x-1 sm:space-x-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors bg-red-100 hover:bg-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm shrink-0 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {/* Legend */}
          <div className="flex flex-wrap gap-2.5 sm:gap-6 mb-4 sm:mb-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 inline-flex max-w-full">
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded bg-white dark:bg-emerald-950 border-2 border-emerald-400 dark:border-emerald-500"></div>
              <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold">{t('available')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded bg-orange-100 dark:bg-orange-950 border-2 border-orange-400 dark:border-orange-500"></div>
              <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold">{t('occupied')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded bg-blue-100 dark:bg-blue-950 border-2 border-blue-400 dark:border-blue-500"></div>
              <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold">{t('reserved')}</span>
            </div>
          </div>

          {/* Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6"
          >
            {tables.map(table => (
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                key={table.id}
                onClick={() => onSelectTable(table.id)}
                className={`
                  relative flex flex-col items-center justify-center p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-2 shadow-sm backdrop-blur-md transition-colors duration-300 overflow-hidden
                  ${getStatusColor(table.status)}
                `}
              >
                <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 mix-blend-luminosity dark:mix-blend-screen pointer-events-none flex items-center justify-center pointer-events-none">
                  <img 
                    src={table.capacity <= 2 ? table2pax : table.capacity <= 4 ? table4pax : table6pax} 
                    alt="Table Type" 
                    className="w-[120%] h-[120%] object-cover object-center"
                  />
                </div>
                
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                  <span className={`text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-inner ${
                    table.status === 'available' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' :
                    table.status === 'occupied' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300' :
                    'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300'
                  }`}>
                    {getStatusLabel(table.status)}
                  </span>
                </div>
                
                <Users className={`relative z-10 w-6 h-6 sm:w-8 sm:h-8 mb-1.5 sm:mb-2 opacity-50 ${
                  table.status === 'available' ? 'text-emerald-600 dark:text-emerald-400' :
                  table.status === 'occupied' ? 'text-orange-600 dark:text-orange-400' :
                  'text-blue-600 dark:text-blue-400'
                }`} />
                
                <div className="relative z-10 flex flex-col items-center justify-center my-1 drop-shadow-sm w-full text-center px-1">
                  <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-slate-800/80 dark:text-slate-300 uppercase">{t('table_short')}</span>
                  <h3 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white leading-tight mt-0.5 break-words max-w-full">
                    {table.table_number || table.number || table.id}
                  </h3>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 mt-1 sm:mt-2">
                    {table.capacity} Pax
                  </span>
                </div>
                
                {table.status === 'occupied' && (
                  <div className="flex items-center space-x-1 mt-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-700 shadow-sm">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{table.elapsedMinutes ? `${table.elapsedMinutes} min` : t('occupied')}</span>
                  </div>
                )}
                
                {table.status === 'occupied' && table.orderTotal > 0 && (
                  <div className="flex flex-col items-center gap-1 mt-1.5">
                    <span className="text-sm font-bold opacity-90 bg-white/80 dark:bg-black/40 px-4 py-1 rounded-full text-orange-800 dark:text-orange-300 shadow-sm border border-orange-200 dark:border-orange-500/30">
                      ${table.orderTotal.toFixed(2)}
                    </span>
                    {table.waiterName && (
                      <span className="text-[10px] font-black uppercase text-orange-700/80 dark:text-orange-400/80 tracking-wider text-center">
                        por {table.waiterName.split(' ')[0]}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Active Company Logo Aligned Bottom Right */}
      <div className="fixed bottom-4 right-6 z-30 pointer-events-none opacity-90 hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-lg flex items-center space-x-2">
        {company?.logo ? (
          <img 
            src={company.logo} 
            alt={company.name} 
            className="h-9 sm:h-11 w-auto max-w-[150px] object-contain rounded-md"
          />
        ) : (
          <img 
            src={theme === 'dark' ? oleanderLogoWhite : oleanderLogoBlack} 
            alt="Oleander Software" 
            className="h-8 sm:h-10 w-auto object-contain drop-shadow-md"
          />
        )}
        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 pr-1">{company?.name}</span>
      </div>
    </div>
  );
}
