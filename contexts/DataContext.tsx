import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import { 
    Invoice, Client, Vehicle, Expense, InventoryItem, Asset, AssetCategory, Supplier,
    PaymentStatus, ShippingStatus, MasterStatus 
} from '../types';
import { useToast } from '../components/ui/ToastProvider';
import { useSystem } from './SystemContext';
import { useAuth } from './AuthContext';
import { calculateInvoiceChargeableWeight, calculateFinancialDetails } from '../utils/financials';
import apiClient from '../src/api/apiClient';
import { useConfig } from './ConfigContext';

type DataContextType = {
    invoices: Invoice[];
    clients: Client[];
    suppliers: Supplier[];
    vehicles: Vehicle[];
    expenses: Expense[];
    inventory: InventoryItem[];
    assets: Asset[];
    assetCategories: AssetCategory[];
    loading: boolean;
    error: string | null;
    setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    handleSaveClient: (client: Partial<Client>) => Promise<Client | undefined>;
    handleDeleteClient: (clientId: string) => Promise<void>;
    handleSaveSupplier: (supplier: Partial<Supplier>) => Promise<Supplier | undefined>;
    handleDeleteSupplier: (supplierId: string) => Promise<void>;
    handleSaveInvoice: (invoice: any) => Promise<void>;
    handleUpdateInvoice: (updatedInvoice: Invoice) => Promise<void>;
    handleUpdateInvoiceStatuses: (invoiceId: string, newStatuses: { paymentStatus?: PaymentStatus, shippingStatus?: ShippingStatus, status?: MasterStatus }) => Promise<void>;
    handleDeleteInvoice: (invoiceId: string) => Promise<void>;
    handleSaveVehicle: (vehicleData: FormData, vehicleId?: string) => Promise<void>;
    handleDeleteVehicle: (vehicleId: string) => Promise<void>;
    handleAssignToVehicle: (invoiceIds: string[], vehicleId: string) => void;
    handleUnassignInvoice: (invoiceId: string) => void;
    handleDispatchVehicle: (vehicleId: string, invoiceIds: string[], driverId?: number) => Promise<void>;
    onUndoDispatch: (vehicleId: string) => void;
    handleFinalizeTrip: (manifestId: string | number) => Promise<void>;
    handleSaveExpense: (expense: Partial<Expense>) => Promise<void>;
    handleDeleteExpense: (expenseId: string) => Promise<void>;
    handleSaveAsset: (asset: Partial<Asset>) => Promise<void>;
    handleDeleteAsset: (assetId: string) => Promise<void>;
    handleSaveAssetCategory: (category: Partial<AssetCategory>) => Promise<void>;
    handleDeleteAssetCategory: (categoryId: string) => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addToast } = useToast();
    const { logAction } = useSystem();
    const { user: currentUser } = useAuth();
    const { companyInfo } = useConfig();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (showLoading = true) => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        if (showLoading) setLoading(true);
        try {
            const [
                invoicesRes, clientsRes, suppliersRes, vehiclesRes, expensesRes, assetsRes, assetCategoriesRes
            ] = await Promise.all([
                apiClient.get('/invoices/'), apiClient.get('/clients/'),
                apiClient.get('/suppliers/'), apiClient.get('/vehicles/'),
                apiClient.get('/expenses/'), apiClient.get('/assets/'),
                apiClient.get('/asset-categories/'),
            ]);
            setInvoices(invoicesRes.data); setClients(clientsRes.data);
            setSuppliers(suppliersRes.data); setVehicles(vehiclesRes.data);
            setExpenses(expensesRes.data); setAssets(assetsRes.data);
            setAssetCategories(assetCategoriesRes.data);
        } catch (err) {
            addToast({ type: 'error', title: 'Error de Conexión', message: 'No se pudieron cargar los datos del servidor.' });
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [currentUser, addToast]);

    useEffect(() => {
        if(currentUser) {
            fetchData(true);
        }
    }, [currentUser, fetchData]);
    
    const handleSaveClient = async (client: Partial<Client>): Promise<Client | undefined> => {
        try {
            if (client.id) {
                const response = await apiClient.put(`/clients/${client.id}/`, client);
                setClients(prev => prev.map(c => c.id === response.data.id ? response.data : c));
                addToast({ type: 'success', title: 'Cliente Actualizado' });
                return response.data;
            } else {
                const response = await apiClient.post('/clients/', client);
                setClients(prev => [...prev, response.data]);
                addToast({ type: 'success', title: 'Cliente Creado' });
                return response.data;
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar el cliente.' });
        }
    };

    const handleDeleteClient = async (clientId: string) => {
        try {
            await apiClient.delete(`/clients/${clientId}/`);
            setClients(prev => prev.filter(c => c.id !== clientId));
            addToast({ type: 'success', title: 'Cliente Eliminado' });
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar. Puede estar asociado a una factura.' });
        }
    };

    const handleSaveSupplier = async (supplier: Partial<Supplier>): Promise<Supplier | undefined> => {
        try {
            if (supplier.id) {
                const response = await apiClient.put(`/suppliers/${supplier.id}/`, supplier);
                setSuppliers(prev => prev.map(s => s.id === response.data.id ? response.data : s));
                addToast({ type: 'success', title: 'Proveedor Actualizado' });
                return response.data;
            } else {
                const response = await apiClient.post('/suppliers/', supplier);
                setSuppliers(prev => [...prev, response.data]);
                addToast({ type: 'success', title: 'Proveedor Creado' });
                return response.data;
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar el proveedor.' });
        }
    };

    const handleDeleteSupplier = async (supplierId: string) => {
        try {
            await apiClient.delete(`/suppliers/${supplierId}/`);
            setSuppliers(prev => prev.filter(s => s.id !== supplierId));
            addToast({ type: 'success', title: 'Proveedor Eliminado' });
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar el proveedor.' });
        }
    };

    const handleSaveVehicle = async (vehicleData: FormData, vehicleId?: string) => {
        try {
            if (vehicleId) {
                await apiClient.patch(`/vehicles/${vehicleId}/`, vehicleData);
                addToast({ type: 'success', title: 'Vehículo Actualizado' });
            } else {
                await apiClient.post('/vehicles/', vehicleData);
                addToast({ type: 'success', title: 'Vehículo Creado' });
            }
            await fetchData(false);
        } catch (error) {
            console.error("Error al guardar vehículo:", error);
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar el vehículo.' });
        }
    };

    const handleDeleteVehicle = async (vehicleId: string) => {
        const vehiclePlate = vehicles.find(v => v.id === vehicleId)?.license_plate || 'El vehículo';
        try {
            await apiClient.delete(`/vehicles/${vehicleId}/`);
            addToast({ type: 'success', title: 'Vehículo Eliminado', message: `Vehículo ${vehiclePlate} eliminado.` });
            await fetchData(false);
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar el vehículo.' });
        }
    };
    
    // --- CORRECCIÓN DEFINITIVA APLICADA AQUÍ ---
    const handleSaveInvoice = async (invoiceData: any) => {
        if (!currentUser) return;
        try {
            const { guide, financials } = invoiceData;

            const formatClient = (client: any) => ({
                id_type: client.id_type || (client.idNumber && client.idNumber.startsWith('J') ? 'J' : 'V'),
                id_number: String(client.id_number || '').split('-').pop() || '',
                name: client.name || '',
                phone: client.phone || '',
                address: client.address || ''
            });
            
            const payload = {
                sender: formatClient(guide.sender),
                recipient: formatClient(guide.receiver),
                items: guide.merchandise.map((item: any) => ({
                    ...item,
                    category: item.categoryId // El backend espera 'category'
                })),
                destination_office_id: guide.destinationOfficeId,
                shipping_type_id: guide.shippingTypeId,
                payment_method_id: guide.paymentMethodId,
                payment_type: guide.paymentType,
                payment_currency: guide.paymentCurrency,
                has_insurance: guide.hasInsurance,
                declared_value: guide.declaredValue,
                insurance_percentage: guide.insurancePercentage,
                has_discount: guide.hasDiscount,
                discount_percentage: guide.discountPercentage,
                subtotal: financials.subtotal,
                tax: financials.iva,
                ipostel: financials.ipostel,
                igtf: financials.igtf,
                total: financials.total
            };
            
            console.log("Payload enviado al backend:", payload); // Para depuración final

            const response = await apiClient.post('/invoices/', payload);
            addToast({ type: 'success', title: 'Factura Guardada', message: `Factura ${response.data.invoice_number} creada.` });
            await fetchData(false);
            window.location.hash = 'invoices';
        } catch (error: any) {
            console.error("Error detallado al guardar factura:", error.response?.data || error.message);
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'No se pudo guardar la factura.';
            addToast({ type: 'error', title: 'Error al Crear Factura', message: errorMsg });
        }
    };
    
    const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
        if (!currentUser) return;
        try {
            const { guide } = updatedInvoice;
            const financials = calculateFinancialDetails(guide, companyInfo);

            const formatClient = (client: any) => ({
                id_type: client.id_type || 'V',
                id_number: client.id_number.split('-').pop() || '',
                name: client.name || '',
                phone: client.phone || '',
                address: client.address || ''
            });

            const payload = {
                sender: formatClient(guide.sender),
                recipient: formatClient(guide.receiver),
                destination_office: guide.destinationOfficeId,
                items: guide.merchandise,
                subtotal: financials.subtotal,
                tax: financials.iva,
                ipostel: financials.ipostel,
                igtf: financials.igtf,
                total: financials.total,
                shipping_type: guide.shippingTypeId,
                payment_method: guide.paymentMethodId,
                payment_type: guide.paymentType,
                payment_currency: guide.paymentCurrency,
                has_insurance: guide.hasInsurance,
                declared_value: guide.declaredValue,
                insurance_percentage: guide.insurancePercentage,
                has_discount: guide.hasDiscount,
                discount_percentage: guide.discountPercentage
            };

            const response = await apiClient.put(`/invoices/${updatedInvoice.id}/`, payload);
            addToast({ type: 'success', title: 'Factura Actualizada', message: `Factura ${response.data.invoice_number} actualizada.` });
            await fetchData(false);
            window.location.hash = 'invoices';
        } catch (error: any) {
            console.error("Error detallado al actualizar factura:", error.response?.data || error.message);
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'No se pudo actualizar la factura.';
            addToast({ type: 'error', title: 'Error', message: errorMsg });
        }
    };
    // --- FIN DE LA CORRECCIÓN ---

    const handleUpdateInvoiceStatuses = async (invoiceId: string, newStatuses: any) => {
        if (!currentUser) return;
        try {
            const response = await apiClient.patch(`/invoices/${invoiceId}/`, newStatuses);
            addToast({ type: 'info', title: 'Estado Actualizado', message: `Factura ${response.data.invoice_number} actualizada.` });
            await fetchData(false);
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo cambiar el estado.' });
        }
    };
    
    const handleDeleteInvoice = async (invoiceId: string) => {
        if (!currentUser) return;
        const invoiceNumber = invoices.find(inv => inv.id === invoiceId)?.invoiceNumber;
        try {
            await apiClient.delete(`/invoices/${invoiceId}/`);
            addToast({ type: 'success', title: 'Factura Eliminada', message: `Factura ${invoiceNumber} eliminada.` });
            await fetchData(false);
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar la factura.' });
        }
    };

    const handleSaveExpense = async (expense: Partial<Expense>) => {
        try {
            if (expense.id) {
                await apiClient.put(`/expenses/${expense.id}/`, expense);
                addToast({ type: 'success', title: 'Gasto Actualizado', message: `Gasto '${expense.description}' actualizado.` });
            } else {
                await apiClient.post('/expenses/', expense);
                addToast({ type: 'success', title: 'Gasto Registrado', message: `Gasto '${expense.description}' registrado.` });
            }
            await fetchData(false);
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar el gasto.' });
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        const expenseDesc = expenses.find(e => e.id === expenseId)?.description;
        try {
            await apiClient.delete(`/expenses/${expenseId}/`);
            addToast({ type: 'success', title: 'Gasto Eliminado', message: `Gasto '${expenseDesc}' eliminado.` });
            await fetchData(false);
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar el gasto.' });
        }
    };
    
    const handleSaveAsset = async (asset: Partial<Asset>) => {
        try {
            if (asset.id) {
                await apiClient.put(`/assets/${asset.id}/`, asset);
                addToast({ type: 'success', title: 'Bien Actualizado', message: `Bien '${asset.name}' actualizado.` });
            } else {
                await apiClient.post('/assets/', asset);
                addToast({ type: 'success', title: 'Bien Añadido', message: `Bien '${asset.name}' añadido.` });
            }
            await fetchData(false);
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar el bien.' });
        }
    };

    const handleDeleteAsset = async (assetId: string) => {
        const assetName = assets.find(a => a.id === assetId)?.name;
        try {
            await apiClient.delete(`/assets/${assetId}/`);
            addToast({ type: 'success', title: 'Bien Eliminado', message: `Bien '${assetName}' eliminado.` });
            await fetchData(false);
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar el bien.' });
        }
    };

    const handleSaveAssetCategory = async (category: Partial<AssetCategory>) => {
        try {
            if (category.id) {
                await apiClient.put(`/asset-categories/${category.id}/`, category);
                addToast({ type: 'success', title: 'Categoría Actualizada' });
            } else {
                await apiClient.post('/asset-categories/', category);
                addToast({ type: 'success', title: 'Categoría Creada' });
            }
            await fetchData(false);
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar la categoría.' });
        }
    };

    const handleDeleteAssetCategory = async (categoryId: string) => {
        try {
            await apiClient.delete(`/asset-categories/${categoryId}/`);
            addToast({ type: 'success', title: 'Categoría Eliminada' });
            await fetchData(false);
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar la categoría.' });
        }
    };
    
    const createOrUpdateInventoryItemForInvoice = useCallback((invoice: Invoice, inventoryStateSetter: React.Dispatch<React.SetStateAction<InventoryItem[]>>) => {
        const totalWeight = calculateInvoiceChargeableWeight(invoice);
        const inventoryItem: InventoryItem = {
            id: `inv-item-${invoice.id}`, sku: `INV-${invoice.invoiceNumber}`, name: `Carga Factura ${invoice.invoiceNumber}`,
            description: invoice.guide.merchandise.map(m => `${m.quantity} x ${m.description}`).join(', '),
            stock: invoice.guide.merchandise.reduce((acc, m) => acc + (m.quantity || 0), 0), unit: 'caja',
            invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, shippingStatus: invoice.shippingStatus, weight: totalWeight,
        };
        inventoryStateSetter(prev => {
            const existingIndex = prev.findIndex(item => item.invoiceId === invoice.id);
            if (existingIndex > -1) {
                const updatedInventory = [...prev];
                updatedInventory[existingIndex] = inventoryItem;
                return updatedInventory;
            } else {
                return [inventoryItem, ...prev];
            }
        });
    }, []);
    
    const handleDispatchVehicle = async (vehicleId: string, invoiceIds: string[], driverId?: number) => {
        try {
            const manifestResponse = await apiClient.post('/manifests/', { vehicle: vehicleId });
            const manifestId = manifestResponse.data.id;
            
            await apiClient.post(`/manifests/${manifestId}/dispatch/`, { invoice_ids: invoiceIds, driver_id: driverId });
            addToast({ type: 'success', title: 'Vehículo Despachado', message: 'El viaje ha comenzado.' });
            await fetchData(false);
        } catch (error: any) {
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'No se pudo despachar el vehículo.';
            addToast({ type: 'error', title: 'Error al Despachar', message: errorMsg });
        }
    };
    
    const handleFinalizeTrip = async (manifestId: string | number) => {
        try {
            await apiClient.post(`/manifests/${manifestId}/finalize_trip/`);
            addToast({ type: 'success', title: 'Viaje Finalizado', message: 'El vehículo y las facturas han sido actualizados.' });
            await fetchData(false);
        } catch (error: any) {
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'No se pudo finalizar el viaje.';
            addToast({ type: 'error', title: 'Error al Finalizar', message: errorMsg });
        }
    };

    const handleAssignToVehicle = (invoiceIds: string[], vehicleId: string) => {
        setInvoices(prevInvoices => prevInvoices.map(inv => invoiceIds.includes(inv.id) ? { ...inv, vehicleId: vehicleId } : inv));
        addToast({ type: 'info', title: 'Envíos Asignados', message: `${invoiceIds.length} factura(s) asignadas al vehículo.` });
    };

    const handleUnassignInvoice = (invoiceId: string) => {
        setInvoices(prevInvoices => prevInvoices.map(inv => inv.id === invoiceId ? { ...inv, shippingStatus: 'Pendiente para Despacho', vehicleId: undefined } : inv));
        addToast({ type: 'info', title: 'Envío Desasignado', message: `La factura ha sido removida del vehículo.` });
    };

    const onUndoDispatch = (vehicleId: string) => {
        console.log("Deshacer despacho (lógica local por ahora)");
        addToast({ type: 'info', title: 'No implementado', message: 'La función para deshacer un despacho requiere configuración adicional en el backend.' });
    };
    
    const value = {
        invoices, clients, suppliers, vehicles, expenses, inventory, assets, assetCategories, loading, error, setInvoices, setExpenses,
        handleSaveClient, handleDeleteClient, handleSaveSupplier, handleDeleteSupplier, handleSaveInvoice, 
        handleUpdateInvoice, handleUpdateInvoiceStatuses, handleDeleteInvoice, handleSaveVehicle, 
        handleDeleteVehicle, handleAssignToVehicle, handleUnassignInvoice, handleDispatchVehicle, 
        onUndoDispatch, handleFinalizeTrip, handleSaveExpense, handleDeleteExpense, handleSaveAsset, 
        handleDeleteAsset, handleSaveAssetCategory, handleDeleteAssetCategory
    };

    return <DataContext.Provider value={value as any}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};