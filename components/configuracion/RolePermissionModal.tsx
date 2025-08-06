

import React, { useState, useEffect } from 'react';
import { Role, Permissions } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { NAV_ITEMS } from '../../constants';

interface RolePermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (roleId: string, permissions: Permissions) => void;
    role: Role;
}

const modules = NAV_ITEMS.map(item => ({ id: item.id, label: item.label }));
const permissionTypes = ['view', 'create', 'edit', 'delete'];
const permissionLabels: { [key: string]: string } = {
    view: 'Ver',
    create: 'Crear',
    edit: 'Editar',
    delete: 'Eliminar'
};

const RolePermissionModal: React.FC<RolePermissionModalProps> = ({ isOpen, onClose, onSave, role }) => {
    const [permissions, setPermissions] = useState<Permissions>({});

    useEffect(() => {
        if (isOpen) {
            setPermissions(JSON.parse(JSON.stringify(role.permissions)));
        }
    }, [role, isOpen]);

    const handlePermissionChange = (module: string, permission: string, value: boolean) => {
        const permissionKey = `${module}.${permission}`;
        setPermissions(prev => ({
            ...prev,
            [permissionKey]: value
        }));
    };
    
    const handleSubmit = () => {
        onSave(role.id, permissions);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Permisos para el rol: ${role.name}`} size="3xl">
            <div className="max-h-[60vh] overflow-auto pr-2">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b dark:border-gray-600">
                            <th className="py-2 text-left font-semibold text-gray-800 dark:text-gray-200">Módulo</th>
                            {permissionTypes.map(pType => <th key={pType} className="py-2 text-center font-semibold text-gray-600 dark:text-gray-300">{permissionLabels[pType]}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {modules.map(module => (
                            <tr key={module.id} className="border-b dark:border-gray-700">
                                <td className="py-3 font-medium text-gray-800 dark:text-gray-200">{module.label}</td>
                                {permissionTypes.map(pType => (
                                    <td key={pType} className="py-3 text-center">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                            checked={permissions[`${module.id}.${pType}`] || false}
                                            onChange={(e) => handlePermissionChange(module.id, pType, e.target.checked)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end space-x-2 pt-4 mt-4 border-t dark:border-gray-700">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit}>Guardar Permisos</Button>
            </div>
        </Modal>
    );
};

export default RolePermissionModal;
