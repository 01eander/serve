import { useState, useEffect } from 'react';
import { X, MessageSquare, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const quickNotes = [
  'Sin cebolla',
  'Sin tomate',
  'Término medio',
  'Bien cocido',
  'Para llevar',
  'Extra queso',
  'Sin picante',
  'Poco hielo'
];

export default function ItemNotesModal({ item, onClose, onSave }) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (item && item.notes) {
      setNote(item.notes);
    } else {
      setNote('');
    }
  }, [item]);

  if (!item) return null;

  const handleQuickNote = (qn) => {
    setNote(prev => prev ? `${prev}, ${qn}` : qn);
  };

  const handleSave = () => {
    onSave(item.id, note);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
      >
        
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center space-x-3 text-slate-800 dark:text-white">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-xl">
              <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="font-extrabold text-xl tracking-tight">Notas del Platillo</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-7">
          <div className="flex items-center mb-6 bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover mr-4 shadow-sm" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 mr-4 shadow-sm flex items-center justify-center">
                 <span className="text-[10px] text-slate-400">Sin img</span>
              </div>
            )}
            <div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{item.name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Instrucciones para cocina</p>
            </div>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej. Sin cebolla, término medio..."
            className="w-full h-32 p-5 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl resize-none outline-none focus:border-primary-500 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium shadow-inner"
            autoFocus
          />

          <div className="mt-6">
            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Notas Rápidas</p>
            <div className="flex flex-wrap gap-2">
              {quickNotes.map((qn, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickNote(qn)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-full transition-colors font-bold border border-slate-300 dark:border-slate-700"
                >
                  {qn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-900">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_16px_rgba(124,58,237,0.4)] transition-colors flex items-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>Guardar Nota</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
}
