import { Invoice, ShippingGuide, Client, Merchandise, Category, User, Vehicle, CompanyInfo, Role, Permissions, Product, Office, ShippingType, PaymentMethod, Expense, InventoryItem, ExpenseCategory, Asset, AssetCategory, Supplier } from './types';
import { calculateFinancialDetails } from './utils/financials';

// --- Helper Functions for Data Generation ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generateRandomDate = (start: Date, end: Date): string => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() * start.getTime()));
    return date.toISOString().split('T')[0];
};

// From Document: Transporte Alianza 2.025 C.A.
export const DUMMY_COMPANY_INFO: CompanyInfo = {
    name: 'Transporte Alianza 2025 C.A.',
    rif: 'J-506936488',
    address: 'Calle este 8 bis, entre las esquinas de salón y horcones, parroquia Santa Rosalía, San Agustín del Norte, Caracas',
    phone: '04147347409',
    logoUrl: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJhenVyZUxvZ29HcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzYjgyZjY7IiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxZDBlYTg7IiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHBhdGggZD0iTTMwIDQwIEEgMjAgMjAgMCAwIDAgNzAgNDAgTCA3MCA2MCBBIDIwIDIwIDAgMCAxIDMwIDYwIFoiIGZpbGw9InVybCgjYXp1cmVMb2dvR3JhZGllbnQpIiAvPgogIDxwYXRoIGQ9Ik01MCAyMCBBIDIwIDIwIDAgMCAxIDkwIDIwIEwgOTAgNjAgQSAyMCAyMCAwIDAgMCA1MCA2MCBaIiBmaWxsPSIjOWNjNmZjIiBvcGFjaXR5PSIwLjciIC8+CiAgPHRleHQgeD0iMTAwIiB5PSI1MiIgc3R5bGU9ImZvbnQ6IGJvbGQgMjRweCBzYW5zLXNlcmlmO2ZpbGw6IzFlNDBhZjsiPlRyYW5zcG9ydGUgQWxpYW56YTwvdGV4dD4KPC9zdmc+`,
    loginImageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb122c2a6?q=80&w=2070&auto=format&fit=crop',
    costPerKg: 12,
    bcvRate: 36.58,
    postalLicense: '1010-A',
};

export const initialOffices: Office[] = [
    { id: 'off-1', name: 'Caracas - Sede Principal', address: 'Calle 8 Bis, Salon Horcones, San Agustin del Norte, Dtto. Capital', phone: '04247488737' },
    { id: 'off-2', name: 'San Cristóbal - Táchira', address: 'C.C. Mercado Metropolitano, Urb. Juan de Maldonado, San Cristobal', phone: '04147347409' },
    { id: 'off-3', name: 'Barquisimeto - Lara', address: 'Carrera 16 entre Calles 32 y 33, Iribarren, Lara', phone: '04141757374' },
];

export const initialShippingTypes: ShippingType[] = [
    { id: 'st-1', name: 'Básico' },
    { id: 'st-2', name: 'Especial' },
    { id: 'st-3', name: 'Expreso' },
    { id: 'st-4', name: 'Masivo' },
];

export const initialPaymentMethods: PaymentMethod[] = [
     { 
        id: 'pm-1', 
        name: 'Transferencia Bancaria', 
        type: 'Transferencia',
        bankName: 'Banco de Venezuela',
        accountNumber: 'N/A',
        accountType: 'corriente',
        beneficiaryName: 'Transporte Alianza 2025 C.A.',
        beneficiaryId: 'J-506936488',
    },
    { 
        id: 'pm-2', 
        name: 'Pago Móvil',
        type: 'PagoMovil',
        bankName: 'Banco de Venezuela',
        phone: '04147347409',
        beneficiaryName: 'Transporte Alianza 2025 C.A.',
        beneficiaryId: 'J-506936488',
    },
    { id: 'pm-3', name: 'Punto de Venta', type: 'Otro'},
    { id: 'pm-4', name: 'Crédito 15 días', type: 'Credito'},
];

// --- DATA FROM DOCUMENT ---
export const initialClients: Client[] = [
    { id: 'client-1', idNumber: 'J-40017803-7', name: 'RODAMIENTO MANGUERAS BARINAS, C.A', clientType: 'empresa', phone: '', address: 'Barinas' },
    { id: 'client-2', idNumber: 'J-29766963-9', name: 'FABRICA DE CINTAS Y TEXTILES AJL, C.A.', clientType: 'empresa', phone: '', address: 'Caracas' },
    { id: 'client-3', idNumber: 'J-40758960-1', name: 'INVERSIONES LOS GUERREROS 88 C.A.', clientType: 'empresa', phone: '', address: 'Valencia' },
    { id: 'client-4', idNumber: 'J-29409453-8', name: 'FABRICA SOLOCUERO MILENIUM 2025, C.A.', clientType: 'empresa', phone: '', address: 'Barquisimeto' },
    { id: 'client-5', idNumber: 'J-00284427-2', name: 'INDUSTRIA ELECTRONICA GALLIUM C.A', clientType: 'empresa', phone: '', address: 'Caracas'},
];

export const initialCategories: Category[] = [
    { id: 'cat-1', name: 'Rodamientos y Mangueras' },
    { id: 'cat-2', name: 'Telas y Textiles' },
    { id: 'cat-3', name: 'Bisutería' },
    { id: 'cat-4', name: 'Artículos de Cuero' },
    { id: 'cat-5', name: 'Computación y Electrónica' },
];

// --- PERMISSIONS RESTRUCTURE ---

// Define all possible granular permissions in the system
export const ALL_PERMISSION_KEYS = [
    // Dashboard
    'dashboard.view',
    // Shipping Guide (Invoice Creation)
    'shipping-guide.view',
    // Invoices
    'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.void', 'invoices.delete', 'invoices.changeStatus',
    // Clients
    'clientes.view', 'clientes.create', 'clientes.edit', 'clientes.delete',
    // Suppliers
    'proveedores.view', 'proveedores.create', 'proveedores.edit', 'proveedores.delete',
    // Fleet
    'flota.view', 'flota.create', 'flota.edit', 'flota.delete', 'flota.dispatch',
    // Accounting
    'libro-contable.view', 'libro-contable.create', 'libro-contable.edit', 'libro-contable.delete',
    // Inventory
    'inventario.view',
    'inventario-envios.view',
    'inventario-bienes.view', 'inventario-bienes.create', 'inventario-bienes.edit', 'inventario-bienes.delete',
    'bienes-categorias.view', 'bienes-categorias.create', 'bienes-categorias.edit', 'bienes-categorias.delete',
    // Reports
    'reports.view',
    // System & Audit
    'system.view', 'system.cleanup', 'system.backupRestore',
    'auditoria.view',
    // Configuration
    'configuracion.view',
    'config.company.edit',
    'config.users.manage',
    'config.roles.manage',
    // Specific user management permissions
    'config.users.edit_protected', // Can edit 'tecnologia', 'cooperativa'
    'config.users.manage_tech_users', // Can edit/delete users with 'Soporte Técnico' role
    // Parameters (sub-config pages)
    'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
    'offices.view', 'offices.create', 'offices.edit', 'offices.delete',
    'shipping-types.view', 'shipping-types.create', 'shipping-types.edit', 'shipping-types.delete',
    'payment-methods.view', 'payment-methods.create', 'payment-methods.edit', 'payment-methods.delete',
];

const operatorPermissions: Permissions = {
    'dashboard.view': true,
    'shipping-guide.view': true,
    'invoices.view': true, 'invoices.create': true, 'invoices.edit': true, 'invoices.changeStatus': true,
    'clientes.view': true, 'clientes.create': true, 'clientes.edit': true,
    'proveedores.view': true, 'proveedores.create': true, 'proveedores.edit': true,
    'flota.view': true, 'flota.create': true, 'flota.edit': true, 'flota.dispatch': true,
    'libro-contable.view': true, 'libro-contable.create': true, 'libro-contable.edit': true,
    'inventario.view': true,
    'inventario-envios.view': true,
    'inventario-bienes.view': true,
    'bienes-categorias.view': true,
    'reports.view': true,
    'auditoria.view': true,
    'configuracion.view': true,
};

const adminPermissions: Permissions = {
    ...operatorPermissions,
    'invoices.void': true,
    'clientes.delete': true,
    'proveedores.delete': true,
    'flota.delete': true,
    'libro-contable.delete': true,
    'inventario-bienes.create': true, 'inventario-bienes.edit': true, 'inventario-bienes.delete': true,
    'bienes-categorias.create': true, 'bienes-categorias.edit': true, 'bienes-categorias.delete': true,
    'config.company.edit': true,
    'config.users.manage': true,
    'config.roles.manage': true,
    'categories.view': true, 'categories.create': true, 'categories.edit': true, 'categories.delete': true,
    'offices.view': true, 'offices.create': true, 'offices.edit': true, 'offices.delete': true,
    'shipping-types.view': true, 'shipping-types.create': true, 'shipping-types.edit': true, 'shipping-types.delete': true,
    'payment-methods.view': true, 'payment-methods.create': true, 'payment-methods.edit': true, 'payment-methods.delete': true,
};

// Tech support has all permissions
const techPermissions: Permissions = ALL_PERMISSION_KEYS.reduce((acc, key) => {
    acc[key] = true;
    return acc;
}, {} as Permissions);


export const initialRoles: Role[] = [
    { id: 'role-admin', name: 'Administrador', permissions: adminPermissions },
    { id: 'role-op', name: 'Operador', permissions: operatorPermissions },
    { id: 'role-tech', name: 'Soporte Técnico', permissions: techPermissions },
];

export const initialUsers: User[] = [
    { id: 'user-1', name: 'Administrador', username: 'admin', roleId: 'role-admin', password: '123', officeId: 'off-1' },
    { id: 'user-2', name: 'Operador General', username: 'operador', roleId: 'role-op', password: '123' },
    { id: 'user-3', name: 'Soporte Sysven', username: 'tecnologia', roleId: 'role-tech', password: '123', email: 'soporte@sysven.com' },
    { id: 'user-4', name: 'Cooperativa', username: 'cooperativa', roleId: 'role-tech', password: '123', email: 'coop@sysven.com' },
    { id: 'user-5', name: 'Operador Caracas', username: 'caracas', roleId: 'role-op', password: '123', officeId: 'off-1' },
    { id: 'user-6', name: 'Operador San Cristobal', username: 'sancristobal', roleId: 'role-op', password: '123', officeId: 'off-2' },
    { id: 'user-7', name: 'Operador Barquisimeto', username: 'barquisimeto', roleId: 'role-op', password: '123', officeId: 'off-3' },
];

export const initialVehicles: Vehicle[] = [
    { id: 'v-1', plate: 'A38BB3P', model: 'Ford (Carga)', year: 1997, capacityKg: 5000, driver: 'Wilton E. Garcia G.', status: 'Disponible', currentLoadKg: 0 },
    { id: 'v-2', plate: 'A48BD8P', model: 'Mitsubishi (Carga)', year: 2001, capacityKg: 7000, driver: 'Wilton E. Garcia G.', status: 'Disponible', currentLoadKg: 0 },
    { id: 'v-3', plate: 'A43EU2A', model: 'Ford 350', year: 2008, capacityKg: 3500, driver: 'Maria J. Jaimes N', status: 'Disponible', currentLoadKg: 0 },
    { id: 'v-4', plate: 'A82AU2T', model: 'Ford (Carga)', year: 2006, capacityKg: 5000, driver: 'Yurlly M. Vega Niño', status: 'Disponible', currentLoadKg: 0 },
];

export const initialSuppliers: Supplier[] = [
    { id: 'sup-1', idNumber: 'J-31123306-5', name: 'Full Data Comunicaciones, C.A.', phone: '0212-555-1234', address: 'Caracas' },
    { id: 'sup-2', idNumber: 'J-00000000-0', name: 'CANTV', phone: '0800-CANTV-00', address: 'Nacional' },
    { id: 'sup-3', idNumber: 'G-20000000-0', name: 'CORPOELEC', phone: '0502-CORPOLEC', address: 'Nacional' },
    { id: 'sup-4', idNumber: 'J-12345678-9', name: 'Suministros de Oficina ABC, C.A.', phone: '0212-555-5678', address: 'Caracas' },
];

export const initialExpenseCategories: ExpenseCategory[] = [
    { id: 'exp-cat-1', name: 'Servicios Básicos' },
    { id: 'exp-cat-2', name: 'Alquiler' },
    { id: 'exp-cat-3', name: 'Sueldos y Salarios' },
    { id: 'exp-cat-4', name: 'Material de Oficina' },
];

export const initialExpenses: Expense[] = [
    {
        id: 'exp-1',
        date: '2025-07-22',
        description: 'Pago de Internet ABA',
        category: 'Servicios Básicos',
        amount: 200,
        officeId: 'off-1',
        status: 'Pagado',
        supplierRif: 'J-00000000-0',
        supplierName: 'CANTV',
        invoiceNumber: 'FAC-INTER-0725',
        controlNumber: 'C-001-0725',
        taxableBase: 172.41,
        vatAmount: 27.59,
        paymentMethodId: 'pm-2'
    },
    {
        id: 'exp-2',
        date: '2025-07-20',
        description: 'Pago de Electricidad',
        category: 'Servicios Básicos',
        amount: 350.50,
        officeId: 'off-2',
        status: 'Pagado',
        supplierRif: 'G-20000000-0',
        supplierName: 'CORPOELEC',
        invoiceNumber: 'FAC-ELEC-0725',
        controlNumber: 'C-002-0725',
        taxableBase: 302.16,
        vatAmount: 48.34,
        paymentMethodId: 'pm-1'
    },
     {
        id: 'exp-3',
        date: '2025-07-15',
        description: 'Compra de Papelería',
        category: 'Material de Oficina',
        amount: 150.00,
        officeId: 'off-1',
        status: 'Pagado',
        supplierRif: 'J-12345678-9',
        supplierName: 'Suministros de Oficina ABC, C.A.',
        invoiceNumber: 'FAC-PAPEL-0725',
        controlNumber: 'C-003-0725',
        taxableBase: 129.31,
        vatAmount: 20.69,
        paymentMethodId: 'pm-1'
    },
];

export const initialAssetCategories: AssetCategory[] = [
    { id: 'asset-cat-1', name: 'Equipos de Computación' },
    { id: 'asset-cat-2', name: 'Equipos de Oficina' },
    { id: 'asset-cat-3', name: 'Equipos de Seguridad' },
];

export const initialAssets: Asset[] = [
    ...Array.from({ length: 5 }, (_, i) => ({ id: `asset-comp-${i}`, code: `COMP-00${i+1}`, name: 'Computadora Dell Intel', description: 'Equipo de computación para facturación', purchaseDate: '2024-01-01', purchaseValue: 800, officeId: getRandomElement(initialOffices).id, status: 'Activo' as const, categoryId: 'asset-cat-1' })),
    ...Array.from({ length: 2 }, (_, i) => ({ id: `asset-imp-${i}`, code: `IMP-00${i+1}`, name: 'Impresora HP Laserjet P-110', description: 'Impresora láser para oficina', purchaseDate: '2024-01-01', purchaseValue: 250, officeId: getRandomElement(initialOffices).id, status: 'Activo' as const, categoryId: 'asset-cat-2' })),
    { id: 'asset-tel-1', code: 'TEL-001', name: 'Teléfono Fijo Panaphone', description: 'Teléfono fijo para oficina', purchaseDate: '2015-01-01', purchaseValue: 50, officeId: 'off-1', status: 'Activo' as const, categoryId: 'asset-cat-2' },
    ...Array.from({ length: 2 }, (_, i) => ({ id: `asset-foto-${i}`, code: `FOTO-00${i+1}`, name: 'Fotocopiadora HP Multifuncional', description: 'Equipo multifuncional', purchaseDate: '2019-01-01', purchaseValue: 600, officeId: getRandomElement(initialOffices).id, status: 'Activo' as const, categoryId: 'asset-cat-2' })),
    ...Array.from({ length: 2 }, (_, i) => ({ id: `asset-aa-${i}`, code: `AA-00${i+1}`, name: 'Aire Acondicionado GPlus 18 BTU', description: 'Aire acondicionado para oficina', purchaseDate: '2025-01-01', purchaseValue: 400, officeId: getRandomElement(initialOffices).id, status: 'Activo' as const, categoryId: 'asset-cat-2' })),
    ...Array.from({ length: 8 }, (_, i) => ({ id: `asset-cam-${i}`, code: `CAM-00${i+1}`, name: 'Cámara CCTV Hilook', description: 'Cámara de seguridad', purchaseDate: '2024-01-01', purchaseValue: 120, officeId: getRandomElement(initialOffices).id, status: 'Activo' as const, categoryId: 'asset-cat-3' })),
    { id: 'asset-dvr-1', code: 'DVR-001', name: 'DVR CCTV Hilook', description: 'DVR para cámaras de seguridad', purchaseDate: '2024-01-01', purchaseValue: 300, officeId: 'off-1', status: 'Activo' as const, categoryId: 'asset-cat-3' },
    { id: 'asset-mon-1', code: 'MON-001', name: 'Monitor CCTV Dell', description: 'Monitor para sistema de seguridad', purchaseDate: '2024-01-01', purchaseValue: 200, officeId: 'off-1', status: 'Activo' as const, categoryId: 'asset-cat-1' },
    { id: 'asset-serv-1', code: 'SERV-001', name: 'Servidor Dell Intel', description: 'Servidor principal del sistema', purchaseDate: '2024-01-01', purchaseValue: 1500, officeId: 'off-1', status: 'Activo' as const, categoryId: 'asset-cat-1' },
    { id: 'asset-sisfac-1', code: 'SISFAC-001', name: 'Sistema Facturación Propio Alianza', description: 'Licencia de software de facturación', purchaseDate: '2025-01-01', purchaseValue: 2000, officeId: 'off-1', status: 'Activo' as const, categoryId: 'asset-cat-1' },
];

export const initialInvoices: Invoice[] = [];

export const initialInventory: InventoryItem[] = [];