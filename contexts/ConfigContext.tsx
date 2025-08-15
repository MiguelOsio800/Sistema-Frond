import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { CompanyInfo, User, Role, Office, Category, ShippingType, PaymentMethod, Permissions, ExpenseCategory } from '../types';
import { useToast } from '../components/ui/ToastProvider';
import { useSystem } from './SystemContext';
import { useAuth } from './AuthContext';
import apiClient from '../src/api/apiClient';

type ConfigContextType = {
    companyInfo: CompanyInfo;
    categories: Category[];
    users: User[];
    roles: Role[];
    offices: Office[];
    shippingTypes: ShippingType[];
    paymentMethods: PaymentMethod[];
    expenseCategories: ExpenseCategory[];
    userPermissions: Permissions;
    handleCompanyInfoSave: (info: FormData) => Promise<CompanyInfo | void>;
    handleSaveUser: (user: Partial<User>) => Promise<void>;
    onDeleteUser: (userId: string) => Promise<void>;
    handleSaveRole: (role: Partial<Role>) => Promise<void>;
    onDeleteRole: (roleId: string) => Promise<void>;
    onUpdateRolePermissions: (roleId: string, permissions: Permissions) => Promise<void>;
    handleSaveCategory: (category: Partial<Category>) => Promise<void>;
    onDeleteCategory: (categoryId: string) => Promise<void>;
    handleSaveOffice: (office: Partial<Office>) => Promise<void>;
    onDeleteOffice: (officeId: string) => Promise<void>;
    handleSaveShippingType: (shippingType: Partial<ShippingType>) => Promise<void>;
    onDeleteShippingType: (shippingTypeId: string) => Promise<void>;
    handleSavePaymentMethod: (paymentMethod: Partial<PaymentMethod>) => Promise<void>;
    onDeletePaymentMethod: (paymentMethodId: string) => Promise<void>;
    handleSaveExpenseCategory: (category: Partial<ExpenseCategory>) => Promise<void>;
    onDeleteExpenseCategory: (categoryId: string) => Promise<void>;
};

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addToast } = useToast();
    const { logAction } = useSystem();
    const { user: currentUser } = useAuth();

    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({} as CompanyInfo);
    const [categories, setCategories] = useState<Category[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [offices, setOffices] = useState<Office[]>([]);
    const [shippingTypes, setShippingTypes] = useState<ShippingType[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
    const [userPermissions, setUserPermissions] = useState<Permissions>({});

    const fetchData = useCallback(async () => {
        if (!currentUser) return;
        try {
            const [
                companyInfoRes, rolesRes, officesRes, usersRes,
                categoriesRes, shippingTypesRes, paymentMethodsRes, expenseCategoriesRes
            ] = await Promise.all([
                apiClient.get('/company-info/'),
                apiClient.get('/roles/'),
                apiClient.get('/offices/'),
                apiClient.get('/users/'),
                apiClient.get('/categories/'),
                apiClient.get('/shipping-types/'),
                apiClient.get('/payment-methods/'),
                apiClient.get('/expense-categories/'),
            ]);
            setCompanyInfo(companyInfoRes.data);
            setRoles(rolesRes.data);
            setOffices(officesRes.data);
            setUsers(usersRes.data);
            setCategories(categoriesRes.data);
            setShippingTypes(shippingTypesRes.data);
            setPaymentMethods(paymentMethodsRes.data);
            setExpenseCategories(expenseCategoriesRes.data);
        } catch (error) {
            addToast({ type: 'error', title: 'Error de Configuración', message: 'No se pudieron cargar los parámetros del sistema.' });
        }
    }, [currentUser, addToast]);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser, fetchData]);

    useEffect(() => {
        if (currentUser && roles.length > 0) {
            const userRole = roles.find(r => r.id === currentUser.roleId);
            if (userRole) {
                setUserPermissions(userRole.permissions);
            }
        } else {
            setUserPermissions({});
        }
    }, [currentUser, roles]);

    useEffect(() => {
        if (companyInfo.name) {
            document.title = companyInfo.name;
        }
    }, [companyInfo]);

    const handleCompanyInfoSave = async (info: FormData): Promise<CompanyInfo | void> => {
        try {
            const response = await apiClient.post('/company-info/', info);
            setCompanyInfo(response.data);
            addToast({ type: 'success', title: 'Configuración Guardada', message: 'La información de la empresa ha sido actualizada.'});
            return response.data;
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar la configuración.' });
        }
    };
    
    const handleSaveUser = async (user: Partial<User>) => {
        try {
            if (user.id) {
                await apiClient.put(`/users/${user.id}/`, user);
                addToast({ type: 'success', title: 'Usuario Actualizado', message: `El usuario ${user.name} ha sido actualizado.` });
            } else {
                await apiClient.post('/users/', user);
                addToast({ type: 'success', title: 'Usuario Creado', message: `El usuario ${user.name} ha sido creado.` });
            }
            await fetchData();
        } catch(error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar el usuario.' });
        }
    };

    const onDeleteUser = async (userId: string) => {
        try {
            const userToDelete = users.find(u => u.id === userId);
            await apiClient.delete(`/users/${userId}/`);
            addToast({ type: 'success', title: 'Usuario Eliminado', message: `El usuario ${userToDelete?.name} ha sido eliminado.` });
            await fetchData();
        } catch(error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar el usuario.' });
        }
    };

    const handleSaveRole = async (role: Partial<Role>) => {
        try {
            if (role.id) {
                await apiClient.put(`/roles/${role.id}/`, role);
                addToast({ type: 'success', title: 'Rol Actualizado', message: `El rol '${role.name}' ha sido actualizado.` });
            } else {
                await apiClient.post('/roles/', role);
                addToast({ type: 'success', title: 'Rol Creado', message: `El rol '${role.name}' ha sido creado.` });
            }
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar el rol.' });
        }
    };
    
    const onDeleteRole = async (roleId: string) => {
        try {
            const roleName = roles.find(r => r.id === roleId)?.name || 'El rol';
            await apiClient.delete(`/roles/${roleId}/`);
            addToast({ type: 'success', title: 'Rol Eliminado', message: `El rol '${roleName}' ha sido eliminado.` });
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar el rol.' });
        }
    };

    const onUpdateRolePermissions = async (roleId: string, permissions: Permissions) => {
        try {
            const permissionIds = Object.keys(permissions).filter(key => permissions[key]);
            await apiClient.patch(`/roles/${roleId}/`, { permission_ids: permissionIds });
            addToast({ type: 'success', title: 'Permisos Actualizados' });
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudieron actualizar los permisos.' });
        }
    };

    const handleSaveOffice = async (office: Partial<Office>) => {
        try {
            if (office.id) {
                await apiClient.put(`/offices/${office.id}/`, office);
                addToast({ type: 'success', title: 'Oficina Actualizada', message: `La oficina '${office.name}' ha sido actualizada.` });
            } else {
                await apiClient.post('/offices/', office);
                addToast({ type: 'success', title: 'Oficina Creada', message: `La oficina '${office.name}' ha sido creada.` });
            }
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar la oficina.' });
        }
    };

    const onDeleteOffice = async (officeId: string) => {
        try {
            await apiClient.delete(`/offices/${officeId}/`);
            addToast({ type: 'success', title: 'Oficina Eliminada' });
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar la oficina.' });
        }
    };

    const handleSaveCategory = async (category: Partial<Category>) => {
        try {
            if (category.id) {
                await apiClient.put(`/categories/${category.id}/`, category);
                addToast({ type: 'success', title: 'Categoría Actualizada' });
            } else {
                await apiClient.post('/categories/', category);
                addToast({ type: 'success', title: 'Categoría Creada' });
            }
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar la categoría.' });
        }
    };

    const onDeleteCategory = async (categoryId: string) => {
        try {
            await apiClient.delete(`/categories/${categoryId}/`);
            addToast({ type: 'success', title: 'Categoría Eliminada' });
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar la categoría.' });
        }
    };

    const handleSaveShippingType = async (shippingType: Partial<ShippingType>) => {
        try {
            if (shippingType.id) {
                await apiClient.put(`/shipping-types/${shippingType.id}/`, shippingType);
                addToast({ type: 'success', title: 'Tipo de Envío Actualizado' });
            } else {
                await apiClient.post('/shipping-types/', shippingType);
                addToast({ type: 'success', title: 'Tipo de Envío Creado' });
            }
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar el tipo de envío.' });
        }
    };

    const onDeleteShippingType = async (shippingTypeId: string) => {
        try {
            await apiClient.delete(`/shipping-types/${shippingTypeId}/`);
            addToast({ type: 'success', title: 'Tipo de Envío Eliminado' });
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar el tipo de envío.' });
        }
    };

    const handleSavePaymentMethod = async (paymentMethod: Partial<PaymentMethod>) => {
        try {
            if (paymentMethod.id) {
                await apiClient.put(`/payment-methods/${paymentMethod.id}/`, paymentMethod);
                addToast({ type: 'success', title: 'Forma de Pago Actualizada' });
            } else {
                await apiClient.post('/payment-methods/', paymentMethod);
                addToast({ type: 'success', title: 'Forma de Pago Creada' });
            }
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar la forma de pago.' });
        }
    };

    const onDeletePaymentMethod = async (paymentMethodId: string) => {
        try {
            await apiClient.delete(`/payment-methods/${paymentMethodId}/`);
            addToast({ type: 'success', title: 'Forma de Pago Eliminada' });
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar la forma de pago.' });
        }
    };

    const handleSaveExpenseCategory = async (category: Partial<ExpenseCategory>) => {
        try {
            if (category.id) {
                await apiClient.put(`/expense-categories/${category.id}/`, category);
                addToast({ type: 'success', title: 'Categoría de Gasto Actualizada' });
            } else {
                await apiClient.post('/expense-categories/', category);
                addToast({ type: 'success', title: 'Categoría de Gasto Creada' });
            }
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar la categoría de gasto.' });
        }
    };

    const onDeleteExpenseCategory = async (categoryId: string) => {
        try {
            await apiClient.delete(`/expense-categories/${categoryId}/`);
            addToast({ type: 'success', title: 'Categoría de Gasto Eliminada' });
            await fetchData();
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar la categoría de gasto.' });
        }
    };

    const value = {
        companyInfo, categories, users, roles, offices, shippingTypes, paymentMethods, 
        expenseCategories, userPermissions, handleCompanyInfoSave, 
        handleSaveUser, onDeleteUser, handleSaveRole, onDeleteRole, onUpdateRolePermissions, 
        handleSaveCategory, onDeleteCategory, handleSaveOffice, onDeleteOffice, 
        handleSaveShippingType, onDeleteShippingType, handleSavePaymentMethod, 
        onDeletePaymentMethod, handleSaveExpenseCategory, onDeleteExpenseCategory
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = (): ConfigContextType => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};