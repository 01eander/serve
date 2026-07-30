import { createContext, useState, useContext, useEffect } from 'react';
import { useCompany } from './CompanyContext';

const translations = {
  es: {
    // Nav & General
    dashboard: 'Dashboard',
    menu_catalog: 'Catálogo de Menú',
    tables_catalog: 'Catálogo de Mesas',
    users: 'Usuarios y Personal',
    settings: 'Configuraciones',
    management: 'Gestión',
    back_to_pos: 'Regresar al login',
    welcome: 'Bienvenido',
    cancel: 'Cancelar',
    login: 'Ingresar',
    logout: 'Salir',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    search: 'Buscar...',
    loading: 'Cargando sistema...',
    active: 'Activo',
    inactive: 'Inactivo',
    
    // Login
    select_user: 'Selecciona tu usuario para entrar',
    pin_prompt: 'Ingresa tu PIN',
    incorrect_pin: 'PIN incorrecto',
    demo_pin_tip: 'Tip Demo: El PIN es',
    click_to_autocomplete: '(clic para autocompletar)',
    error_fetching_companies: 'Error al obtener empresas',
    // Company Auth Modal
    saas_auth_title: 'Acceso Multi-Empresa SaaS',
    saas_auth_subtitle: 'Oleander Serve • Gestión de Restaurantes',
    company_login: 'Acceso Empresa',
    company_register: 'Darse de Alta',
    company_email_user: 'Correo o Usuario de la Empresa',
    company_email_placeholder: 'restaurante@ejemplo.com u oleander',
    password: 'Contraseña',
    password_placeholder: '••••••••',
    try_demo_company: '⚡ Probar Empresa Demo al instante',
    login_to_company: 'Ingresar a mi Empresa',
    restaurant_name: 'Nombre del Restaurante / Empresa',
    restaurant_name_placeholder: 'ej. Tacos El Pastor',
    company_email: 'Correo de la Empresa',
    company_email_new_placeholder: 'contacto@restaurante.com',
    initial_admin_user: 'Usuario Administrador Inicial:',
    initial_admin_desc: 'Se creará automáticamente el usuario <strong>Administrador Principal</strong> con el clave PIN <span className="text-amber-400 font-bold">1234</span>.',
    register_my_company: 'Registrar mi Empresa',
    error_login: 'Error al iniciar sesión',
    error_register: 'Error al registrar la empresa',
    change_company: 'Cambiar Empresa',
    
    // Table Map
    table_map: 'Mapa de Mesas',
    select_table_prompt: 'Selecciona una mesa para tomar la orden',
    kitchen: 'Cocina',
    available: 'Disponible',
    occupied: 'Ocupada',
    reserved: 'Reservada',
    table_short: 'MESA',
    
    // Menu Area & Order Ticket
    order_ticket: 'Ticket de Orden',
    table: 'Mesa',
    subtotal: 'Subtotal',
    tax: 'IVA (16%)',
    total: 'Total',
    send_kitchen: 'Enviar a Cocina',
    checkout: 'Cobrar',
    add_note: 'Añadir Nota',
    save_note: 'Guardar Nota',
    notes: 'Notas de Preparación',
    clear_order: 'Limpiar Orden',
    update_qty: 'Cantidad',
    
    // Kitchen
    kds_title: 'KDS - Comandas de Cocina',
    back_to_tables: 'Regresar a Mesas',
    all: 'Todos',
    pending: 'Pendientes',
    preparing: 'Preparando',
    served: 'Listos',
    start_prep: 'Iniciar Preparación',
    mark_ready: '¡Marcar como Listo!',
    archive_delivered: 'Archivar / Entregado',
    
    // Order Ticket Extras
    current_order: 'Orden Actual',
    status: 'Estado',
    in_kitchen: 'En Cocina',
    modifying: 'Modificando',
    empty_order: 'La orden está vacía',
    select_products: 'Selecciona productos del menú',
    no_image: 'Sin img',
    remove: 'Quitar',
    
    // Kitchen Extras
    updated_at: 'Actualizado a las',
    loading_orders: 'Cargando comandas...',
    no_active_orders: 'No hay comandas activas',
    new_orders_appear_here: 'Los nuevos pedidos aparecerán aquí.',
    ready_to_serve: 'Listo para Servir',
    
    // Admin Extras
    catalogs: 'Catálogos',
    promotions_offers: 'Descuentos & Ofertas',
    view_pro_benefits: 'Ver Beneficios PRO',
    
    // Catalogs
    new_user: 'Nuevo Usuario',
    name: 'Nombre',
    role: 'Rol',
    admin: 'Administrador',
    waiter: 'Mesero',
    pin: 'PIN de Acceso',
    
    new_item: 'Nuevo Platillo',
    category: 'Categoría',
    price: 'Precio',
    upload_photo: '📁 Cargar Foto',
    new_category: 'Nueva Categoría',
    
    new_table: 'Nueva Mesa',
    table_number: 'Número de Mesa',
    capacity: 'Capacidad',
    persons: 'personas',
    
    // Menu Catalog Extras
    menu_catalog_desc: 'Administra los platillos, precios y categorías',
    dishes: 'Platillos',
    categories: 'Categorías',
    product: 'Producto',
    inventory_stock: 'Inventario Stock',
    actions: 'Acciones',
    out_of_stock: 'Agotado',
    low_stock: 'Stock Bajo',
    in_stock: 'En Stock',
    id: 'ID',
    description: 'Descripción',
    active_f: 'Activa',
    hidden: 'Oculta',
    edit_dish: 'Editar Platillo',
    product_name: 'Nombre del Producto',
    price_usd: 'Precio ($)',
    dish_photo: 'Foto del Platillo',
    paste_image_url: 'o pega una URL de imagen...',
    edit_category: 'Editar Categoría',
    category_name: 'Nombre de la Categoría',

    // Users Catalog Extras
    staff_and_users: 'Personal y Usuarios',
    manage_staff_desc: 'Gestiona los meseros y administradores del sistema',
    active_m: 'Activo',
    inactive_m: 'Inactivo',
    edit_user: 'Editar Usuario',
    full_name: 'Nombre Completo',
    pin_4_digits: 'PIN (4 dígitos)',
    
    // Tables Catalog Extras
    manage_tables_desc: 'Administra el mapa de mesas del restaurante',
    no_tables_registered: 'No hay mesas registradas.',
    edit_table: 'Editar Mesa',
    capacity_pax: 'Capacidad (Pax)',
    status_auto_update: 'Normalmente el estado se actualiza automáticamente desde el POS, pero puedes ajustarlo si hubo un error.',
    confirm_delete_table: '¿Estás seguro de ELIMINAR la Mesa',
    confirm_delete_table_warning: '(Esta acción no se puede deshacer y fallará si tiene órdenes asociadas)',
    
    // Settings Extras
    settings_desc: 'Personaliza la identidad visual, logo, moneda e impuestos de tu empresa',
    settings_saved: '¡Configuración de empresa guardada con éxito!',
    company_identity: 'Identidad de la Empresa',
    company_identity_desc: 'Nombre oficial y logotipo de tu establecimiento comercial',
    pro_custom_brand: 'Marca Personalizada PRO',
    pro_custom_brand_desc: 'La personalización del Logotipo, Dirección y Frase del Ticket requiere una licencia 👑 PRO.',
    company_name_label: 'Nombre de Empresa / Restaurante',
    company_address_label: 'Dirección del Local (para ticket impresso)',
    ticket_footer_label: 'Frase de Despedida / Pie para Ticket',
    freemium_locked: 'Bloqueado en Freemium',
    default_language: 'Idioma Predeterminado de la Empresa',
    default_language_desc: 'Idioma base para todos los usuarios de la empresa al iniciar sesión',
    company_logo_label: 'Logotipo de la Empresa',
    upload_image_file: 'Cargar archivo de imagen',
    remove_logo: 'Quitar Logo',
    logo_preview: 'Vista Previa del Logotipo',
    no_logo_uploaded: 'Sin logotipo cargado',
    no_logo_desc: 'Se mostrará la insignia predeterminada con el nombre de tu empresa.',
    your_company: 'Tu Empresa',
    currency_and_taxes: 'Moneda e Impuestos',
    currency_and_taxes_desc: 'Selecciona la divisa y la tasa de IVA / impuesto aplicable',
    symbol: 'Símbolo',
    tax_rate_label: 'Tasa de Impuesto / IVA (%)',
    save_company_config: 'Guardar Configuración de Empresa',
    image_too_large: 'La imagen es demasiado grande. Por favor selecciona una imagen menor a 2MB.',
    require_pro_address: '🔒 Requiere plan PRO para añadir dirección',
    require_pro_ticket: '🔒 Requiere plan PRO para frase de ticket personalizada',
    require_pro_url: '🔒 Requiere plan PRO para URL de logotipo',
    paste_logo_url: 'O pega la URL directa del logo (ej. https://...)',
    
    // Dashboard
    today_sales: 'Ventas de Hoy',
    total_orders: 'Órdenes',
    active_customers: 'Clientes',
    sales_trend: 'Tendencia de Ventas',
    top_products: 'Productos Más Vendidos',
    
    // Dashboard Extras
    advanced_analytics: 'Analíticas & Métricas Avanzadas',
    pro_dashboard_desc: 'El resumen operativo en tiempo real, gráficas de tendencia semanal, platillos estrella y rendimiento por mesero requieren el plan 👑 PRO.',
    upgrade_to_pro: 'Aumenta tu Plan a PRO',
    analytics_panel: 'Panel de Analíticas',
    exclusive_summary: 'Resumen operativo exclusivo en tiempo real',
    refresh_data: 'Refrescar datos',
    z_report: 'Corte de Caja (Reporte Z)',
    weekly_sales_trend: 'Tendencia de Ventas Semanales',
    income_behavior: 'Comportamiento de ingresos',
    last_7_days: 'Últimos 7 días',
    top_selling_dishes: 'Platillos Más Vendidos',
    no_dishes_sold: 'Sin platillos vendidos aún',
    no_dishes_desc: 'Realiza pedidos en el POS para ver tus platillos estrella aquí.',
    staff_performance: 'Rendimiento del Personal',
    no_users_registered: 'Sin usuarios registrados',
    user_staff: 'Usuario / Personal',
    orders_today: 'Órdenes Hoy',
    generated_sales: 'Ventas Generadas',
    orders_made: 'Órdenes Realizadas',
    avg_ticket: 'Ticket Promedio',
    active_staff: 'Personal Activo',
    on_shift: 'en turno',
    
    // Upgrade
    pro_exclusive: 'Módulo Exclusivo 👑 PRO'
  },
  en: {
    // Nav & General
    dashboard: 'Dashboard',
    menu_catalog: 'Menu Catalog',
    tables_catalog: 'Tables Catalog',
    users: 'Users & Staff',
    settings: 'Settings',
    management: 'Management',
    back_to_pos: 'Back to login',
    welcome: 'Welcome',
    cancel: 'Cancel',
    login: 'Log In',
    logout: 'Log Out',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search...',
    loading: 'Loading system...',
    active: 'Active',
    inactive: 'Inactive',
    
    // Login
    select_user: 'Select your user to log in',
    pin_prompt: 'Enter your PIN',
    incorrect_pin: 'Incorrect PIN',
    demo_pin_tip: 'Demo Tip: PIN is',
    click_to_autocomplete: '(click to auto-fill)',
    error_fetching_companies: 'Error fetching companies',
    // Company Auth Modal
    saas_auth_title: 'SaaS Multi-Company Access',
    saas_auth_subtitle: 'Oleander Serve • Restaurant Management',
    company_login: 'Company Login',
    company_register: 'Register',
    company_email_user: 'Company Email or Username',
    company_email_placeholder: 'restaurant@example.com or oleander',
    password: 'Password',
    password_placeholder: '••••••••',
    try_demo_company: '⚡ Try Demo Company Instantly',
    login_to_company: 'Log into my Company',
    restaurant_name: 'Restaurant / Company Name',
    restaurant_name_placeholder: 'e.g. Tacos El Pastor',
    company_email: 'Company Email',
    company_email_new_placeholder: 'contact@restaurant.com',
    initial_admin_user: 'Initial Admin User:',
    initial_admin_desc: 'The <strong>Main Administrator</strong> user will be automatically created with the PIN code <span className="text-amber-400 font-bold">1234</span>.',
    register_my_company: 'Register my Company',
    error_login: 'Error logging in',
    error_register: 'Error registering company',
    change_company: 'Change Company',
    
    // Table Map
    table_map: 'Table Map',
    select_table_prompt: 'Select a table to take an order',
    kitchen: 'Kitchen',
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    table_short: 'TABLE',
    
    // Menu Area & Order Ticket
    order_ticket: 'Order Ticket',
    table: 'Table',
    subtotal: 'Subtotal',
    tax: 'Tax',
    total: 'Total',
    send_kitchen: 'Send to Kitchen',
    checkout: 'Checkout',
    add_note: 'Add Note',
    save_note: 'Save Note',
    notes: 'Preparation Notes',
    clear_order: 'Clear Order',
    update_qty: 'Quantity',
    
    // Kitchen
    kds_title: 'KDS - Kitchen Display',
    back_to_tables: 'Back to Tables',
    all: 'All',
    pending: 'Pending',
    preparing: 'Preparing',
    served: 'Served',
    start_prep: 'Start Prep',
    mark_ready: 'Mark as Ready!',
    archive_delivered: 'Archive / Delivered',

    // Order Ticket Extras
    current_order: 'Current Order',
    status: 'Status',
    in_kitchen: 'In Kitchen',
    modifying: 'Modifying',
    empty_order: 'The order is empty',
    select_products: 'Select products from the menu',
    no_image: 'No img',
    remove: 'Remove',
    
    // Kitchen Extras
    updated_at: 'Updated at',
    loading_orders: 'Loading orders...',
    no_active_orders: 'No active orders',
    new_orders_appear_here: 'New orders will appear here.',
    ready_to_serve: 'Ready to Serve',
    
    // Admin Extras
    catalogs: 'Catalogs',
    promotions_offers: 'Discounts & Offers',
    view_pro_benefits: 'View PRO Benefits',
    
    // Catalogs
    new_user: 'New User',
    name: 'Name',
    role: 'Role',
    admin: 'Administrator',
    waiter: 'Waiter',
    pin: 'Access PIN',
    
    new_item: 'New Item',
    category: 'Category',
    price: 'Price',
    upload_photo: '📁 Upload Photo',
    new_category: 'New Category',
    
    new_table: 'New Table',
    table_number: 'Table Number',
    capacity: 'Capacity',
    persons: 'people',
    
    // Menu Catalog Extras
    menu_catalog_desc: 'Manage dishes, prices and categories',
    dishes: 'Dishes',
    categories: 'Categories',
    product: 'Product',
    inventory_stock: 'Inventory Stock',
    actions: 'Actions',
    out_of_stock: 'Out of Stock',
    low_stock: 'Low Stock',
    in_stock: 'In Stock',
    id: 'ID',
    description: 'Description',
    active_f: 'Active',
    hidden: 'Hidden',
    edit_dish: 'Edit Dish',
    product_name: 'Product Name',
    price_usd: 'Price ($)',
    dish_photo: 'Dish Photo',
    paste_image_url: 'or paste an image URL...',
    edit_category: 'Edit Category',
    category_name: 'Category Name',

    // Users Catalog Extras
    staff_and_users: 'Staff and Users',
    manage_staff_desc: 'Manage system waiters and administrators',
    active_m: 'Active',
    inactive_m: 'Inactive',
    edit_user: 'Edit User',
    full_name: 'Full Name',
    pin_4_digits: 'PIN (4 digits)',

    // Tables Catalog Extras
    manage_tables_desc: 'Manage restaurant tables map',
    no_tables_registered: 'No tables registered.',
    edit_table: 'Edit Table',
    capacity_pax: 'Capacity (Pax)',
    status_auto_update: 'Status is usually updated automatically from the POS, but you can adjust it if there was an error.',
    confirm_delete_table: 'Are you sure to DELETE Table',
    confirm_delete_table_warning: '(This action cannot be undone and will fail if it has associated orders)',
    
    // Settings
    company_name: 'Company Name',
    currency: 'Currency (e.g. USD, EUR)',
    tax_rate: 'Tax Rate (%)',

    // Settings Extras
    settings_desc: 'Customize the visual identity, logo, currency and taxes of your company',
    settings_saved: 'Company configuration successfully saved!',
    company_identity: 'Company Identity',
    company_identity_desc: 'Official name and logo of your commercial establishment',
    pro_custom_brand: 'PRO Custom Brand',
    pro_custom_brand_desc: 'Logo, Address and Ticket Phrase customization require a 👑 PRO license.',
    company_name_label: 'Company / Restaurant Name',
    company_address_label: 'Store Address (for printed ticket)',
    ticket_footer_label: 'Farewell Phrase / Ticket Footer',
    freemium_locked: 'Locked in Freemium',
    default_language: 'Default Company Language',
    default_language_desc: 'Base language for all users of the company upon login',
    company_logo_label: 'Company Logo',
    upload_image_file: 'Upload image file',
    remove_logo: 'Remove Logo',
    logo_preview: 'Logo Preview',
    no_logo_uploaded: 'No logo uploaded',
    no_logo_desc: 'The default badge with your company name will be displayed.',
    your_company: 'Your Company',
    currency_and_taxes: 'Currency and Taxes',
    currency_and_taxes_desc: 'Select the currency and the applicable VAT / tax rate',
    symbol: 'Symbol',
    tax_rate_label: 'Tax Rate / VAT (%)',
    save_company_config: 'Save Company Configuration',
    image_too_large: 'Image is too large. Please select an image smaller than 2MB.',
    require_pro_address: '🔒 Requires PRO plan to add address',
    require_pro_ticket: '🔒 Requires PRO plan for custom ticket phrase',
    require_pro_url: '🔒 Requires PRO plan for logo URL',
    paste_logo_url: 'Or paste the direct URL of the logo (e.g. https://...)',
    
    // Dashboard
    today_sales: 'Today Sales',
    total_orders: 'Total Orders',
    active_customers: 'Active Customers',
    sales_trend: 'Sales Trend',
    top_products: 'Top Selling Products',
    
    // Dashboard Extras
    advanced_analytics: 'Advanced Analytics & Metrics',
    pro_dashboard_desc: 'Real-time operative summary, weekly trend charts, top dishes, and staff performance require the 👑 PRO plan.',
    upgrade_to_pro: 'Upgrade Plan to PRO',
    analytics_panel: 'Analytics Panel',
    exclusive_summary: 'Exclusive real-time operative summary',
    refresh_data: 'Refresh data',
    z_report: 'Z Report (Cash Close)',
    weekly_sales_trend: 'Weekly Sales Trend',
    income_behavior: 'Income behavior',
    last_7_days: 'Last 7 days',
    top_selling_dishes: 'Top Selling Dishes',
    no_dishes_sold: 'No dishes sold yet',
    no_dishes_desc: 'Make orders in the POS to see your top dishes here.',
    staff_performance: 'Staff Performance',
    no_users_registered: 'No registered users',
    user_staff: 'User / Staff',
    orders_today: 'Orders Today',
    generated_sales: 'Generated Sales',
    orders_made: 'Orders Made',
    avg_ticket: 'Average Ticket',
    active_staff: 'Active Staff',
    on_shift: 'on shift',
    
    // Upgrade
    pro_exclusive: 'Exclusive Module 👑 PRO'
  },
  pt: {
    // Nav & General
    dashboard: 'Painel',
    menu_catalog: 'Catálogo de Menu',
    tables_catalog: 'Catálogo de Mesas',
    users: 'Usuários e Equipe',
    settings: 'Configurações',
    management: 'Gestão',
    back_to_pos: 'Voltar ao login',
    welcome: 'Bem-vindo',
    cancel: 'Cancelar',
    login: 'Entrar',
    logout: 'Sair',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    search: 'Buscar...',
    loading: 'Carregando o sistema...',
    active: 'Ativo',
    inactive: 'Inativo',
    
    // Login
    select_user: 'Selecione seu usuário para entrar',
    pin_prompt: 'Digite seu PIN',
    incorrect_pin: 'PIN Incorreto',
    demo_pin_tip: 'Dica Demo: O PIN é',
    click_to_autocomplete: '(clique para preencher)',
    error_fetching_companies: 'Erro ao buscar empresas',
    // Company Auth Modal
    saas_auth_title: 'Acesso Multi-Empresa SaaS',
    saas_auth_subtitle: 'Oleander Serve • Gestão de Restaurantes',
    company_login: 'Acesso Empresa',
    company_register: 'Inscrever-se',
    company_email_user: 'Email ou Usuário da Empresa',
    company_email_placeholder: 'restaurante@exemplo.com ou oleander',
    password: 'Senha',
    password_placeholder: '••••••••',
    try_demo_company: '⚡ Experimentar Empresa Demo Instantaneamente',
    login_to_company: 'Entrar na minha Empresa',
    restaurant_name: 'Nome do Restaurante / Empresa',
    restaurant_name_placeholder: 'ex. Tacos El Pastor',
    company_email: 'Email da Empresa',
    company_email_new_placeholder: 'contato@restaurante.com',
    initial_admin_user: 'Usuário Administrador Inicial:',
    initial_admin_desc: 'O usuário <strong>Administrador Principal</strong> será criado automaticamente com o código PIN <span className="text-amber-400 font-bold">1234</span>.',
    register_my_company: 'Registrar minha Empresa',
    error_login: 'Erro ao entrar',
    error_register: 'Erro ao registrar empresa',
    change_company: 'Mudar Empresa',
    
    // Table Map
    table_map: 'Mapa de Mesas',
    select_table_prompt: 'Selecione uma mesa para o pedido',
    kitchen: 'Cozinha',
    available: 'Disponível',
    occupied: 'Ocupada',
    reserved: 'Reservada',
    table_short: 'MESA',
    
    // Menu Area & Order Ticket
    order_ticket: 'Comanda',
    table: 'Mesa',
    subtotal: 'Subtotal',
    tax: 'Imposto',
    total: 'Total',
    send_kitchen: 'Enviar à Cozinha',
    checkout: 'Cobrar Conta',
    add_note: 'Adic. Nota',
    save_note: 'Salvar Nota',
    notes: 'Notas de Preparo',
    clear_order: 'Limpar Pedido',
    update_qty: 'Quantidade',
    
    // Kitchen
    kds_title: 'KDS - Monitor da Cozinha',
    back_to_tables: 'Voltar às Mesas',
    all: 'Todos',
    pending: 'Pendentes',
    preparing: 'Preparando',
    served: 'Prontos',
    start_prep: 'Iniciar Preparo',
    mark_ready: 'Marcar como Pronto!',
    archive_delivered: 'Arquivar / Entregue',

    // Order Ticket Extras
    current_order: 'Pedido Atual',
    status: 'Status',
    in_kitchen: 'Na Cozinha',
    modifying: 'Modificando',
    empty_order: 'O pedido está vazio',
    select_products: 'Selecione produtos do menu',
    no_image: 'Sem img',
    remove: 'Remover',
    
    // Kitchen Extras
    updated_at: 'Atualizado às',
    loading_orders: 'Carregando comandas...',
    no_active_orders: 'Sem comandas ativas',
    new_orders_appear_here: 'Novos pedidos aparecerão aqui.',
    ready_to_serve: 'Pronto para Servir',
    
    // Admin Extras
    catalogs: 'Catálogos',
    promotions_offers: 'Descontos e Ofertas',
    view_pro_benefits: 'Ver Benefícios PRO',
    
    // Catalogs
    new_user: 'Novo Usuário',
    name: 'Nome',
    role: 'Papel',
    admin: 'Administrador',
    waiter: 'Garçom',
    pin: 'PIN de Acesso',
    
    new_item: 'Novo Item',
    category: 'Categoria',
    price: 'Preço',
    upload_photo: '📁 Carregar Foto',
    new_category: 'Nova Categoria',
    
    new_table: 'Nova Mesa',
    table_number: 'Número da Mesa',
    capacity: 'Capacidade',
    persons: 'pessoas',
    
    // Menu Catalog Extras
    menu_catalog_desc: 'Gerenciar pratos, preços e categorias',
    dishes: 'Pratos',
    categories: 'Categorias',
    product: 'Produto',
    inventory_stock: 'Estoque',
    actions: 'Ações',
    out_of_stock: 'Esgotado',
    low_stock: 'Estoque Baixo',
    in_stock: 'Em Estoque',
    id: 'ID',
    description: 'Descrição',
    active_f: 'Ativa',
    hidden: 'Oculta',
    edit_dish: 'Editar Prato',
    product_name: 'Nome do Produto',
    price_usd: 'Preço ($)',
    dish_photo: 'Foto do Prato',
    paste_image_url: 'ou cole uma URL de imagem...',
    edit_category: 'Editar Categoria',
    category_name: 'Nome da Categoria',

    // Users Catalog Extras
    staff_and_users: 'Equipe e Usuários',
    manage_staff_desc: 'Gerenciar garçons e administradores do sistema',
    active_m: 'Ativo',
    inactive_m: 'Inativo',
    edit_user: 'Editar Usuário',
    full_name: 'Nome Completo',
    pin_4_digits: 'PIN (4 dígitos)',

    // Tables Catalog Extras
    manage_tables_desc: 'Gerenciar mapa de mesas do restaurante',
    no_tables_registered: 'Nenhuma mesa registrada.',
    edit_table: 'Editar Mesa',
    capacity_pax: 'Capacidade (Pax)',
    status_auto_update: 'O status geralmente é atualizado automaticamente a partir do PDV, mas você pode ajustá-lo se houver um erro.',
    confirm_delete_table: 'Tem certeza de que deseja EXCLUIR a Mesa',
    confirm_delete_table_warning: '(Esta ação não pode ser desfeita e falhará se houver pedidos associados)',
    
    // Settings
    company_name: 'Nome da Empresa',
    currency: 'Moeda (ex: BRL, EUR)',
    tax_rate: 'Taxa de Imposto (%)',

    // Settings Extras
    settings_desc: 'Personalize a identidade visual, logotipo, moeda e impostos da sua empresa',
    settings_saved: 'Configuração da empresa salva com sucesso!',
    company_identity: 'Identidade da Empresa',
    company_identity_desc: 'Nome oficial e logotipo do seu estabelecimento comercial',
    pro_custom_brand: 'Marca Personalizada PRO',
    pro_custom_brand_desc: 'A personalização do Logotipo, Endereço e Frase do Ticket requer uma licença 👑 PRO.',
    company_name_label: 'Nome da Empresa / Restaurante',
    company_address_label: 'Endereço do Estabelecimento (para ticket impresso)',
    ticket_footer_label: 'Frase de Despedida / Legenda para Ticket Impresso',
    freemium_locked: 'Bloqueado no Freemium',
    default_language: 'Idioma Padrão da Empresa',
    default_language_desc: 'Idioma base para todos os usuários da empresa ao iniciar a sessão',
    company_logo_label: 'Logotipo da Empresa',
    upload_image_file: 'Carregar arquivo de imagem',
    remove_logo: 'Remover Logotipo',
    logo_preview: 'Visualização do Logotipo',
    no_logo_uploaded: 'Nenhum logotipo carregado',
    no_logo_desc: 'O distintivo padrão com o nome da sua empresa será exibido.',
    your_company: 'Sua Empresa',
    currency_and_taxes: 'Moeda e Impostos',
    currency_and_taxes_desc: 'Selecione a moeda e a taxa de IVA / imposto aplicável',
    symbol: 'Símbolo',
    tax_rate_label: 'Taxa de Imposto / IVA (%)',
    save_company_config: 'Salvar Configuração da Empresa',
    image_too_large: 'A imagem é muito grande. Por favor, selecione uma imagem menor que 2MB.',
    require_pro_address: '🔒 Requer plano PRO para adicionar endereço',
    require_pro_ticket: '🔒 Requer plano PRO para frase de ticket personalizada',
    require_pro_url: '🔒 Requer plano PRO para URL do logotipo',
    paste_logo_url: 'Ou cole a URL direta do logotipo (ex: https://...)',
    
    // Dashboard
    today_sales: 'Vendas de Hoje',
    total_orders: 'Pedidos Iniciais',
    active_customers: 'Clientes Ativos',
    sales_trend: 'Tendência de Vendas',
    top_products: 'Produtos Mais Vendidos',
    
    // Dashboard Extras
    advanced_analytics: 'Análise e Métricas Avançadas',
    pro_dashboard_desc: 'O resumo operacional em tempo real, gráficos de tendência semanal, pratos estrela e desempenho por garçom requerem o plano 👑 PRO.',
    upgrade_to_pro: 'Faça upgrade para PRO',
    analytics_panel: 'Painel de Análise',
    exclusive_summary: 'Resumo operacional exclusivo em tempo real',
    refresh_data: 'Atualizar dados',
    z_report: 'Fechamento de Caixa (Relatório Z)',
    weekly_sales_trend: 'Tendência de Vendas Semanais',
    income_behavior: 'Comportamento da renda',
    last_7_days: 'Últimos 7 dias',
    top_selling_dishes: 'Pratos Mais Vendidos',
    no_dishes_sold: 'Nenhum prato vendido ainda',
    no_dishes_desc: 'Faça pedidos no PDV para ver seus pratos estrela aqui.',
    staff_performance: 'Desempenho da Equipe',
    no_users_registered: 'Nenhum usuário registrado',
    user_staff: 'Usuário / Equipe',
    orders_today: 'Pedidos Hoje',
    generated_sales: 'Vendas Geradas',
    orders_made: 'Pedidos Realizados',
    avg_ticket: 'Ticket Médio',
    active_staff: 'Equipe Ativa',
    on_shift: 'em turno',
    
    // Upgrade
    pro_exclusive: 'Módulo Exclusivo 👑 PRO'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { company } = useCompany();
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'es');

  useEffect(() => {
    if (company?.default_language && !localStorage.getItem('lang')) {
      setLanguage(company.default_language);
    }
  }, [company?.default_language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const t = (key) => {
    return translations[language][key] || translations['es'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
