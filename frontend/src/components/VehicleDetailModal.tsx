import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehicleAPI } from '../services/api';
import { XMarkIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  brand: string;
  year: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
}

interface VehicleStatusRecord {
  id: string;
  status: 'TRIP' | 'IDLE' | 'STOPPED';
  latitude?: number;
  longitude?: number;
  speed?: number;
  timestamp: string;
}

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { data: statusData, isLoading } = useQuery({
    queryKey: ['vehicleStatus', vehicle.id, selectedDate],
    queryFn: () => vehicleAPI.getVehicleStatus(vehicle.id, selectedDate),
    enabled: isOpen,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TRIP':
        return 'bg-blue-100 text-blue-800';
      case 'IDLE':
        return 'bg-yellow-100 text-yellow-800';
      case 'STOPPED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TRIP':
        return '🚗';
      case 'IDLE':
        return '⏸️';
      case 'STOPPED':
        return '🛑';
      default:
        return '❓';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Vehicle Details
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {vehicle.brand} {vehicle.model} - {vehicle.plateNumber}
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900">Vehicle Info</h4>
                <p className="mt-1 text-sm text-gray-600">Brand: {vehicle.brand}</p>
                <p className="text-sm text-gray-600">Model: {vehicle.model}</p>
                <p className="text-sm text-gray-600">Year: {vehicle.year}</p>
                <p className="text-sm text-gray-600">Plate: {vehicle.plateNumber}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900">Status</h4>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900">Date Selection</h4>
                <div className="mt-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Status Records */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Status Records for {format(new Date(selectedDate), 'PPP')}
              </h4>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : statusData?.data?.records?.length > 0 ? (
                <div className="space-y-3">
                  {statusData.data.records.map((record: VehicleStatusRecord) => (
                    <div
                      key={record.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getStatusIcon(record.status)}</span>
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {format(new Date(record.timestamp), 'PPpp')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {record.speed !== null && (
                            <p className="text-sm text-gray-600">
                              Speed: {record.speed} km/h
                            </p>
                          )}
                          {record.latitude && record.longitude && (
                            <p className="text-sm text-gray-600">
                              <MapPinIcon className="h-4 w-4 inline mr-1" />
                              {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No status records available for the selected date.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailModal;
