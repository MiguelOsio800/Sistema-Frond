import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../../types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';

interface VehicleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (vehicleData: FormData, vehicleId?: string) => void;
    vehicle: Vehicle | null;
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ isOpen, onClose, onSave, vehicle }) => {
    const initialState = {
        license_plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        capacity_kg: 1000,
        status: 'Disponible',
        driver: '',
    };
    const [formData, setFormData] = useState(initialState);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (vehicle) {
                setFormData({
                    license_plate: vehicle.license_plate || '',
                    brand: vehicle.brand || '',
                    model: vehicle.model || '',
                    year: vehicle.year || new Date().getFullYear(),
                    capacity_kg: vehicle.capacity_kg || 1000,
                    status: vehicle.status || 'Disponible',
                    driver: vehicle.driver || '',
                });
                setPreviewUrl(vehicle.image || null);
                setImageFile(null);
            } else {
                setFormData(initialState);
                setPreviewUrl(null);
                setImageFile(null);
            }
        }
    }, [vehicle, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const vehicleFormData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            vehicleFormData.append(key, String(value));
        });
        if (imageFile) {
            vehicleFormData.append('image', imageFile);
        }
        onSave(vehicleFormData, vehicle?.id);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="license_plate" label="Placa" value={formData.license_plate} onChange={handleChange} required />
                <Input name="brand" label="Marca" value={formData.brand} onChange={handleChange} required />
                <Input name="model" label="Modelo" value={formData.model} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-4">
                    <Input name="year" label="Año" type="number" value={formData.year} onChange={handleChange} required />
                    <Input name="capacity_kg" label="Capacidad (Kg)" type="number" value={formData.capacity_kg} onChange={handleChange} required />
                </div>
                <Input name="driver" label="Conductor" value={formData.driver} onChange={handleChange} />
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Imagen del Vehículo
                    </label>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="secondary" 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="shrink-0"
                        >
                            Subir...
                        </Button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            // --- CAMBIO AQUÍ ---
                            accept="image/jpeg, image/png"
                            className="hidden" 
                        />
                        {imageFile && <span className="text-sm text-gray-500">{imageFile.name}</span>}
                    </div>
                     {previewUrl && (
                        <div className="mt-4 p-2 border rounded-lg bg-gray-100 dark:bg-gray-700/50 inline-block">
                            <img src={previewUrl} alt="Vista previa" className="h-24 w-auto object-contain rounded-md" />
                        </div>
                    )}
                </div>
                <Select
                    label="Estado"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="Disponible">Disponible</option>
                    <option value="En Ruta">En Ruta</option>
                    <option value="En Mantenimiento">En Mantenimiento</option>
                </Select>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default VehicleFormModal;