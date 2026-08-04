import { useState, useEffect } from 'react';
import { Settings, Globe, DollarSign, Percent, Check, Sparkles, Building2, Upload, Image, Save, Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency, CURRENCIES } from '../../contexts/CurrencyContext';
import { useCompany } from '../../contexts/CompanyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ProUpgradeModal from '../../components/ProUpgradeModal';
import smallLogo from '../../images/small_LOGO.png';
import FranchiseSection from './FranchiseSection';

import { compressImage } from '../../utils/imageCompressor';

export default function SettingsPage() {
  const { t } = useLanguage();
  const { company, updateCompanyConfig } = useCompany();
  const { currencyCode, activeCurrency, changeCurrency, taxRate, updateTaxRate, formatCurrency } = useCurrency();

  const isFreemium = company?.plan !== 'pro';
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [companyName, setCompanyName] = useState(company?.name || '');
  const [companyLogo, setCompanyLogo] = useState(company?.logo || '');
  const [companyAddress, setCompanyAddress] = useState(company?.address || '');
  const [ticketFooterPhrase, setTicketFooterPhrase] = useState(company?.ticket_footer_phrase || '');
  const [selectedCurrency, setSelectedCurrency] = useState(company?.currency || currencyCode || 'USD');
  const [customTax, setCustomTax] = useState(company?.tax_rate?.toString() || taxRate.toString());
  const [defaultLanguage, setDefaultLanguage] = useState(company?.default_language || 'es');
  
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (company) {
      setCompanyName(company.name || '');
      setCompanyLogo(company.logo || '');
      setCompanyAddress(company.address || '');
      setTicketFooterPhrase(company.ticket_footer_phrase || '');
      setSelectedCurrency(company.currency || 'USD');
      setCustomTax((company.tax_rate !== undefined ? company.tax_rate : 16).toString());
      setDefaultLanguage(company.default_language || 'es');
    }
  }, [company]);

  const handleLogoFileUpload = async (e) => {
    if (isFreemium) {
      setShowUpgradeModal(true);
      return;
    }
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 600, 600, 0.75);
        setCompanyLogo(compressedBase64);
      } catch (err) {
        console.error('Error compressing logo:', err);
        alert('No se pudo procesar el logo seleccionado.');
      }
    }
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const taxNum = parseFloat(customTax) || 0;
      await updateCompanyConfig({
        name: companyName.trim(),
        logo: isFreemium ? '' : companyLogo,
        address: isFreemium ? '' : companyAddress.trim(),
        ticket_footer_phrase: isFreemium ? '' : ticketFooterPhrase.trim(),
        currency: selectedCurrency,
        tax_rate: taxNum,
        default_language: defaultLanguage
      });
      changeCurrency(selectedCurrency);
      updateTaxRate(taxNum);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerReason={t('pro_custom_brand')}
      />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl shadow-md border border-slate-700/50">
              <img src={smallLogo} alt="Serve Icon" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('settings')}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('settings_desc')}</p>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm rounded-2xl border border-emerald-300 dark:border-emerald-700 flex items-center space-x-2 shadow-sm"
          >
            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('settings_saved')}</span>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        
        {/* Section 1: Company Identity & Logo Customization */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <Building2 className="w-6 h-6 text-primary-500" />
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('company_identity')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('company_identity_desc')}</p>
              </div>
            </div>
            {isFreemium && (
              <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs rounded-full border border-amber-500/30 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>{t('pro_custom_brand')}</span>
              </span>
            )}
          </div>

          {/* Freemium PRO Lock Notice */}
          {isFreemium && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-800 dark:text-amber-300">
              <div className="flex items-center space-x-2.5">
                <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-xs font-bold leading-tight" dangerouslySetInnerHTML={{__html: t('pro_custom_brand_desc')}}></p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs rounded-xl shadow-md transition-all whitespace-nowrap flex items-center space-x-1 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('upgrade_to_pro')}</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {t('company_name_label')}
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl outline-none focus:border-primary-500 text-slate-900 dark:text-white font-bold text-sm transition-all"
                  placeholder="ej. Taquería El Pastor"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('company_address_label')}
                  </label>
                  {isFreemium && <span className="text-[10px] font-black text-amber-500 uppercase">{t('freemium_locked')}</span>}
                </div>
                <input
                  type="text"
                  disabled={isFreemium}
                  value={isFreemium ? '' : companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className={`w-full px-4 py-3.5 rounded-2xl outline-none text-sm font-bold transition-all ${
                    isFreemium 
                      ? 'bg-slate-200/60 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-800' 
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500'
                  }`}
                  placeholder={isFreemium ? t('require_pro_address') : "ej. Av. Insurgentes Sur 1234, CDMX"}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('ticket_footer_label')}
                  </label>
                  {isFreemium && <span className="text-[10px] font-black text-amber-500 uppercase">{t('freemium_locked')}</span>}
                </div>
                <input
                  type="text"
                  disabled={isFreemium}
                  value={isFreemium ? '' : ticketFooterPhrase}
                  onChange={(e) => setTicketFooterPhrase(e.target.value)}
                  className={`w-full px-4 py-3.5 rounded-2xl outline-none text-sm font-bold transition-all ${
                    isFreemium 
                      ? 'bg-slate-200/60 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-800' 
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500'
                  }`}
                  placeholder={isFreemium ? t('require_pro_ticket') : "ej. ¡Gracias por su preferencia!"}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('company_logo_label')}
                  </label>
                  {isFreemium && <span className="text-[10px] font-black text-amber-500 uppercase">{t('freemium_locked')}</span>}
                </div>
                
                {/* File Upload Button */}
                <div className="flex items-center space-x-3 mb-3">
                  <label className={`px-4 py-3 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 ${
                    isFreemium 
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-primary-600 hover:bg-primary-500 text-white cursor-pointer'
                  }`}>
                    <Upload className="w-4 h-4" />
                    <span>{t('upload_image_file')}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isFreemium}
                      onChange={handleLogoFileUpload} 
                      className="hidden" 
                    />
                  </label>
                  {companyLogo && !isFreemium && (
                    <button
                      type="button"
                      onClick={() => setCompanyLogo('')}
                      className="px-3 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                    >
                      {t('remove_logo')}
                    </button>
                  )}
                </div>

                {/* Direct Link or Base64 input */}
                <input
                  type="text"
                  disabled={isFreemium}
                  value={isFreemium ? '' : companyLogo}
                  onChange={(e) => setCompanyLogo(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl outline-none font-mono text-xs transition-all ${
                    isFreemium 
                      ? 'bg-slate-200/60 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-800' 
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500'
                  }`}
                  placeholder={isFreemium ? t('require_pro_url') : t('paste_logo_url')}
                />
              </div>
            </div>

            {/* Live Logo Preview Box */}
            <div className="p-6 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center min-h-[200px]">
              <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                {t('logo_preview')}
              </span>
              
              {companyLogo ? (
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 max-w-xs flex flex-col items-center">
                  <img 
                    src={companyLogo} 
                    alt="Logo Empresa" 
                    className="max-h-24 w-auto object-contain rounded-lg" 
                  />
                  <span className="text-[11px] font-bold text-slate-500 mt-2">{companyName || t('your_company')}</span>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                  <Image className="w-12 h-12 opacity-30 mb-2" />
                  <p className="text-xs font-bold">{t('no_logo_uploaded')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t('no_logo_desc')}</p>
                </div>
              )}
            </div>

          </div>
          
          {/* Default Language Setting */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('default_language', 'Idioma Predeterminado de la Empresa')}</label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('default_language_desc', 'Idioma base para todos los usuarios de la empresa al iniciar sesión')}</p>
            <select 
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value)}
              className="w-full md:w-1/2 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 text-slate-900 dark:text-white font-bold transition-all shadow-sm"
            >
              <option value="es">Español (MX)</option>
              <option value="en">English (US)</option>
              <option value="pt">Português (BR)</option>
            </select>
          </div>
        </div>

        {/* Section 2: Regional Currency & Tax Selection */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Globe className="w-6 h-6 text-indigo-500" />
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('currency_and_taxes')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('currency_and_taxes_desc')}</p>
            </div>
          </div>

          {/* Currency Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CURRENCIES.map((curr) => {
              const isSelected = curr.code === selectedCurrency;

              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    setSelectedCurrency(curr.code);
                    setCustomTax(curr.defaultTax.toString());
                  }}
                  className={`p-5 rounded-[1.75rem] border-2 text-left transition-all flex items-center justify-between shadow-sm ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-slate-800/80 ring-4 ring-primary-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{curr.flag}</span>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{curr.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{curr.code} • {t('symbol')}: <span className="text-primary-600 dark:text-primary-400 font-black">{curr.symbol}</span></p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tax Rate Input */}
          <div className="pt-4 max-w-md">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {t('tax_rate_label')}
            </label>
            <div className="relative">
              <Percent className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={customTax}
                onChange={(e) => setCustomTax(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl outline-none focus:border-amber-500 text-slate-900 dark:text-white font-black text-base transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-primary-500/25 transition-all flex items-center space-x-2 text-base active:scale-95"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{t('save_company_config')}</span>
          </button>
        </div>

      </form>

      {/* Section 3: Franchise Management (PRO only) */}
      <FranchiseSection />

    </div>
  );
}
