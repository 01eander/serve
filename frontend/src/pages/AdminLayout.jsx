import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UtensilsCrossed, Grid2X2, Settings, Store, Tag, Layers, Building2, Sparkles, Zap, DollarSign, Receipt as ReceiptIcon, FileText, Compass, Menu, X } from 'lucide-react';
import ThemeLangToggles from '../components/ThemeLangToggles';
import ProUpgradeModal from '../components/ProUpgradeModal';
import OnboardingTourModal from '../components/OnboardingTourModal';
import SubscriptionAlertBanner from '../components/SubscriptionAlertBanner';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCompany } from '../contexts/CompanyContext';
import oleanderLogoBlack from '../images/oleander_logo_black.png.png';
import oleanderLogoWhite from '../images/oleander_logo_white.png.png';
import smallLogo from '../images/small_LOGO.png';

export default function AdminLayout() {
  const location = useLocation();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { company } = useCompany();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showOnboardingTour, setShowOnboardingTour] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (company?.id) {
      const isCompleted = localStorage.getItem(`onboarding_completed_${company.id}`);
      if (!isCompleted) {
        setShowOnboardingTour(true);
      }
    }
  }, [company?.id]);

  const isFreemium = company?.plan !== 'pro';

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/admin/cash', icon: DollarSign, label: t('sidebar_cash') },
    { path: '/admin/orders', icon: ReceiptIcon, label: t('sidebar_orders') },
    { path: '/admin/invoices', icon: FileText, label: t('sidebar_invoicing') },
    { path: '/admin/catalogs', icon: Layers, label: t('catalogs') },
    { path: '/admin/promotions', icon: Tag, label: t('promotions_offers') },
    { path: '/admin/settings', icon: Settings, label: t('settings') },
  ];

  if (company?.is_franchise_parent) {
    navItems.splice(1, 0, { path: '/admin/hq', icon: Building2, label: t('franchise_hq') });
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100 transition-colors">
      
      {/* Top Automated Monthly Subscription Alert Banner */}
      <SubscriptionAlertBanner />

      {/* Mobile Top Header Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-20 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-1.5 rounded-lg border border-slate-700/50 shadow-sm">
              <img src={smallLogo} alt="Serve Icon" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Admin Portal</h1>
              <span className="text-[10px] text-primary-600 dark:text-primary-400 font-extrabold block truncate max-w-[120px]">
                {company?.name || 'Oleander Serve'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm ${
            company?.plan === 'pro' 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            <Sparkles className="w-2.5 h-2.5 mr-1" />
            <span>{company?.plan === 'pro' ? 'PRO' : 'FREE'}</span>
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay Backdrop */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden transition-opacity"
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed md:relative inset-y-0 left-0 z-40 w-72 md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl md:shadow-sm transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900 dark:bg-slate-950 text-white p-2 rounded-xl border border-slate-700/50 shadow-md">
                <img src={smallLogo} alt="Serve Icon" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Admin Portal</h1>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-xs text-primary-600 dark:text-primary-400 font-extrabold truncate max-w-[100px]">
                    {company?.name || 'Oleander Serve'}
                  </span>
                  <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-black shadow-sm ${
                    company?.plan === 'pro' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    <span>{company?.plan === 'pro' ? 'PRO' : 'FREE'}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-3">{t('management')}</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all font-medium ${
                    isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-bold' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
            
            {/* Upgrade PRO Banner for Freemium Companies */}
            {isFreemium && (
              <button
                onClick={() => { setShowUpgradeModal(true); setMobileMenuOpen(false); }}
                className="w-full p-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4 animate-bounce" />
                <span>👑 {t('view_pro_benefits')}</span>
              </button>
            )}

            {/* Restart Virtual Tour Button */}
            <button
              onClick={() => { setShowOnboardingTour(true); setMobileMenuOpen(false); }}
              className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800/60 transition-all flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t('onboarding_restart')}</span>
            </button>

            <ThemeLangToggles />
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors p-2 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
              <Store className="w-4 h-4" />
              <span>{t('back_to_pos')}</span>
            </Link>
            
            {/* Active Company Logo Aligned at Bottom Container */}
            <div className="pt-3 flex flex-col items-center justify-center border-t border-gray-100 dark:border-gray-700/60 space-y-1">
              {company?.logo ? (
                <img 
                  src={company.logo} 
                  alt={company.name} 
                  className="h-14 w-auto max-w-[85%] object-contain opacity-95 hover:opacity-100 transition-all duration-300"
                />
              ) : (
                <img 
                  src={theme === 'dark' ? oleanderLogoWhite : oleanderLogoBlack} 
                  alt="Oleander Software" 
                  className="h-14 w-auto max-w-[90%] object-contain opacity-90 hover:opacity-100 transition-all duration-300"
                />
              )}
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">{company?.name}</span>
                <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[8px] font-black ${
                  company?.plan === 'pro' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {company?.plan === 'pro' ? '👑 PRO' : '⚡ FREEMIUM'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50 w-full min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Pro Benefits Modal */}
      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Onboarding Interactive Tour Modal */}
      <OnboardingTourModal
        isOpen={showOnboardingTour}
        onClose={() => setShowOnboardingTour(false)}
      />
    </div>
  );
}
