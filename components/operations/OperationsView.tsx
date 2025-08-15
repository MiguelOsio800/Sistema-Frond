
import React, { useState } from 'react';
import { Invoice, Vehicle } from '../../types';
import Card, { CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { TruckIcon, ClipboardDocumentListIcon, CheckCircleIcon } from '../icons/Icons';

interface AssignToVehicleViewProps {
    vehicles: Vehicle[];
    invoices: Invoice[];
    onAssignToVehicle: (invoiceIds: string[], vehicleId: string) => void;
}

const AssignToVehicleView: React.FC<AssignToVehicleViewProps> = ({ vehicles, invoices, onAssignToVehicle }) => {
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    const availableInvoices = invoices.filter(inv => inv.status === 'Activa' && inv.shippingStatus === 'Pendiente para Despacho');
    const availableVehicles = vehicles.filter(v => v.status === 'Disponible');

    const handleToggleInvoice = (invoiceId: string) => {
        setSelectedInvoiceIds(prev =>
            prev.includes(invoiceId)
                ? prev.filter(id => id !== invoiceId)
                : [...prev, invoiceId]
        );
    };
    
    const handleAssign = () => {
        if (selectedInvoiceIds.length > 0 && selectedVehicleId) {
            onAssignToVehicle(selectedInvoiceIds, selectedVehicleId);
            setSelectedInvoiceIds([]);
            setSelectedVehicleId(null);
        } else {
            alert('Por favor, seleccione al menos una factura y un vehículo.');
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Vehicles Panel */}
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center">
                        <TruckIcon className="w-6 h-6 mr-2 text-primary-500" />
                        <CardTitle>Vehículos Disponibles</CardTitle>
                    </div>
                </CardHeader>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {availableVehicles.map(vehicle => (
                        <div
                            key={vehicle.id}
                            onClick={() => setSelectedVehicleId(vehicle.id)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedVehicleId === vehicle.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-lg'
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-lg">{vehicle.model} - {vehicle.plate}</p>
                                {selectedVehicleId === vehicle.id && <CheckCircleIcon className="w-6 h-6 text-primary-500" />}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Conductor: {vehicle.driver}</p>
                            <div className="mt-2">
                                <p className="text-xs">Capacidad (Kg): {vehicle.currentLoadKg}/{vehicle.capacityKg} Kg</p>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${(vehicle.currentLoadKg / vehicle.capacityKg) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Invoices Panel */}
             <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center">
                        <ClipboardDocumentListIcon className="w-6 h-6 mr-2 text-orange-500" />
                        <CardTitle>Facturas para Despacho ({availableInvoices.length})</CardTitle>
                    </div>
                </CardHeader>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {availableInvoices.map(invoice => (
                         <div
                            key={invoice.id}
                            onClick={() => handleToggleInvoice(invoice.id)}
                            className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                                selectedInvoiceIds.includes(invoice.id)
                                ? 'bg-green-50 dark:bg-green-900/30 border-green-400'
                                : 'bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                           <div>
                             <p className="font-semibold text-primary-600 dark:text-primary-400">{invoice.invoiceNumber}</p>
                             <p className="text-sm text-gray-600 dark:text-gray-300">{invoice.clientName}</p>
                           </div>
                           <div className="text-right">
                               <p className="text-sm">{invoice.guide.destinationOfficeId}</p>
                               <p className="text-xs text-gray-500 dark:text-gray-400">{invoice.guide.merchandise.reduce((acc, m) => acc + m.weight, 0).toFixed(2)} kg</p>
                           </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t dark:border-gray-700">
                    <Button onClick={handleAssign} disabled={!selectedVehicleId || selectedInvoiceIds.length === 0} className="w-full">
                        Asignar {selectedInvoiceIds.length} Factura(s) a Vehículo
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AssignToVehicleView;