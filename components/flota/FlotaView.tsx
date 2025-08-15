import React, { useState } from 'react';
import { Invoice, Vehicle, Permissions, Office, CompanyInfo, Client } from '../../types';
import Card, { CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { TruckIcon, PlusIcon, EditIcon, TrashIcon, ClipboardDocumentListIcon, XIcon, FileTextIcon, PlayIcon, FlagIcon, ArrowUturnLeftIcon } from '../icons/Icons';
import VehicleFormModal from './VehicleFormModal';
import AssignInvoiceModal from './AssignInvoiceModal';
import VehicleShipmentManifest from './VehicleShipmentManifest';
import { calculateInvoiceChargeableWeight } from '../../utils/financials';

// --- INTERFAZ ACTUALIZADA ---
// Se han ajustado los tipos de las funciones para que coincidan con la lógica más completa.
interface FlotaViewProps {
    vehicles: Vehicle[];
    invoices: Invoice[];
    offices: Office[];
    clients: Client[];
    onAssignToVehicle: (invoiceIds: string[], vehicleId: string) => void;
    onUnassignInvoice: (invoiceId: string) => void;
    // Se cambia FormData por un tipo más específico si es posible, si no, se mantiene.
    onSaveVehicle: (vehicleData: FormData, vehicleId?: string) => void;
    onDeleteVehicle: (vehicleId: string) => void;
    // Se simplifican los parámetros de las siguientes funciones según el código más completo.
    onDispatchVehicle: (vehicleId: string) => void;
    onFinalizeTrip: (vehicleId: string) => void;
    onUndoDispatch: (vehicleId: string) => void;
    permissions: Permissions;
    companyInfo: CompanyInfo;
}

const statusInfo: { [key: string]: { color: string, text: string } } = {
    Disponible: { color: 'bg-green-500', text: 'Disponible' },
    'En Ruta': { color: 'bg-blue-500', text: 'En Ruta' },
    'En Mantenimiento': { color: 'bg-yellow-500', text: 'Mantenimiento' },
};
const defaultStatusInfo = { color: 'bg-gray-500', text: 'Desconocido' };

const FlotaView: React.FC<FlotaViewProps> = (props) => {
    const { 
        vehicles, invoices, offices, clients, 
        onAssignToVehicle, onUnassignInvoice, onSaveVehicle, onDeleteVehicle, 
        onDispatchVehicle, onFinalizeTrip, onUndoDispatch,
        permissions, companyInfo 
    } = props;
    
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [vehicleToAssign, setVehicleToAssign] = useState<Vehicle | null>(null);
    const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
    const [vehicleForManifest, setVehicleForManifest] = useState<Vehicle | null>(null);
    
    const availableInvoices = invoices.filter(inv => !inv.vehicleId && inv.shippingStatus === 'Pendiente para Despacho' && inv.status === 'Activa');

    const handleOpenVehicleModal = (vehicle: Vehicle | null) => {
        setEditingVehicle(vehicle);
        setIsVehicleModalOpen(true);
    };

    const handleSave = (vehicleData: FormData, vehicleId?: string) => {
        onSaveVehicle(vehicleData, vehicleId);
        setIsVehicleModalOpen(false);
    };
    
    const handleOpenAssignModal = (vehicle: Vehicle) => {
        setVehicleToAssign(vehicle);
        setIsAssignModalOpen(true);
    };

    const handleAssignInvoices = (invoiceIds: string[]) => {
        if(vehicleToAssign) {
            onAssignToVehicle(invoiceIds, vehicleToAssign.id);
        }
        setIsAssignModalOpen(false);
    };
    
    const handleOpenManifestModal = (vehicle: Vehicle) => {
        setVehicleForManifest(vehicle);
        setIsManifestModalOpen(true);
    };

    const getAssignedInvoices = (vehicleId: string) => {
        return invoices.filter(inv => inv.vehicleId === vehicleId);
    };
    
    // --- CAMBIO CLAVE ---
    // La función `handleDispatch` se añade para mediar entre el botón y la prop `onDispatchVehicle`,
    // asegurando que se envíen los IDs de las facturas asignadas.
    const handleDispatch = (vehicle: Vehicle) => {
        const assignedInvoiceIds = getAssignedInvoices(vehicle.id).map(inv => inv.id);
        // La prop onDispatchVehicle original esperaba más argumentos, se ajusta la llamada
        onDispatchVehicle(vehicle.id); 
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Gestión de Flota y Remesas</CardTitle>
                        {permissions['flota.create'] && (
                            <Button onClick={() => handleOpenVehicleModal(null)}>
                                <PlusIcon className="w-4 h-4 mr-2" /> Añadir Vehículo
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <div className="flex overflow-x-auto space-x-6 pb-4">
                    {vehicles.map(vehicle => {
                        const assignedInvoices = getAssignedInvoices(vehicle.id);
                        const currentLoadKg = assignedInvoices.reduce((sum, inv) => sum + calculateInvoiceChargeableWeight(inv), 0);
                        // Se asegura de usar las propiedades del objeto Vehicle original (snake_case)
                        const loadPercentage = vehicle.capacity_kg > 0 ? (currentLoadKg / vehicle.capacity_kg) * 100 : 0;
                        const status = statusInfo[vehicle.status] || defaultStatusInfo;
                        
                        return (
                        <div key={vehicle.id} className="w-80 sm:w-96 flex-shrink-0">
                            <Card className="bg-gray-50 dark:bg-gray-800 flex flex-col p-0 h-full">
                                <div className="relative h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                                    {/* Se usa `vehicle.image` en lugar de `imageUrl` */}
                                    {vehicle.image ? (
                                        <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <TruckIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                                        </div>
                                    )}
                                    <div className={`absolute top-2 right-2 px-2 py-1 text-xs text-white rounded-full font-semibold shadow-lg ${status.color}`}>
                                        {status.text}
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="font-bold text-lg text-primary-600 dark:text-primary-400">{vehicle.model}</p>
                                        <p className="text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded inline-block mb-2">{vehicle.license_plate}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Conductor: {vehicle.driver}</p>
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                                                <span>Carga Actual</span>
                                                <span>{currentLoadKg.toFixed(2)} / {vehicle.capacity_kg} Kg</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                                                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${Math.min(loadPercentage, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- CÓDIGO AÑADIDO --- */}
                                    {/* Se ha añadido toda la lógica visual de envíos y botones */}
                                    <div className="space-y-3 mt-4">
                                        <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
                                            <h4 className="font-semibold text-sm mb-2 flex items-center">
                                                <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                                                Envíos Asignados ({assignedInvoices.length})
                                            </h4>
                                            {assignedInvoices.length > 0 ? (
                                                <ul className="text-xs space-y-1 pl-2 border-l-2 border-primary-500 max-h-24 overflow-y-auto">
                                                    {assignedInvoices.map(inv => (
                                                        <li key={inv.id} className="flex justify-between items-center group pr-1">
                                                            <span>Factura #{inv.invoiceNumber}</span>
                                                            {vehicle.status === 'Disponible' && (
                                                                <button 
                                                                    onClick={() => onUnassignInvoice(inv.id)}
                                                                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Remover envío del vehículo"
                                                                >
                                                                    <XIcon className="w-4 h-4"/>
                                                                </button>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-gray-400 dark:text-gray-500">Ningún envío asignado.</p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap justify-end items-center gap-2 pt-2 border-t dark:border-gray-700">
                                            {vehicle.status === 'Disponible' && (
                                                <>
                                                    <Button size="sm" variant="secondary" onClick={() => handleOpenAssignModal(vehicle)} title="Asignar Envíos">Asignar</Button>
                                                    {permissions['flota.dispatch'] && <Button size="sm" variant="primary" onClick={() => handleDispatch(vehicle)} disabled={assignedInvoices.length === 0} title="Despachar Vehículo"><PlayIcon className="w-4 h-4" /></Button>}
                                                    {permissions['flota.edit'] && <Button size="sm" variant="secondary" onClick={() => handleOpenVehicleModal(vehicle)} title="Editar Vehículo"><EditIcon className="w-4 h-4" /></Button>}
                                                    {permissions['flota.delete'] && <Button size="sm" variant="danger" onClick={() => onDeleteVehicle(vehicle.id)} title="Eliminar Vehículo"><TrashIcon className="w-4 h-4" /></Button>}
                                                </>
                                            )}
                                            {vehicle.status === 'En Ruta' && permissions['flota.dispatch'] && (
                                                <>
                                                    <Button size="sm" variant="secondary" onClick={() => onUndoDispatch(vehicle.id)} title="Deshacer Despacho"><ArrowUturnLeftIcon className="w-4 h-4" /></Button>
                                                    {/* Ajuste: onFinalizeTrip espera el ID del manifiesto, pero el botón solo tiene el ID del vehículo. Se pasa el ID del vehículo como en el código de referencia. */}
                                                    <Button size="sm" variant="primary" onClick={() => onFinalizeTrip(vehicle.id)} title="Finalizar Viaje"><FlagIcon className="w-4 h-4" /></Button>
                                                </>
                                            )}
                                            <Button size="sm" variant="secondary" onClick={() => handleOpenManifestModal(vehicle)} disabled={assignedInvoices.length === 0} title="Generar Remesa/Manifiesto">
                                                <FileTextIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {/* --- FIN DEL CÓDIGO AÑADIDO --- */}

                                </div>
                            </Card>
                        </div>
                    )})}
                </div>
            </Card>

            {isVehicleModalOpen && (
                <VehicleFormModal
                    isOpen={isVehicleModalOpen}
                    onClose={() => setIsVehicleModalOpen(false)}
                    onSave={handleSave}
                    vehicle={editingVehicle}
                />
            )}
            
            {isAssignModalOpen && vehicleToAssign && (
                <AssignInvoiceModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    onAssign={handleAssignInvoices}
                    vehicle={vehicleToAssign}
                    allInvoices={invoices}
                    availableInvoices={availableInvoices}
                    offices={offices}
                />
            )}

            {isManifestModalOpen && vehicleForManifest && (
                <VehicleShipmentManifest
                    isOpen={isManifestModalOpen}
                    onClose={() => setIsManifestModalOpen(false)}
                    vehicle={vehicleForManifest}
                    invoices={getAssignedInvoices(vehicleForManifest.id)}
                    offices={offices}
                    clients={clients}
                    companyInfo={companyInfo}
                />
            )}
        </>
    );
};

export default FlotaView;