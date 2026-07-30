import { useState } from 'react';
import { AlertTriangle, AlertCircle, Sparkles, MessageCircle, Calendar, X } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';

export default function SubscriptionAlertBanner() {
  const { company } = useCompany();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !company || company.plan !== 'pro' || !company.billing_due_date) {
    return null;
  }

  const dueDate = new Date(company.billing_due_date);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Only show alert if 5 days or fewer remain
  if (daysRemaining > 5) {
    return null;
  }

  const formattedDueDate = dueDate.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
  const companyName = company.name || 'Mi Empresa';

  const isExpired = daysRemaining <= 0;
  const whatsappMsg = encodeURIComponent(
    `¡Hola Oleander Software! 👋 Adjunto comprobante de pago mensual de la suscripción 👑 PRO de mi empresa "${companyName}" (ID #${company.id}). Fecha de vencimiento: ${formattedDueDate}.`
  );
  const whatsappUrl = `https://wa.me/524427821011?text=${whatsappMsg}`;

  return (
    <div className={`w-full px-6 py-3 border-b text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md z-40 relative ${
      isExpired 
        ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white border-red-500' 
        : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-amber-400'
    }`}>
      
      {/* Alert Title & Message */}
      <div className="flex items-center space-x-3">
        <div className="p-1.5 bg-white/20 rounded-xl flex-shrink-0">
          {isExpired ? (
            <AlertCircle className="w-5 h-5 text-white animate-pulse" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-white" />
          )}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-black uppercase tracking-wider text-[10px] bg-black/20 px-2 py-0.5 rounded-full">
              {isExpired ? '🚨 Suscripción PRO Vencida' : '⚠️ Recordatorio de Pago PRO'}
            </span>
            <span className="font-extrabold">{companyName}</span>
          </div>

          <p className="text-white/95 mt-0.5 font-medium">
            {isExpired ? (
              <>Tu suscripción 👑 PRO venció el <strong>{formattedDueDate}</strong>. Realiza tu pago mensual para evitar el cambio automático a Freemium.</>
            ) : (
              <>Tu fecha de facturación mensual es el <strong>{formattedDueDate}</strong> (faltan <strong>{daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}</strong>). Realiza tu pago a tiempo para mantener tu servicio sin interrupción.</>
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 font-black text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Reportar Pago por WhatsApp</span>
        </a>

        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 hover:bg-white/20 text-white rounded-lg transition-colors"
          title="Ocultar aviso por esta sesión"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
