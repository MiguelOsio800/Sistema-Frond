import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Partial<Client>) => void;
    client: Client | null;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, onSave, client }) => {
    const initialState = {
        id_type: 'V',
        id_number: '',
        name: '',
        phone: '',
        address: '',
    };

    const [formData, setFormData] = useState(initialState);

    // --- CAMBIO 1: useEffect modificado para manejar el prefijo ---
    useEffect(() => {
        if (isOpen) {
            if (client) {
                // Si estamos editando, poblamos el estado y añadimos el prefijo
                const type = client.id_type || 'V';
                const number = client.id_number || '';
                setFormData({
                    id_type: type,
                    id_number: number ? `${type}-${number}` : `${type}-`,
                    name: client.name || '',
                    phone: client.phone || '',
                    address: client.address || '',
                });
            } else {
                // Si es un cliente nuevo, reseteamos y añadimos el prefijo inicial 'V-'
                setFormData({
                    ...initialState,
                    id_number: 'V-',
                });
            }
        }
    }, [client, isOpen]);

    // --- CAMBIO 2: Lógica de `handleChange` mejorada ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'id_type') {
            // Si el usuario cambia el tipo (V, E, J, G)...
            // tomamos el número actual sin el prefijo viejo.
            const currentNumberOnly = formData.id_number.split('-').pop() || '';
            setFormData(prev => ({
                ...prev,
                id_type: value,
                // Y creamos el nuevo valor con el prefijo nuevo.
                id_number: `${value}-${currentNumberOnly}`
            }));
        } else if (name === 'id_number') {
            // Si el usuario escribe en el campo de identificación...
            const prefix = `${formData.id_type}-`;
            // Nos aseguramos que el prefijo siempre esté al principio.
            if (value.startsWith(prefix)) {
                setFormData(prev => ({ ...prev, id_number: value }));
            }
        } else {
            // Para los otros campos, todo sigue igual.
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- CAMBIO 3: `handleSubmit` modificado para limpiar el dato ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Antes de guardar, le quitamos el prefijo al número.
        const numberOnly = formData.id_number.split('-')[1] || '';

        const clientToSave = {
            ...formData,
            id_number: numberOnly, // Guardamos solo el número limpio.
            id: client?.id,
        };
        onSave(clientToSave);
    };

    const idLabel = ['J', 'G'].includes(formData.id_type) ? 'RIF' : 'Cédula de Identidad';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={client ? 'Editar Cliente' : 'Nuevo Cliente'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label="Tipo de Cliente"
                    name="id_type"
                    value={formData.id_type}
                    onChange={handleChange}
                >
                    <option value="V">Persona (V)</option>
                    <option value="E">Extranjero (E)</option>
                    <option value="J">Empresa (J)</option>
                    <option value="G">Gubernamental (G)</option>
                </Select>
                
                <Input name="id_number" label={idLabel} value={formData.id_number} onChange={handleChange} required />
                <Input name="name" label="Nombre Completo o Razón Social" value={formData.name} onChange={handleChange} required />
                <Input name="phone" label="Teléfono de Contacto" value={formData.phone} onChange={handleChange} />
                <Input name="address" label="Dirección Fiscal" value={formData.address} onChange={handleChange} />

                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ClientFormModal;