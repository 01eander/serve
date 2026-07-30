import { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, MessageCircle, Mail, ShieldCheck, Zap, X, ChefHat, Tag, BarChart3, Image, Users, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompany } from '../contexts/CompanyContext';
import serveLogo from '../images/SERVE_Logo.png';

export default function ProUpgradeModal({ isOpen, onClose, triggerReason }) {
  const { company } = useCompany();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const companyName = company?.name || 'Mi Empresa';
  const whatsappMsg = encodeURIComponent(
    `¡Hola Oleander Software! 👋 Deseo actualizar mi empresa "${companyName}" (ID #${company?.id || ''}) a la versión 👑 PRO de Oleander Serve POS.`
  );
  const whatsappUrl = `https://wa.me/524427821011?text=${whatsappMsg}`;

  const benefits = [
    { icon: Utensils, title: 'Catálogos 100% Ilimitados', desc: 'Sin límites de 15 platillos, 5 mesas o 3 usuarios. Registra todo lo que tu restaurante necesite.' },
    { icon: ChefHat, title: 'Pantalla KDS de Cocina en Tiempo Real', desc: 'Gestiona comandas digitales con tiempos de espera para tus cocineros y chefs.' },
    { icon: Tag, title: 'Módulo de Descuentos & Ofertas', desc: 'Crea promociones, cupones y ofertas especiales para tus clientes.' },
    { icon: BarChart3, title: 'Analíticas Avanzadas & Rendimiento', desc: 'Revisa gráficas de tendencias de 7 días, productos estrella y ventas por mesero.' },
    { icon: Image, title: 'Personalización de Marca & Logo', desc: 'Sube tu propio logotipo, dirección y frase personalizada en los tickets de consumo.' },
    { icon: ShieldCheck, title: 'Soporte Prioritario & Actualizaciones', desc: 'Acceso a nuevas funciones exclusivas y atención preferencial.' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Banner */}
          <div className="p-8 pb-6 bg-gradient-to-r from-amber-500/20 via-indigo-600/20 to-purple-600/20 border-b border-slate-800 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <img src={serveLogo} alt="SERVE POS" className="h-12 w-auto object-contain drop-shadow-lg" />
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs rounded-full shadow-md flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PLAN 👑 PRO OLEANDER</span>
                </span>
                {triggerReason && (
                  <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800">
                    {triggerReason}
                  </span>
                )}
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Desbloquea el Potencial Ilimitado de tu Restaurante
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-medium mt-1">
              Actualiza a la versión <strong>👑 PRO</strong> para eliminar restricciones de catálogos y activar todas las herramientas avanzadas.
            </p>
          </div>

          {/* Body Content - Scrollable */}
          <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
            
            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Freemium Card */}
              <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-300">⚡ Versión Freemium</h4>
                    <span className="text-xs text-slate-500 font-medium">Gratis para siempre</span>
                  </div>
                  <span className="text-xs font-black bg-slate-800 px-2.5 py-1 rounded-lg text-slate-400">Actual</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-400 font-medium">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Hasta 15 Platillos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Hasta 5 Mesas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Hasta 3 Usuarios</span>
                  </li>
                  <li className="flex items-center space-x-2 text-slate-600">
                    <XCircle className="w-4 h-4 text-slate-600" />
                    <span className="line-through">Sin pantalla KDS Cocina</span>
                  </li>
                  <li className="flex items-center space-x-2 text-slate-600">
                    <XCircle className="w-4 h-4 text-slate-600" />
                    <span className="line-through">Sin módulo de Ofertas</span>
                  </li>
                </ul>
              </div>

              {/* PRO Card */}
              <div className="p-5 bg-gradient-to-br from-indigo-950/80 to-slate-900 rounded-2xl border-2 border-amber-500/50 shadow-xl space-y-3 relative">
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase">Recomendado</span>
                </div>
                <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3">
                  <div>
                    <h4 className="font-black text-sm text-amber-300">👑 Versión PRO</h4>
                    <span className="text-xs text-amber-400/80 font-bold">Todo Ilimitado</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-200 font-bold">
                  <li className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Platillos, Mesas y Usuarios Ilimitados</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Pantalla KDS Cocina en Tiempo Real</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Módulo de Descuentos & Promociones</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Logotipo & Dirección en Tickets</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Benefit Highlights */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Beneficios de la Versión PRO</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((b, idx) => {
                  const Icon = b.icon;
                  return (
                    <div key={idx} className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800/80 flex items-start space-x-3">
                      <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-white">{b.title}</h5>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{b.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact & Payment Action Box */}
            <div className="p-6 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 rounded-2xl border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400">¿Listo para activar PRO?</span>
                <h4 className="text-lg font-black text-white">Ponte en contacto para activar tu cuenta</h4>
                <p className="text-xs text-slate-300">Te responderemos al instante para habilitar la versión completa.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contactar por WhatsApp</span>
                </a>
                <a
                  href={`mailto:oleander@outlook.com?subject=Solicitud%20PRO%20${encodeURIComponent(companyName)}`}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Correo Ventas</span>
                </a>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 text-center bg-slate-950 text-[11px] text-slate-500 font-medium">
            Oleander Software • Plataforma SaaS de Gestión de Restaurantes
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
