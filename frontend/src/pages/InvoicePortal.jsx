import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, CheckCircle2, ChevronRight, FileText, Mail, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE_URL } from '../config/api';

export default function InvoicePortal() {
  const { orderId } = useParams();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    rfc: '',
    razonSocial: '',
    cp: '',
    regimenFiscal: '601', 
    usoCfdi: 'G03', 
    email: ''
  });

  const regimenOptions = [
    { value: '601', label: '601 - General de Ley Personas Morales' },
    { value: '603', label: '603 - Personas Morales con Fines no Lucrativos' },
    { value: '605', label: '605 - Sueldos y Salarios' },
    { value: '606', label: '606 - Arrendamiento' },
    { value: '612', label: '612 - Personas Físicas con Actividades Empresariales' },
    { value: '626', label: '626 - Régimen Simplificado de Confianza (RESICO)' },
  ];

  const usoOptions = [
    { value: 'G01', label: 'G01 - Adquisición de mercancías' },
    { value: 'G03', label: 'G03 - Gastos en general' },
    { value: 'P01', label: 'P01 - Por definir' },
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices/order/${orderId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar datos');
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...formData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al solicitar factura');
      
      // Simulate slight delay for dramatic effect
      setTimeout(() => {
        setStep(2);
      }, 800);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-900 leading-tight">{t('invoice_portal_title')}</h1>
            <p className="text-xs font-medium text-slate-500">{t('powered_by')}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto p-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Order Summary Card */}
              {order ? (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{t('consumption_summary')}</h3>
                      <div className="text-2xl font-black text-slate-900">${Number(order.total).toFixed(2)}</div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded-full text-xs border border-emerald-100">
                      Ticket #{order.id.toString().slice(0,8)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium">${order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 mt-1">
                    <span>IVA (16%)</span>
                    <span className="font-medium">${order.tax}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 text-center">
                  {error || 'No se pudo cargar la información del ticket.'}
                </div>
              )}

              {/* Form */}
              {order && (
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                  <h2 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-500" />
                    {t('fiscal_details')}
                  </h2>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{t('rfc')}</label>
                      <input 
                        type="text" 
                        name="rfc"
                        required
                        value={formData.rfc}
                        onChange={(e) => handleChange({ target: { name: 'rfc', value: e.target.value.toUpperCase() } })}
                        placeholder="XAXX010101000"
                        className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-2xl focus:outline-none focus:border-primary-500 focus:bg-white transition-colors font-bold uppercase text-slate-900" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{t('business_name')}</label>
                      <input 
                        type="text" 
                        name="razonSocial"
                        required
                        value={formData.razonSocial}
                        onChange={handleChange}
                        placeholder="Nombre completo o Empresa"
                        className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-2xl focus:outline-none focus:border-primary-500 focus:bg-white transition-colors font-medium text-slate-900" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{t('postal_code')}</label>
                        <input 
                          type="text" 
                          name="cp"
                          required
                          value={formData.cp}
                          onChange={handleChange}
                          placeholder="76000"
                          className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-2xl focus:outline-none focus:border-primary-500 focus:bg-white transition-colors font-medium text-slate-900" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{t('cfdi_use')}</label>
                        <select 
                          name="usoCfdi"
                          value={formData.usoCfdi}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-2xl focus:outline-none focus:border-primary-500 focus:bg-white transition-colors font-medium text-slate-900 appearance-none"
                        >
                          {usoOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{t('fiscal_regime')}</label>
                      <select 
                        name="regimenFiscal"
                        value={formData.regimenFiscal}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-2xl focus:outline-none focus:border-primary-500 focus:bg-white transition-colors font-medium text-slate-900 appearance-none"
                      >
                        {regimenOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{t('delivery_email')}</label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@correo.com"
                        className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-2xl focus:outline-none focus:border-primary-500 focus:bg-white transition-colors font-medium text-slate-900" 
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-primary-500/30"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{t('generate_invoice')}</span>
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs font-medium text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('secure_connection')}</span>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/40">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-3">{t('invoice_generated')}</h2>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                {t('invoice_sent_msg')} <strong className="text-slate-900">{formData.email}</strong>. 
                {t('receive_soon')}
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100 mb-8 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                    <Mail className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">{t('sat_status')}</div>
                    <div className="text-sm font-bold text-slate-900">{t('stamp_success')}</div>
                  </div>
                </div>
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
