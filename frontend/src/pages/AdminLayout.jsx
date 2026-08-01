import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UtensilsCrossed, Grid2X2, Settings, Store, Tag, Layers, Building2, Sparkles, Zap, DollarSign, Receipt as ReceiptIcon, FileText } from 'lucide-react';
import ThemeLangToggles from '../components/ThemeLangToggles';
import ProUpgradeModal from '../components/ProUpgradeModal';
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm z-10 transition-colors">
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
                onClick={() => setShowUpgradeModal(true)}
                className="w-full p-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4 animate-bounce" />
                <span>👑 {t('view_pro_benefits')}</span>
              </button>
            )}

            <ThemeLangToggles />
            <Link to="/" className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors p-2 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
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
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
          <Outlet />
        </main>
      </div>

      {/* Pro Benefits Modal */}
      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
