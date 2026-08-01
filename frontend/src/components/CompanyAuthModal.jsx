import { useState } from 'react';
import { Building2, Mail, Lock, Sparkles, UserCheck, KeyRound, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../contexts/CompanyContext';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeLangToggles from './ThemeLangToggles';
import serveLogo from '../images/SERVE_Logo.png';
import oleanderLogoWhite from '../images/oleander_logo_white.png.png';

export default function CompanyAuthModal({ onAuthenticated }) {
  const { loginCompany } = useCompany();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/companies/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('error_login'));

      loginCompany(data.company);
      if (data.isMasterAdmin) {
        navigate('/master');
      } else if (onAuthenticated) {
        onAuthenticated(data.company);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/companies/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('error_register'));

      setSuccessInfo(data);
      loginCompany(data.company);
      if (onAuthenticated) onAuthenticated(data.company);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoginEmail('demo@oleander.com');
    setLoginPassword('admin123');
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/companies/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@oleander.com', password: 'admin123' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('error_login'));

      loginCompany(data.company);
      if (onAuthenticated) onAuthenticated(data.company);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center py-10 px-4 overflow-y-auto overflow-x-hidden font-sans transition-colors duration-300 bg-slate-950">
      
      {/* Dynamic Background Image with Overlay (Identical to LoginScreen) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop)' }}
      >
        <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm"></div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeLangToggles />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] shadow-2xl overflow-hidden text-white"
      >
        {/* Header Banner */}
        <div className="p-8 pb-6 text-center bg-gradient-to-b from-slate-800/80 to-transparent relative border-b border-slate-800/60">
          <img 
            src={serveLogo} 
            alt="SERVE POS" 
            className="h-20 w-auto object-contain mx-auto mb-3 drop-shadow-xl" 
          />
          <h2 className="text-2xl font-black tracking-tight text-white">{t('saas_auth_title')}</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">{t('saas_auth_subtitle')}</p>

          {/* Company Auth Tabs */}
          <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 mt-6">
            <button
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === 'login' 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('company_login')}
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === 'register' 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('company_register')}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold rounded-2xl animate-shake">
              ⚠️ {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">{t('company_email_user')}</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder={t('company_email_placeholder')}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl outline-none focus:border-primary-500 text-slate-900 text-sm font-bold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">{t('password')}</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder={t('password_placeholder')}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl outline-none focus:border-primary-500 text-slate-900 text-sm font-bold transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="text-amber-400 hover:text-amber-300 font-extrabold underline flex items-center space-x-1"
                >
                  <span>{t('try_demo_company')}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center space-x-2 text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{t('login_to_company')}</span>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">{t('restaurant_name')}</label>
                <div className="relative">
                  <Building2 className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder={t('restaurant_name_placeholder')}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl outline-none focus:border-primary-500 text-slate-900 text-sm font-bold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">{t('company_email')}</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder={t('company_email_new_placeholder')}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl outline-none focus:border-primary-500 text-slate-900 text-sm font-bold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">{t('password')}</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder={t('password_placeholder')}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl outline-none focus:border-primary-500 text-slate-900 text-sm font-bold transition-all"
                  />
                </div>
              </div>

              {/* Admin auto-creation notice */}
              <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl text-xs space-y-1">
                <div className="flex items-center space-x-2 text-amber-400 font-extrabold">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('initial_admin_user')}</span>
                </div>
                <p className="text-slate-300 font-medium" dangerouslySetInnerHTML={{ __html: t('initial_admin_desc') }} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{t('register_my_company')}</span>}
              </button>
            </form>
          )}

          {/* Footer Logo Enlarged 2.2x */}
          <div className="pt-4 border-t border-slate-800/60 flex items-center justify-center">
            <img src={oleanderLogoWhite} alt="Oleander Software" className="h-18 sm:h-20 w-auto max-w-xs object-contain opacity-90 hover:opacity-100 transition-all duration-300" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
