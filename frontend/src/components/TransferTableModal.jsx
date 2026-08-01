import { useState } from 'react';
import { X, ArrowRightLeft, LayoutGrid, CheckCircle } from 'lucide-react';

export default function TransferTableModal({ currentTableId, tables, onClose, onConfirm }) {
  const [selectedTable, setSelectedTable] = useState(null);
  
  // Filter for available tables only
  const availableTables = tables.filter(t => t.status === 'available');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTable) {
      onConfirm(selectedTable);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Mudar Mesa</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Transfiere el consumo a otra mesa</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {availableTables.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold">No hay mesas libres</p>
              <p className="text-sm">Todas las demás mesas están ocupadas actualmente.</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
                Selecciona la nueva mesa:
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableTables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`relative p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                      selectedTable === table.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 scale-[1.02]' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <LayoutGrid className={`w-6 h-6 ${selectedTable === table.id ? 'text-blue-500' : 'text-slate-400'}`} />
                    <span className="font-bold text-lg">{table.table_number || table.number || table.id}</span>
                    
                    {selectedTable === table.id && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-0.5">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 py-3.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={!selectedTable}
            className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
          >
            Transferir <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
