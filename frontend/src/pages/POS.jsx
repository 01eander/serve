import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginScreen from '../components/LoginScreen';
import TableMap from '../components/TableMap';
import MenuArea from '../components/MenuArea';
import OrderTicket from '../components/OrderTicket';
import ItemNotesModal from '../components/ItemNotesModal';
import CheckoutModal from '../components/CheckoutModal';
import ReceiptModal from '../components/ReceiptModal';
import { useCompany } from '../contexts/CompanyContext';

export default function POS() {
  const { company, companyFetch } = useCompany();
  const [users, setUsers] = useState([]);
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [loggedInWaiter, setLoggedInWaiter] = useState(() => {
    try {
      const saved = sessionStorage.getItem('loggedInWaiter');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeTableId, setActiveTableId] = useState(null);
  const activeTableIdRef = useRef(null);

  useEffect(() => {
    activeTableIdRef.current = activeTableId;
  }, [activeTableId]);
  
  const [orders, setOrders] = useState({});
  const [orderStatuses, setOrderStatuses] = useState({});

  const [noteModalItem, setNoteModalItem] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isMobileOrderOpen, setIsMobileOrderOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);

  useEffect(() => {
    if (!company || !company.currency_configured) {
      setLoading(false);
      return;
    }

    const fetchData = async (isPolling = false) => {
      try {
        if (!isPolling) setLoading(true);
        const [usersRes, tablesRes, menuRes, ordersRes] = await Promise.all([
          companyFetch('http://localhost:3000/api/users'),
          companyFetch('http://localhost:3000/api/tables'),
          companyFetch('http://localhost:3000/api/menu'),
          companyFetch('http://localhost:3000/api/orders/active')
        ]);
        
        const usersData = await usersRes.json();
        const tablesData = await tablesRes.json();
        const menuData = await menuRes.json();
        const ordersData = await ordersRes.json();
        
        setUsers((Array.isArray(usersData) ? usersData : []).filter(u => u.active));
        setCategories(menuData.categories || []);
        setMenuItems(menuData.items || []);

        const tableTotals = {};

        setOrders(prev => {
          const newOrdersMap = { ...prev };
          if (Array.isArray(tablesData)) {
            tablesData.forEach(t => {
              if (t.status === 'available' && activeTableIdRef.current !== t.id) {
                delete newOrdersMap[t.id];
              }
            });
          }
          if (Array.isArray(ordersData)) {
            ordersData.forEach(order => {
              if (isPolling && activeTableIdRef.current === order.table_id) {
                // Preserve local draft for the active table
              } else {
                newOrdersMap[order.table_id] = order.items.map(item => ({
                  id: item.menu_item_id,
                  name: item.item_name,
                  price: item.unit_price,
                  quantity: item.quantity,
                  notes: item.notes || ''
                }));
              }
              tableTotals[order.table_id] = parseFloat(order.total_amount) || 0;
            });
          }
          return newOrdersMap;
        });

        setOrderStatuses(prev => {
          const newStatusesMap = { ...prev };
          if (Array.isArray(tablesData)) {
            tablesData.forEach(t => {
              if (t.status === 'available' && activeTableIdRef.current !== t.id) {
                delete newStatusesMap[t.id];
              }
            });
          }
          if (Array.isArray(ordersData)) {
            ordersData.forEach(order => {
              newStatusesMap[order.table_id] = order.status;
            });
          }
          return newStatusesMap;
        });

        setTables(prev => {
          return (Array.isArray(tablesData) ? tablesData : []).map(t => {
            const status = (isPolling && activeTableIdRef.current === t.id && prev.find(p => p.id === t.id)?.status === 'occupied') 
                ? 'occupied' 
                : t.status;
            return { 
              ...t, 
              status: status,
              orderTotal: tableTotals[t.id] || 0 
            };
          });
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [company]);

  const activeOrder = orders[activeTableId] || [];
  const activeStatus = orderStatuses[activeTableId] || 'new';

  const subtotal = activeOrder.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;
  const activeTable = tables.find(t => t.id === activeTableId);

  const handleLogin = (user) => {
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      try {
        sessionStorage.setItem('loggedInWaiter', JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
      setLoggedInWaiter(user);
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('loggedInWaiter');
    } catch (e) {
      console.error(e);
    }
    setLoggedInWaiter(null);
    setActiveTableId(null);
  };

  const handleSelectTable = (tableId) => {
    setActiveTableId(tableId);
    // If the table was available, make it occupied when selected for taking an order
    setTables(prev => prev.map(t => 
      t.id === tableId && t.status === 'available' ? { ...t, status: 'occupied' } : t
    ));
    if (!orderStatuses[tableId]) {
      setOrderStatuses(prev => ({ ...prev, [tableId]: 'new' }));
    }
  };

  const handleBackToMap = () => {
    // Before going back, update the table's order total for the map display
    setTables(prev => prev.map(t => 
      t.id === activeTableId ? { ...t, orderTotal: total } : t
    ));
    
    // If we go back and the order is totally empty and status is new, free the table
    if (activeOrder.length === 0 && activeStatus === 'new') {
       setTables(prev => prev.map(t => 
         t.id === activeTableId ? { ...t, status: 'available', orderTotal: 0 } : t
       ));
    }
    
    setActiveTableId(null);
  };

  const handleAddToOrder = (product) => {
    setOrders(prev => {
      const tableOrder = prev[activeTableId] || [];
      const existing = tableOrder.find(item => item.id === product.id);
      let newOrder;
      if (existing) {
        newOrder = tableOrder.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        newOrder = [...tableOrder, { ...product, quantity: 1, notes: '' }];
      }
      return { ...prev, [activeTableId]: newOrder };
    });
    // Revert status to pending_kitchen if we add new items
    if (activeStatus === 'in_kitchen' || activeStatus === 'served') {
      setOrderStatuses(prev => ({ ...prev, [activeTableId]: 'pending_kitchen' }));
    }
  };

  const handleUpdateQuantity = (productId, delta) => {
    setOrders(prev => {
      const tableOrder = prev[activeTableId] || [];
      const newOrder = tableOrder.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
      return { ...prev, [activeTableId]: newOrder };
    });
  };

  const handleRemoveItem = (productId) => {
    setOrders(prev => {
      const tableOrder = prev[activeTableId] || [];
      return { ...prev, [activeTableId]: tableOrder.filter(item => item.id !== productId) };
    });
  };

  const handleSaveNote = (productId, note) => {
    setOrders(prev => {
      const tableOrder = prev[activeTableId] || [];
      const newOrder = tableOrder.map(item => 
        item.id === productId ? { ...item, notes: note } : item
      );
      return { ...prev, [activeTableId]: newOrder };
    });
    setNoteModalItem(null);
  };

  const handleSendToKitchen = async () => {
    setOrderStatuses(prev => ({ ...prev, [activeTableId]: 'in_kitchen' }));
    
    try {
      await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: activeTableId,
          items: activeOrder,
          total_amount: total
        })
      });
    } catch (err) {
      console.error('Error sending order to backend:', err);
    }
  };

  const handleCheckoutConfirm = (checkoutDetails) => {
    const receiptData = {
      ...checkoutDetails,
      tableName: activeTable?.table_number || activeTable?.number || activeTable?.id,
      waiterName: loggedInWaiter?.name,
      items: activeOrder
    };
    setCurrentReceipt(receiptData);

    // Clear the table order
    setOrders(prev => {
      const newOrders = { ...prev };
      delete newOrders[activeTableId];
      return newOrders;
    });
    
    // Reset table status
    setTables(prev => prev.map(t => 
      t.id === activeTableId ? { ...t, status: 'available', orderTotal: 0 } : t
    ));
    
    // Reset order status
    setOrderStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[activeTableId];
      return newStatuses;
    });

    setShowCheckoutModal(false);
  };

  const handleCloseReceipt = () => {
    setCurrentReceipt(null);
    setActiveTableId(null);
  };

  if (loading && company && company.currency_configured) {
    return <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-300 font-bold">Cargando sistema...</div>;
  }

  // 1. Show Login Screen if no waiter is logged in
  if (!loggedInWaiter) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  // 2. Show Table Map if no table is selected
  if (!activeTableId) {
    return <TableMap 
      tables={tables} 
      waiterName={loggedInWaiter.name}
      onSelectTable={handleSelectTable} 
      onLogout={handleLogout}
    />;
  }

  // 3. Show POS view if a table is selected
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
      <MenuArea 
        categories={categories}
        menuItems={menuItems}
        onAddToOrder={handleAddToOrder} 
        onBackToMap={handleBackToMap}
        tableNumber={activeTable?.table_number || activeTable?.number || activeTable?.id}
      />
      
      <OrderTicket 
        orderItems={activeOrder}
        orderStatus={activeStatus}
        tableNumber={activeTable?.table_number || activeTable?.number || activeTable?.id}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAddNote={(item) => setNoteModalItem(item)}
        onSendToKitchen={handleSendToKitchen}
        onCheckout={() => setShowCheckoutModal(true)}
        isMobileOpen={isMobileOrderOpen}
        onCloseMobile={() => setIsMobileOrderOpen(false)}
      />

      {/* Floating Mobile Order Bar */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
        <button 
          onClick={() => setIsMobileOrderOpen(true)}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 px-6 rounded-2xl shadow-xl flex items-center justify-between border border-white/20 active:scale-95 transition-all"
        >
          <div className="flex items-center space-x-3">
            <span className="bg-white/25 px-3 py-1 rounded-xl text-sm font-black">
              {activeOrder.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
            <span className="font-extrabold text-base">Ver Orden</span>
          </div>
          <span className="text-xl font-black">${total.toFixed(2)}</span>
        </button>
      </div>

      {noteModalItem && (
        <ItemNotesModal 
          item={noteModalItem}
          onClose={() => setNoteModalItem(null)}
          onSave={handleSaveNote}
        />
      )}

      {showCheckoutModal && (
        <CheckoutModal
          subtotal={subtotal}
          tax={tax}
          total={total}
          onClose={() => setShowCheckoutModal(false)}
          onConfirm={handleCheckoutConfirm}
        />
      )}

      {currentReceipt && (
        <ReceiptModal
          receiptData={currentReceipt}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
}
