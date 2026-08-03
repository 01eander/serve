import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  DollarSign, 
  Tag, 
  Settings, 
  Store, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles, 
  CheckCircle2,
  Compass
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCompany } from '../contexts/CompanyContext';

export default function OnboardingTourModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { company } = useCompany();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'catalogs',
      path: '/admin/catalogs',
      icon: Layers,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Básico',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      titleKey: 'onboarding_step_1_title',
      descKey: 'onboarding_step_1_desc',
      tip: '💡 Puedes estructurar primero las Categorías y luego añadir tus Platillos.'
    },
    {
      id: 'cash',
      path: '/admin/cash',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Caja',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      titleKey: 'onboarding_step_2_title',
      descKey: 'onboarding_step_2_desc',
      tip: '💵 Abre caja cada mañana con tu fondo inicial para un cuadre exacto al cerrar turno.'
    },
    {
      id: 'promotions',
      path: '/admin/promotions',
      icon: Tag,
      color: 'from-amber-500 to-orange-600',
      badge: '👑 Versión PRO',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      titleKey: 'onboarding_step_3_title',
      descKey: 'onboarding_step_3_desc',
      tip: '⚡ Con el plan PRO activa ofertas por día de la semana y descuentos automáticos.'
    },
    {
      id: 'settings',
      path: '/admin/settings',
      icon: Settings,
      color: 'from-purple-500 to-pink-600',
      badge: 'Identidad',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      titleKey: 'onboarding_step_4_title',
      descKey: 'onboarding_step_4_desc',
      tip: '⚙️ Configura la tasa de IVA predeterminada para que se aplique automáticamente a cada ticket.'
    },
    {
      id: 'pos',
      path: '/admin',
      icon: Store,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Punto de Venta',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
      titleKey: 'onboarding_step_5_title',
      descKey: 'onboarding_step_5_desc',
      tip: '🍽️ En el mapa de mesas los colores indican disponibilidad en tiempo real.'
    }
  ];

  // Synchronize route when step changes
  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      navigate(steps[currentStep].path);
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const activeStepObj = steps[currentStep];
  const IconComponent = activeStepObj.icon;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (company?.id) {
      localStorage.setItem(`onboarding_completed_${company.id}`, 'true');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-[2.5rem] shadow-2xl overflow-hidden text-white"
        >
          {/* Header Banner */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-500/20 border border-primary-400/30 rounded-2xl text-primary-400">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {t('onboarding_title')}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {t('onboarding_subtitle')}
                </p>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors"
              title={t('onboarding_skip')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Step Progress Pills */}
            <div className="flex items-center space-x-2">
              {steps.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'bg-gradient-to-r from-primary-500 to-indigo-500 w-full'
                      : idx < currentStep
                      ? 'bg-emerald-500'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  title={`Paso ${idx + 1}`}
                />
              ))}
            </div>

            {/* Active Card */}
            <motion.div
              key={activeStepObj.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="p-6 bg-slate-950/60 border border-slate-800 rounded-3xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-r ${activeStepObj.color} text-white shadow-lg`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                      Paso {currentStep + 1} de {steps.length}
                    </span>
                    <h4 className="text-lg font-black text-white">
                      {t(activeStepObj.titleKey)}
                    </h4>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-xl text-xs font-black border ${activeStepObj.badgeColor}`}>
                  {activeStepObj.badge}
                </span>
              </div>

              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                {t(activeStepObj.descKey)}
              </p>

              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-semibold text-amber-300 flex items-center space-x-2">
                <span>{activeStepObj.tip}</span>
              </div>
            </motion.div>

            {/* Action Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`px-5 py-3 rounded-2xl font-extrabold text-xs flex items-center space-x-1.5 transition-all ${
                  currentStep === 0
                    ? 'opacity-40 cursor-not-allowed text-slate-600 bg-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('onboarding_prev')}</span>
              </button>

              <button
                type="button"
                onClick={handleComplete}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors underline px-2"
              >
                {t('onboarding_skip')}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-primary-500/25 transition-all flex items-center space-x-2 active:scale-95"
              >
                <span>{isLastStep ? t('onboarding_finish') : t('onboarding_next')}</span>
                {isLastStep ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
