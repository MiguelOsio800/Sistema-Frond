import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/dashboard/DashboardView';
import InvoicesView from './components/invoices/InvoicesView';
import ReportsView from './components/reports/ReportsView';
import { Page, Report } from './types';
import ShippingGuideView from './components/shipping-guide/ShippingGuideView';
import EditInvoiceView from './components/invoices/EditInvoiceView';
import FlotaView from './components/flota/FlotaView';
import ConfiguracionView from './components/configuracion/ConfiguracionView';
import CategoryView from './components/categories/CategoryView';
import ReportDetailView from './components/reports/ReportDetailView';
import ClientsView from './components/clients/ClientsView';
import OfficesView from './components/offices/OfficesView';
import ShippingTypesView from './components/shipping-types/ShippingTypesView';
import PaymentMethodsView from './components/payment-methods/PaymentMethodsView';
import { SYSTEM_REPORTS } from './constants';
import LibroContableView from './components/libro-contable/LibroContableView';
import InventarioView from './components/inventario/InventarioView';
import InventarioLandingView from './components/inventario/InventarioLandingView';
import BienesView from './components/inventario/BienesView';
import AuditLogView from './components/auditoria/AuditLogView';
import SystemView from './components/system/SystemView';
import BienesCategoryView from './components/inventario/BienesCategoryView';
import SuppliersView from './components/proveedores/SuppliersView';

import AppProviders from './contexts/AppProviders';
import { useAuth } from './contexts/AuthContext';
import { useConfig } from './contexts/ConfigContext';
import { useData } from './contexts/DataContext';
import { useSystem } from './contexts/SystemContext';
import LoginPage from './src/pages/LoginPage'; // Importamos la página de Login

const AppContent: React.FC = () => {
    // Obtenemos el usuario y la función de logout del AuthContext REAL
    const { user: currentUser, logout: handleLogout } = useAuth();
    
    // Obtenemos el resto de la configuración y los datos de sus respectivos contextos
    const { 
        companyInfo, users, roles, offices, categories, shippingTypes, paymentMethods, 
        expenseCategories, userPermissions,
        handleCompanyInfoSave, handleSaveUser, onDeleteUser, handleSaveRole, onDeleteRole, 
        onUpdateRolePermissions, handleSaveCategory, onDeleteCategory, handleSaveOffice,
        onDeleteOffice, handleSaveShippingType, onDeleteShippingType, handleSavePaymentMethod, 
        onDeletePaymentMethod, handleSaveExpenseCategory, onDeleteExpenseCategory
    } = useConfig();
    const {
        invoices, clients, suppliers, vehicles, expenses, inventory, assets, assetCategories,
        handleSaveClient, handleDeleteClient, handleSaveSupplier, handleDeleteSupplier,
        handleSaveInvoice, handleUpdateInvoice, handleUpdateInvoiceStatuses, handleDeleteInvoice,
        handleSaveVehicle, handleDeleteVehicle, handleAssignToVehicle, handleUnassignInvoice,
        handleDispatchVehicle, onUndoDispatch, handleFinalizeTrip, handleSaveExpense,
        handleDeleteExpense, handleSaveAsset, handleDeleteAsset, handleSaveAssetCategory,
        handleDeleteAssetCategory, setInvoices, setExpenses
    } = useData();
    const { auditLog, appErrors, setAppErrors } = useSystem();

    // El resto del estado local y la lógica de tu componente se mantienen
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
    const [viewingReport, setViewingReport] = useState<Report | null>(null);
    const [inventoryFilter, setInventoryFilter] = useState<string | null>(null);
    const [invoiceFilter, setInvoiceFilter] = useState<{ type: string, value: string } | null>(null);

    const filteredInvoices = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.roleId === 'role-admin' || currentUser.roleId === 'role-tech' || !currentUser.officeId) {
            return invoices;
        }
        return invoices.filter(invoice => invoice.guide.originOfficeId === currentUser.officeId);
    }, [invoices, currentUser]);

    const filteredExpenses = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.roleId === 'role-admin' || currentUser.roleId === 'role-tech' || !currentUser.officeId) {
            return expenses;
        }
        return expenses.filter(expense => expense.officeId === currentUser.officeId);
    }, [expenses, currentUser]);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            const [page, param] = hash.split('/');
            
            // ... (Toda tu lógica de manejo de hash se mantiene intacta)
            // ... (He omitido el bloque largo por brevedad, pero debe estar aquí)
            
            const validPages: Page[] = ['dashboard', 'shipping-guide', 'invoices', 'flota', 'reports', 'configuracion', 'categories', 'edit-invoice', 'report-detail', 'clientes', 'proveedores', 'offices', 'shipping-types', 'payment-methods', 'libro-contable', 'inventario', 'auditoria', 'inventario-bienes', 'inventario-envios', 'bienes-categorias', 'system'];
            if (validPages.includes(page as Page)) {
                setCurrentPage(page as Page);
            } else {
                setCurrentPage('dashboard');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    const renderPage = () => {
        // ... (Tu función renderPage se mantiene intacta)
        if (!currentUser) return null;
        switch (currentPage) {
            case 'dashboard': return <DashboardView invoices={filteredInvoices} vehicles={vehicles} companyInfo={companyInfo} offices={offices} />;
            // ... resto de los cases
            default:
                return <DashboardView invoices={filteredInvoices} vehicles={vehicles} companyInfo={companyInfo} offices={offices} />;
        }
    };
    
    // Este componente ahora SIEMPRE renderiza la app principal,
    // porque la decisión de si mostrarlo o no se toma fuera.
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Sidebar currentPage={currentPage} onLogout={handleLogout} permissions={userPermissions} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} companyInfo={companyInfo} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header currentPage={currentPage} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} companyInfo={companyInfo} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        {renderPage()}
                    </div>
                </main>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    // El componente App ahora simplemente envuelve al controlador de autenticación
    return (
        <AppProviders>
            <AuthWrapper />
        </AppProviders>
    );
};

// Este componente decide qué mostrar: el login o la app
const AuthWrapper: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Verificando sesión...</div>;
    }

    // Si no hay usuario, muestra la LoginPage. Si hay, muestra el AppContent.
    return user ? <AppContent /> : <LoginPage />;
};


export default App;

