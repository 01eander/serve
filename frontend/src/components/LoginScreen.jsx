import { useState } from 'react';
import { User, Lock, ArrowRight, Building2, LogOut, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeLangToggles from './ThemeLangToggles';
import CompanyAuthModal from './CompanyAuthModal';
import InitialCurrencySetupModal from './InitialCurrencySetupModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCompany } from '../contexts/CompanyContext';
import serveLogo from '../images/SERVE_Logo.png';
import oleanderLogoBlack from '../images/oleander_logo_black.png.png';
import oleanderLogoWhite from '../images/oleander_logo_white.png.png';

export default function LoginScreen({ users, onLogin }) {
  const { company, logoutCompany } = useCompany();
  const [selectedWaiter, setSelectedWaiter] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();
  const { theme } = useTheme();

  const isDemoCompany = company?.email === 'demo@oleander.com' || company?.id === 1;

  // If no company is authenticated, render the SaaS Company Auth Modal
  if (!company) {
    return <CompanyAuthModal />;
  }

  // If company is authenticated but hasn't configured initial currency, require setup modal
  if (!company.currency_configured) {
    return <InitialCurrencySetupModal />;
  }

  const handlePinChange = (value) => {
    setPin(value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedWaiter && pin === selectedWaiter.pin) {
      onLogin(selectedWaiter);
    } else {
      setError(t('incorrect_pin'));
      setPin('');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center py-10 px-6 overflow-y-auto overflow-x-hidden bg-slate-900">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop)' }}
      >
        <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm"></div>
      </div>

      {/* Top Header Controls: Active Company Badge & Theme Toggles */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center space-x-3 bg-slate-900/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-800 text-white shadow-lg">
          {company?.logo ? (
            <img src={company.logo} alt={company.name} className="h-6 w-auto object-contain rounded" />
          ) : (
            <Building2 className="w-5 h-5 text-primary-400" />
          )}
          <span className="font-extrabold text-sm text-slate-100">{company.name}</span>
          
          {/* Company Plan Badge */}
          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-sm ${
            company?.plan === 'pro' 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-300/40' 
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}>
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{company?.plan === 'pro' ? '👑 PRO' : '⚡ Freemium'}</span>
          </span>

          <button
            onClick={logoutCompany}
            className="ml-2 px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 font-bold text-xs rounded-xl border border-red-800/60 transition-colors flex items-center space-x-1"
            title={t('change_company')}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('change_company')}</span>
          </button>
        </div>

        <div className="pointer-events-auto">
          <ThemeLangToggles />
        </div>
      </div>

      {/* Glassmorphic Main Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row overflow-hidden rounded-[1.75rem] sm:rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] max-h-[85vh] overflow-y-auto custom-scrollbar"
      >
        {/* Left Side: Users List & Demo Helper */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 flex flex-col justify-between bg-white/30 dark:bg-transparent">
          <div>
            <div className="mb-6 sm:mb-8 flex items-center space-x-4">
              <img 
                src={serveLogo} 
                alt="SERVE POS" 
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_4px_10px_rgba(99,102,241,0.3)] hover:scale-105 transition-transform duration-300 flex-shrink-0" 
              />
              <div className="h-8 w-[2px] bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent flex-shrink-0 rounded-full" />
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-extrabold tracking-tight leading-snug">
                {t('select_user')}
              </p>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3 sm:space-y-4 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar"
            >
              {users?.map((waiter) => (
                <motion.button
                  variants={itemVariants}
                  key={waiter.id}
                  onClick={() => { setSelectedWaiter(waiter); setPin(''); setError(''); }}
                  className={`w-full flex items-center p-3.5 sm:p-4 rounded-2xl transition-all duration-300 border ${
                    selectedWaiter?.id === waiter.id 
                      ? 'border-primary-500 bg-primary-500 shadow-lg shadow-primary-500/30' 
                      : 'border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 shadow-sm'
                  }`}
                >
                  <div className={`p-2.5 sm:p-3 rounded-full mr-3.5 sm:mr-4 transition-colors ${selectedWaiter?.id === waiter.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-black/30 text-slate-600 dark:text-slate-400'}`}>
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-bold text-base sm:text-lg ${selectedWaiter?.id === waiter.id ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{waiter.name}</h3>
                    <p className={`text-xs sm:text-sm capitalize ${selectedWaiter?.id === waiter.id ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400'}`}>{t(waiter.role === 'admin' ? 'admin' : 'waiter')}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right Side: PIN Entry */}
        <div className="w-full md:w-1/2 p-6 sm:p-12 flex flex-col justify-center relative bg-slate-50/50 dark:bg-black/20">
          <AnimatePresence mode="wait">
            {selectedWaiter ? (
              <motion.div 
                key="pin-entry"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex p-4 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full mb-4 shadow-sm border border-primary-200 dark:border-primary-800">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                    {t('welcome')}, {selectedWaiter.name.split(' ')[0]}
                  </h2>
                  <div className="mt-8">
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        style={{ WebkitTextSecurity: 'disc' }}
                        value={pin}
                        onChange={(e) => handlePinChange(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
                        placeholder="••••"
                        maxLength={4}
                        className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-200 dark:bg-black/40 dark:border-white/10 focus:border-primary-500 rounded-2xl text-3xl tracking-[1em] text-center font-black outline-none transition-all !text-slate-800 dark:!text-white shadow-inner"
                        autoFocus
                      />
                    </div>

                    {/* Demo PIN Tip below input */}
                    {isDemoCompany && selectedWaiter && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 text-center"
                      >
                        <button
                          type="button"
                          onClick={() => { setPin(selectedWaiter.pin); setError(''); }}
                          className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700/60 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('demo_pin_tip')} <strong className="font-mono font-black underline text-amber-700 dark:text-amber-300">{selectedWaiter.pin}</strong> {t('click_to_autocomplete')}</span>
                        </button>
                      </motion.div>
                    )}
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-red-500 dark:text-red-400 text-sm font-bold mt-3 text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                    <div className="flex space-x-4 mt-6">
                      <button
                        type="button"
                        onClick={() => { setSelectedWaiter(null); setPin(''); setError(''); }}
                        className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-colors shadow-sm"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all"
                      >
                        <span>{t('login')}</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-slate-400 dark:text-slate-500 flex flex-col items-center"
              >
                <div className="p-6 rounded-full bg-slate-200/50 dark:bg-black/20 mb-6 backdrop-blur-md">
                  <User className="w-16 h-16 opacity-50" />
                </div>
                <p className="text-lg font-medium">{t('select_user')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Oleander Software Brand Logo Centered Below Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex justify-center items-center mt-6"
      >
        <img 
          src={oleanderLogoWhite} 
          alt="Oleander Software" 
          className="h-20 sm:h-32 w-auto max-w-sm sm:max-w-md object-contain mix-blend-screen drop-shadow-2xl transition-all duration-300"
        />
      </motion.div>
    </div>
  );
}
