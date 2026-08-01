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
import CashManagement from './pages/admin/CashManagement';
import OrdersHistory from './pages/admin/OrdersHistory';
import MasterAdminPortal from './pages/master/MasterAdminPortal';
import FranchiseHQ from './pages/admin/FranchiseHQ';
import InvoicesManager from './pages/admin/InvoicesManager';
import InvoicePortal from './pages/InvoicePortal';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Master Admin SuperAdmin Portal */}
        <Route path="/master" element={<MasterAdminPortal />} />

        {/* Main POS Interface */}
        <Route path="/" element={<POS />} />

        {/* Public Invoice Portal */}
        <Route path="/facturar/:orderId" element={<InvoicePortal />} />

        {/* Kitchen KDS View */}
        <Route path="/kitchen" element={<KitchenView />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="cash" element={<CashManagement />} />
          <Route path="orders" element={<OrdersHistory />} />
          <Route path="hq" element={<FranchiseHQ />} />
          <Route path="invoices" element={<InvoicesManager />} />
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
