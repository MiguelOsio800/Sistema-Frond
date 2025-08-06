import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginView from './components/auth/LoginView';
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
import { useToast } from './components/ui/ToastProvider';

const AppContent: React.FC = () => {
    // CAMBIO 1: Obtenemos el usuario real y las funciones 'login' y 'logout' del AuthContext
    const { user: currentUser, login, logout: handleLogout, loading } = useAuth();
    
    // CAMBIO 2: Ya no necesitamos 'handleLogin' de useConfig
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
    const { addToast } = useToast();

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
        if (!currentUser) return; // Se cambió 'isAuthenticated' por 'currentUser'

        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            const [page, param, subParam, ...filterValueParts] = hash.split('/');
            const filterValue = filterValueParts.join('/');
            
            const validPages: Page[] = ['dashboard', 'shipping-guide', 'invoices', 'flota', 'reports', 'configuracion', 'categories', 'edit-invoice', 'report-detail', 'clientes', 'proveedores', 'offices', 'shipping-types', 'payment-methods', 'libro-contable', 'inventario', 'auditoria', 'inventario-bienes', 'inventario-envios', 'bienes-categorias', 'system'];
            
            setEditingInvoiceId(null);
            setViewingReport(null);
            setInventoryFilter(null);
            setInvoiceFilter(null);

            if (page === 'invoices' && param === 'filter' && subParam && filterValue) {
                setInvoiceFilter({ type: subParam, value: decodeURIComponent(filterValue) });
                setCurrentPage('invoices');
            } else if (page === 'inventario-envios' && param) {
                setInventoryFilter(param);
                setCurrentPage('inventario-envios');
            } else if (validPages.includes(page as Page)) {
                 if(page === 'edit-invoice' && param) {
                    setEditingInvoiceId(param);
                }
                 if(page === 'report-detail' && param) {
                    setViewingReport(SYSTEM_REPORTS.find(r => r.id === param) || null);
                }
                setCurrentPage(page as Page);
            } else {
                setCurrentPage('dashboard');
                window.location.hash = 'dashboard';
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [currentUser]); // Se cambió 'isAuthenticated' por 'currentUser'

    
    const renderPage = () => {
        if (!currentUser) return null;
        // ... (Tu función renderPage se mantiene exactamente igual)
        switch (currentPage) {
            case 'dashboard': return <DashboardView invoices={filteredInvoices} vehicles={vehicles} companyInfo={companyInfo} offices={offices} />;
            case 'shipping-guide': return <ShippingGuideView onSaveInvoice={handleSaveInvoice} categories={categories} clients={clients} offices={offices} shippingTypes={shippingTypes} paymentMethods={paymentMethods} companyInfo={companyInfo} currentUser={currentUser} />;
            case 'edit-invoice':
                const invoiceToEdit = invoices.find(inv => inv.id === editingInvoiceId);
                return invoiceToEdit ? <EditInvoiceView invoice={invoiceToEdit} onSaveInvoice={handleUpdateInvoice} categories={categories} clients={clients} offices={offices} shippingTypes={shippingTypes} paymentMethods={paymentMethods} companyInfo={companyInfo} currentUser={currentUser} /> : <div>Factura no encontrada</div>;
            case 'invoices': return <InvoicesView invoices={filteredInvoices} clients={clients} categories={categories} userPermissions={userPermissions} onUpdateStatuses={handleUpdateInvoiceStatuses} onDeleteInvoice={handleDeleteInvoice} companyInfo={companyInfo} initialFilter={invoiceFilter} />;
            case 'flota': return <FlotaView vehicles={vehicles} invoices={filteredInvoices} offices={offices} clients={clients} onAssignToVehicle={handleAssignToVehicle} onUnassignInvoice={handleUnassignInvoice} onSaveVehicle={handleSaveVehicle} onDeleteVehicle={handleDeleteVehicle} permissions={userPermissions} companyInfo={companyInfo} onDispatchVehicle={handleDispatchVehicle} onFinalizeTrip={handleFinalizeTrip} onUndoDispatch={onUndoDispatch} />;
            case 'reports': return <ReportsView reports={SYSTEM_REPORTS} />;
            case 'report-detail': 
                return viewingReport ? <ReportDetailView report={viewingReport} invoices={invoices} clients={clients} expenses={expenses} offices={offices} companyInfo={companyInfo} paymentMethods={paymentMethods} vehicles={vehicles} categories={categories} /> : <div>Reporte no encontrado</div>;
            case 'categories': return <CategoryView categories={categories} onSave={handleSaveCategory} onDelete={onDeleteCategory} permissions={userPermissions} />;
            case 'clientes': return <ClientsView clients={clients} onSave={handleSaveClient} onDelete={handleDeleteClient} permissions={userPermissions} />;
            case 'proveedores': return <SuppliersView suppliers={suppliers} onSave={handleSaveSupplier} onDelete={handleDeleteSupplier} permissions={userPermissions} />;
            case 'offices': return <OfficesView offices={offices} onSave={handleSaveOffice} onDelete={onDeleteOffice} permissions={userPermissions} />;
            case 'shipping-types': return <ShippingTypesView shippingTypes={shippingTypes} onSave={handleSaveShippingType} onDelete={onDeleteShippingType} permissions={userPermissions} />;
            case 'payment-methods': return <PaymentMethodsView paymentMethods={paymentMethods} onSave={handleSavePaymentMethod} onDelete={onDeletePaymentMethod} permissions={userPermissions} />;
            case 'libro-contable': return <LibroContableView invoices={filteredInvoices} expenses={filteredExpenses} expenseCategories={expenseCategories} onSaveExpense={handleSaveExpense} onDeleteExpense={handleDeleteExpense} onSaveExpenseCategory={handleSaveExpenseCategory} onDeleteExpenseCategory={onDeleteExpenseCategory} permissions={userPermissions} offices={offices} currentUser={currentUser} paymentMethods={paymentMethods} companyInfo={companyInfo} suppliers={suppliers} />;
            case 'inventario': return <InventarioLandingView permissions={userPermissions} />;
            case 'inventario-envios': return <InventarioView items={inventory} permissions={userPermissions} filter={inventoryFilter} />;
            case 'inventario-bienes': return <BienesView assets={assets} onSave={handleSaveAsset} onDelete={handleDeleteAsset} permissions={userPermissions} offices={offices} assetCategories={assetCategories} />;
            case 'bienes-categorias': return <BienesCategoryView categories={assetCategories} onSave={handleSaveAssetCategory} onDelete={handleDeleteAssetCategory} permissions={userPermissions} />;
            case 'auditoria': return <AuditLogView auditLog={auditLog} users={users} />;
            case 'system': return ( <SystemView appErrors={appErrors} setAppErrors={setAppErrors} addToast={addToast} invoices={invoices} setInvoices={setInvoices} vehicles={vehicles} expenses={expenses} setExpenses={setExpenses} offices={offices} permissions={userPermissions} /> );
            case 'configuracion': return ( <ConfiguracionView companyInfo={companyInfo} onCompanyInfoSave={handleCompanyInfoSave} users={users} roles={roles} offices={offices} onSaveUser={handleSaveUser} onDeleteUser={onDeleteUser} permissions={userPermissions} currentUser={currentUser} onSaveRole={handleSaveRole} onDeleteRole={onDeleteRole} onUpdateRolePermissions={onUpdateRolePermissions} /> );
            default: return <DashboardView invoices={filteredInvoices} vehicles={vehicles} companyInfo={companyInfo} offices={offices} />;
        }
    };

    // CAMBIO 3: Lógica final para decidir qué renderizar, dentro del mismo componente
    if (loading) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Verificando sesión...</div>;
    }

    if (!currentUser) {
        // Creamos la función de login aquí mismo, usando la función 'login' del AuthContext
        const handleApiLogin = async (username: string, password: string, rememberMe: boolean) => {
            try {
                await login(username, password); // Llama a la función del AuthContext
                if (rememberMe) localStorage.setItem('rememberedUser', username);
                else localStorage.removeItem('rememberedUser');
            } catch (error) {
                addToast({ type: 'error', title: 'Error de Autenticación', message: 'Usuario o contraseña incorrectos.' });
            }
        };
        // Y se la pasamos a tu LoginView original
        return <LoginView onLogin={handleApiLogin} users={users} companyInfo={companyInfo} />;
    }

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

const App: React.FC = () => (
    <AppProviders>
        <AppContent />
    </AppProviders>
);

export default App;