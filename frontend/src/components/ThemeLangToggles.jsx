import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Sun, Moon, Globe } from 'lucide-react';

export default function ThemeLangToggles() {
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        title="Cambiar Tema"
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

      {/* Language Select */}
      <div className="flex items-center space-x-1 px-2">
        <Globe className="w-4 h-4 text-gray-400" />
        <select 
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer p-1 appearance-none"
        >
          <option value="es" className="text-gray-900">ES</option>
          <option value="en" className="text-gray-900">EN</option>
          <option value="pt" className="text-gray-900">PT</option>
        </select>
      </div>
    </div>
  );
}
