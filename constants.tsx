import React from 'react';
import { Page, Report } from './types';
import { HomeIcon, FilePlusIcon, TruckIcon, BarChartIcon, SettingsIcon, ReceiptIcon, TagIcon, UsersIcon, BuildingOfficeIcon, ListBulletIcon, CreditCardIcon, BookOpenIcon, ArchiveBoxIcon, ShieldCheckIcon, WrenchScrewdriverIcon, BriefcaseIcon } from './components/icons/Icons';

interface NavItem {
    id: Page;
    label: string;
    icon: React.ElementType;
    permissionKey: string; 
    description?: string;
    colorVariant?: 'blue' | 'green' | 'purple' | 'orange';
}

export const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, permissionKey: 'dashboard.view' },
    { id: 'shipping-guide', label: 'Crear Factura', icon: FilePlusIcon, permissionKey: 'shipping-guide.view' },
    { id: 'invoices', label: 'Facturas', icon: ReceiptIcon, permissionKey: 'invoices.view' },
    { id: 'clientes', label: 'Clientes', icon: UsersIcon, permissionKey: 'clientes.view' },
    { id: 'proveedores', label: 'Proveedores', icon: BriefcaseIcon, permissionKey: 'proveedores.view' },
    { id: 'flota', label: 'Flota y Remesas', icon: TruckIcon, permissionKey: 'flota.view' },
    { id: 'libro-contable', label: 'Libro Contable', icon: BookOpenIcon, permissionKey: 'libro-contable.view' },
    { id: 'inventario', label: 'Inventario', icon: ArchiveBoxIcon, permissionKey: 'inventario.view' },
    { id: 'reports', label: 'Reportes', icon: BarChartIcon, permissionKey: 'reports.view' },
    { id: 'system', label: 'Sistema', icon: WrenchScrewdriverIcon, permissionKey: 'system.view' },
    { id: 'auditoria', label: 'Auditoría', icon: ShieldCheckIcon, permissionKey: 'auditoria.view' },
    { id: 'configuracion', label: 'Configuración', icon: SettingsIcon, permissionKey: 'configuracion.view' },
];

export const CONFIG_SUB_NAV_ITEMS: NavItem[] = [
    { 
        id: 'categories', 
        label: 'Categorías de Mercancía', 
        icon: TagIcon, 
        permissionKey: 'categories.view',
        description: 'Define los tipos de mercancía que se transportan.',
        colorVariant: 'orange'
    },
    { 
        id: 'offices', 
        label: 'Oficinas y Sucursales', 
        icon: BuildingOfficeIcon, 
        permissionKey: 'offices.view',
        description: 'Gestiona las sucursales y puntos de operación.',
        colorVariant: 'blue'
    },
    { 
        id: 'shipping-types', 
        label: 'Tipos de Envío', 
        icon: ListBulletIcon, 
        permissionKey: 'shipping-types.view',
        description: 'Configura las modalidades de envío disponibles.',
        colorVariant: 'purple'
    },
    { 
        id: 'payment-methods', 
        label: 'Formas de Pago', 
        icon: CreditCardIcon, 
        permissionKey: 'payment-methods.view',
        description: 'Administra cuentas bancarias y métodos de pago.',
        colorVariant: 'green'
    },
];


export const SYSTEM_REPORTS: Report[] = [
    { id: 'general_envios', title: 'Reporte General de Envíos' },
    { id: 'libro_venta', title: 'Reporte de Libro de Venta' },
    { id: 'cuentas_cobrar', title: 'Reporte de Cuentas por Cobrar' },
    { id: 'cuentas_pagar', title: 'Reporte de Cuentas por Pagar (Gastos)' },
    { id: 'ipostel', title: 'Reporte de Aporte IPOSTEL' },
    { id: 'seguro', title: 'Reporte de Cobro de Seguro' },
    { id: 'clientes', title: 'Reporte de Movimiento de Clientes' },
    { id: 'envios_oficina', title: 'Reporte de Productividad por Oficina' },
    { id: 'gastos_oficina', title: 'Reporte de Gastos por Oficina' },
    { id: 'facturas_anuladas', title: 'Reporte de Facturas Anuladas' },
    { id: 'iva', title: 'Reporte de I.V.A. (Débito y Crédito Fiscal)' },
    { id: 'cuadre_caja', title: 'Reporte de Cuadre de Caja' },
    { id: 'reporte_kilogramos', title: 'Reporte de Kilogramos Movilizados' },
    { id: 'reporte_envios_vehiculo', title: 'Reporte de Envíos por Vehículo' },
];

export const OFFICES: string[] = ['Caracas - San Agustín', 'Valencia - San Blas', 'Barquisimeto - Centro'];
