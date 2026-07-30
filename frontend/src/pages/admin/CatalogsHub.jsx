import { useState } from 'react';
import { UtensilsCrossed, Grid2X2, Users, Layers } from 'lucide-react';
import MenuCatalog from './MenuCatalog';
import TablesCatalog from './TablesCatalog';
import UsersCatalog from './UsersCatalog';

export default function CatalogsHub({ initialTab = 'menu' }) {
  const [activeCatalog, setActiveCatalog] = useState(initialTab);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen">
      
      {/* Header & Catalog Tabs */}
      <div className="p-6 md:p-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-primary-600 to-indigo-700 text-white rounded-2xl shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Catálogos del Sistema</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Administra menú, categorías, mesas e infraestructura, y personal del restaurante</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => setActiveCatalog('menu')}
            className={`flex items-center space-x-2.5 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all shadow-sm ${
              activeCatalog === 'menu'
                ? 'bg-primary-600 text-white shadow-primary-500/25 ring-4 ring-primary-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Platillos & Categorías</span>
          </button>

          <button
            onClick={() => setActiveCatalog('tables')}
            className={`flex items-center space-x-2.5 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all shadow-sm ${
              activeCatalog === 'tables'
                ? 'bg-primary-600 text-white shadow-primary-500/25 ring-4 ring-primary-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Grid2X2 className="w-4 h-4" />
            <span>Mesas del Restaurante</span>
          </button>

          <button
            onClick={() => setActiveCatalog('users')}
            className={`flex items-center space-x-2.5 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all shadow-sm ${
              activeCatalog === 'users'
                ? 'bg-primary-600 text-white shadow-primary-500/25 ring-4 ring-primary-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Personal & Usuarios</span>
          </button>
        </div>
      </div>

      {/* Catalog Content Container */}
      <div className="flex-1 overflow-y-auto">
        {activeCatalog === 'menu' && <MenuCatalog />}
        {activeCatalog === 'tables' && <TablesCatalog />}
        {activeCatalog === 'users' && <UsersCatalog />}
      </div>

    </div>
  );
}
