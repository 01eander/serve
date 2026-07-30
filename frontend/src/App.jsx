import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import POS from './pages/POS';
import KitchenView from './pages/KitchenView';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import TablesCatalog from './pages/admin/TablesCatalog';
import UsersCatalog from './pages/admin/UsersCatalog';
import SettingsPage from './pages/admin/SettingsPage';
import PromotionsPage from './pages/admin/PromotionsPage';
import CatalogsHub from './pages/admin/CatalogsHub';
import MasterAdminPortal from './pages/master/MasterAdminPortal';
import FranchiseHQ from './pages/admin/FranchiseHQ';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Master Admin SuperAdmin Portal */}
        <Route path="/master" element={<MasterAdminPortal />} />

        {/* Main POS Interface */}
        <Route path="/" element={<POS />} />

        {/* Kitchen KDS View */}
        <Route path="/kitchen" element={<KitchenView />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="hq" element={<FranchiseHQ />} />
          <Route path="catalogs" element={<CatalogsHub initialTab="menu" />} />
          <Route path="menu" element={<CatalogsHub initialTab="menu" />} />
          <Route path="tables" element={<CatalogsHub initialTab="tables" />} />
          <Route path="users" element={<CatalogsHub initialTab="users" />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
