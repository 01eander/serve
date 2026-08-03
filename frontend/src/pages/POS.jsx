import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginScreen from '../components/LoginScreen';
import TableMap from '../components/TableMap';
import MenuArea from '../components/MenuArea';
import OrderTicket from '../components/OrderTicket';
import ItemNotesModal from '../components/ItemNotesModal';
import CheckoutModal from '../components/CheckoutModal';
import ReceiptModal from '../components/ReceiptModal';
import TransferTableModal from '../components/TransferTableModal';
import ProUpgradeModal from '../components/ProUpgradeModal';
import { useCompany } from '../contexts/CompanyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE_URL } from '../config/api';

export default function POS() {
  const { company, companyFetch } = useCompany();
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
  const [orderPrinted, setOrderPrinted] = useState({});
  const [orderWaiters, setOrderWaiters] = useState({});

  const [noteModalItem, setNoteModalItem] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isMobileOrderOpen, setIsMobileOrderOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [showProModal, setShowProModal] = useState(false);
  const [proModalReason, setProModalReason] = useState('');

  const handleRequirePro = (reason) => {
    setProModalReason(reason);
    setShowProModal(true);
  };

  useEffect(() => {
    if (!company || !company.currency_configured) {
      setLoading(false);
      return;
    }

    const fetchData = async (isPolling = false) => {
      try {
        if (!isPolling) setLoading(true);
        const [usersRes, tablesRes, menuRes, ordersRes] = await Promise.all([
          companyFetch(`${API_BASE_URL}/api/users`),
          companyFetch(`${API_BASE_URL}/api/tables`),
          companyFetch(`${API_BASE_URL}/api/menu`),
          companyFetch(`${API_BASE_URL}/api/orders/active`)
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

        setOrderPrinted(prev => {
          const newPrintedMap = { ...prev };
          if (Array.isArray(tablesData)) {
            tablesData.forEach(t => {
              if (t.status === 'available' && activeTableIdRef.current !== t.id) {
                delete newPrintedMap[t.id];
              }
            });
          }
          if (Array.isArray(ordersData)) {
            ordersData.forEach(order => {
              newPrintedMap[order.table_id] = order.is_printed || false;
            });
          }
          return newPrintedMap;
        });

        setOrderWaiters(prev => {
          const newWaitersMap = { ...prev };
          if (Array.isArray(tablesData)) {
            tablesData.forEach(t => {
              if (t.status === 'available' && activeTableIdRef.current !== t.id) {
                delete newWaitersMap[t.id];
              }
            });
          }
          if (Array.isArray(ordersData)) {
            ordersData.forEach(order => {
              if (order.waiter_id) {
                newWaitersMap[order.table_id] = { id: order.waiter_id, name: order.waiter_name };
              }
            });
          }
          return newWaitersMap;
        });

        setTables(prev => {
          return (Array.isArray(tablesData) ? tablesData : []).map(t => {
            const status = (isPolling && activeTableIdRef.current === t.id && prev.find(p => p.id === t.id)?.status === 'occupied') 
                ? 'occupied' 
                : t.status;
            const waiterInfo = orderWaiters[t.id] || null;
            return { 
              ...t, 
              status: status,
              orderTotal: tableTotals[t.id] || 0,
              waiterName: waiterInfo ? waiterInfo.name : null
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
  }, [company, refreshTrigger]);

  const activeOrder = orders[activeTableId] || [];
  const activeStatus = orderStatuses[activeTableId] || 'new';
  const assignedWaiter = orderWaiters[activeTableId] || null;

  const subtotal = activeOrder.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;
  const activeTable = tables.find(t => t.id === activeTableId);

  const handleLogin = (user) => {
    if (user.role === 'admin') {
      const onboardingKey = `onboarding_completed_${company?.id}`;
      const isCompleted = localStorage.getItem(onboardingKey);
      // By default or on first use, go to Caja (/admin/cash)
      if (!isCompleted || company?.plan !== 'pro') {
        navigate('/admin/cash');
      } else {
        navigate('/admin');
      }
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
    if (orderPrinted[activeTableId]) {
      alert(t('bill_printed_locked'));
      return;
    }
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
    if (orderPrinted[activeTableId]) {
      alert('La cuenta está impresa. Debes reabrirla para modificarla.');
      return;
    }
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
    if (activeStatus === 'in_kitchen' || activeStatus === 'served') {
      setOrderStatuses(prev => ({ ...prev, [activeTableId]: 'pending_kitchen' }));
    }
  };

  const handleRemoveItem = (productId) => {
    if (orderPrinted[activeTableId]) {
      alert(t('bill_printed_modify'));
      return;
    }
    setOrders(prev => {
      const tableOrder = prev[activeTableId] || [];
      return { ...prev, [activeTableId]: tableOrder.filter(item => item.id !== productId) };
    });
    if (activeStatus === 'in_kitchen' || activeStatus === 'served') {
      setOrderStatuses(prev => ({ ...prev, [activeTableId]: 'pending_kitchen' }));
    }
  };

  const handleSaveNote = (productId, note) => {
    if (orderPrinted[activeTableId]) {
      alert(t('bill_printed_modify'));
      return;
    }
    setOrders(prev => {
      const tableOrder = prev[activeTableId] || [];
      const newOrder = tableOrder.map(item => 
        item.id === productId ? { ...item, notes: note } : item
      );
      return { ...prev, [activeTableId]: newOrder };
    });
    if (activeStatus === 'in_kitchen' || activeStatus === 'served') {
      setOrderStatuses(prev => ({ ...prev, [activeTableId]: 'pending_kitchen' }));
    }
    setNoteModalItem(null);
  };

  const handleSendToKitchen = async () => {
    if (orderPrinted[activeTableId]) return;
    setOrderStatuses(prev => ({ ...prev, [activeTableId]: 'in_kitchen' }));
    
    try {
      await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: activeTableId,
          items: activeOrder,
          total_amount: total,
          waiter_id: loggedInWaiter.id
        })
      });
      // After sending to kitchen, the logged-in waiter becomes the owner locally if no one was assigned yet
      if (!assignedWaiter) {
        setOrderWaiters(prev => ({
          ...prev,
          [activeTableId]: { id: loggedInWaiter.id, name: loggedInWaiter.name }
        }));
      }
    } catch (err) {
      console.error('Error sending order to backend:', err);
    }
  };

  const handleCheckoutConfirm = async (checkoutDetails) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/table/${activeTableId}/pay`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-company-id': company?.id?.toString() || '1'
        },
        body: JSON.stringify({ 
          payment_method: checkoutDetails.paymentMethod,
          tip_amount: checkoutDetails.tipAmount,
          discount_amount: checkoutDetails.discountAmount,
          final_total: checkoutDetails.finalTotal
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al procesar pago');
        return;
      }

      const receiptData = {
        ...checkoutDetails,
        orderId: data.order_id,
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
        t.id === activeTableId ? { ...t, status: 'available', orderTotal: 0, waiterName: null } : t
      ));
      
      // Reset order status and waiters
      setOrderStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[activeTableId];
        return newStatuses;
      });
      setOrderWaiters(prev => {
        const newWaiters = { ...prev };
        delete newWaiters[activeTableId];
        return newWaiters;
      });

      setShowCheckoutModal(false);
    } catch (err) {
      console.error(err);
      alert('Error de conexión al procesar el pago');
    }
  };

  const handlePrintBill = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/table/${activeTableId}/print`, {
        method: 'PATCH',
        headers: { 'x-company-id': company?.id?.toString() || '1' }
      });
      if (!res.ok) {
        alert('Error al marcar la cuenta como impresa');
        return;
      }
      setOrderPrinted(prev => ({ ...prev, [activeTableId]: true }));
      
      setCurrentReceipt({
        isPreReceipt: true,
        tableName: activeTable?.table_number || activeTable?.number || activeTable?.id,
        waiterName: loggedInWaiter?.name,
        items: activeOrder,
        subtotal,
        tax,
        finalTotal: total,
        tipAmount: 0,
        discountAmount: 0
      });
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  const handleReopenBill = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/table/${activeTableId}/reopen`, {
        method: 'PATCH',
        headers: { 'x-company-id': company?.id?.toString() || '1' }
      });
      if (!res.ok) {
        alert('Error al reabrir cuenta');
        return;
      }
      setOrderPrinted(prev => ({ ...prev, [activeTableId]: false }));
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  const handleCloseReceipt = () => {
    setCurrentReceipt(null);
    setActiveTableId(null);
    setRefreshTrigger(prev => prev + 1); // Force immediate sync with backend to update table map
  };

  const handleTransferTable = async (newTableId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/table/${activeTableId}/transfer`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-company-id': company?.id?.toString() || '1'
        },
        body: JSON.stringify({ new_table_id: newTableId })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Error al transferir la mesa');
        return;
      }
      
      // Update local state to reflect the move
      setOrders(prev => {
        const newOrders = { ...prev };
        newOrders[newTableId] = newOrders[activeTableId];
        delete newOrders[activeTableId];
        return newOrders;
      });
      setOrderStatuses(prev => {
        const newStatuses = { ...prev };
        newStatuses[newTableId] = newStatuses[activeTableId];
        delete newStatuses[activeTableId];
        return newStatuses;
      });
      setOrderPrinted(prev => {
        const newPrinted = { ...prev };
        if (newPrinted[activeTableId]) {
          newPrinted[newTableId] = newPrinted[activeTableId];
        }
        delete newPrinted[activeTableId];
        return newPrinted;
      });
      setOrderWaiters(prev => {
        const newWaiters = { ...prev };
        if (newWaiters[activeTableId]) {
          newWaiters[newTableId] = newWaiters[activeTableId];
        }
        delete newWaiters[activeTableId];
        return newWaiters;
      });
      
      setTables(prev => prev.map(t => {
        if (t.id === activeTableId) return { ...t, status: 'available', orderTotal: 0, waiterName: null };
        if (t.id === newTableId) return { ...t, status: 'occupied', orderTotal: total, waiterName: assignedWaiter?.name || null };
        return t;
      }));

      // Switch view to the new table
      setActiveTableId(newTableId);
      setShowTransferModal(false);
    } catch (err) {
      console.error(err);
      alert('Error de conexión al transferir la mesa');
    }
  };

  if (loading && company && company.currency_configured) {
    return <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-300 font-bold">Cargando sistema...</div>;
  }

  const handleTakeControl = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/table/${activeTableId}/transfer-waiter`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-company-id': company?.id?.toString() || '1'
        },
        body: JSON.stringify({ new_waiter_id: loggedInWaiter.id })
      });
      if (!res.ok) {
        alert('Error al reasignar la mesa');
        return;
      }
      setOrderWaiters(prev => ({
        ...prev,
        [activeTableId]: { id: loggedInWaiter.id, name: loggedInWaiter.name }
      }));
      setTables(prev => prev.map(t => 
        t.id === activeTableId ? { ...t, waiterName: loggedInWaiter.name } : t
      ));
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

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
        assignedWaiter={assignedWaiter}
        loggedInWaiter={loggedInWaiter}
        onTakeControl={handleTakeControl}
        isPrinted={orderPrinted[activeTableId] || false}
        tableNumber={activeTable?.table_number || activeTable?.number || activeTable?.id}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAddNote={(item) => setNoteModalItem(item)}
        onSendToKitchen={handleSendToKitchen}
        onCheckout={() => setShowCheckoutModal(true)}
        onPrintBill={handlePrintBill}
        onReopenBill={handleReopenBill}
        onOpenTransfer={() => setShowTransferModal(true)}
        isMobileOpen={isMobileOrderOpen}
        onCloseMobile={() => setIsMobileOrderOpen(false)}
        isFreemium={company?.plan !== 'pro'}
        onRequirePro={handleRequirePro}
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

      {showTransferModal && (
        <TransferTableModal 
          currentTableId={activeTableId}
          tables={tables}
          onClose={() => setShowTransferModal(false)}
          onConfirm={handleTransferTable}
        />
      )}

      <ProUpgradeModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
        triggerReason={proModalReason} 
      />
    </div>
  );
}
