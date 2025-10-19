import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../services/api';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  TruckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { format } from 'date-fns';

interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  brand: string;
  year: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  location?: string;
  createdAt: string;
  updatedAt: string;
}

interface StatusRecord {
  id: string;
  vehicleId: string;
  status: 'TRIP' | 'IDLE' | 'STOPPED';
  timestamp: string;
  location?: string;
  notes?: string;
  createdAt: string;
}

const VehicleDetailPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: vehicleData, isLoading: vehicleLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => vehicleAPI.getVehicleById(vehicleId!),
    enabled: !!vehicleId,
  });

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['vehicleStatus', vehicleId, selectedDate],
    queryFn: () => vehicleAPI.getVehicleStatus(vehicleId!, selectedDate),
    enabled: !!vehicleId && !!selectedDate,
  });

  const vehicle: Vehicle | null = vehicleData?.data || null;
  const statusRecords: StatusRecord[] = statusData?.data?.statusRecords || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TRIP':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IDLE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'STOPPED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TRIP':
        return <TruckIcon className="h-4 w-4" />;
      case 'IDLE':
        return <ClockIcon className="h-4 w-4" />;
      case 'STOPPED':
        return <XMarkIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (vehicleLoading) {
    return (
      <Layout title="Loading..." subtitle="Loading vehicle details">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!vehicle) {
    return (
      <Layout title="Vehicle Not Found" subtitle="The requested vehicle could not be found">
        <div className="text-center py-12">
          <p className="text-gray-500">Vehicle not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title={`Vehicle Details - ${vehicle.plateNumber}`} 
      subtitle={`${vehicle.brand} ${vehicle.model} (${vehicle.year})`}
    >
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      {/* Vehicle Info */}
      <Card title="Vehicle Information" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Plate Number</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{vehicle.plateNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Brand & Model</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Year</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{vehicle.year}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Status</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              vehicle.status === 'ACTIVE' 
                ? 'bg-green-100 text-green-800' 
                : vehicle.status === 'MAINTENANCE'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {vehicle.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Location</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{vehicle.location || 'Unknown'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Last Updated</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {format(new Date(vehicle.updatedAt), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
        </div>
      </Card>

      {/* Status Records */}
      <Card 
        title="Status Records" 
        subtitle="Vehicle status history for selected date"
      >
        {/* Date Selector */}
        <div className="mb-6">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <div className="relative max-w-xs">
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <CalendarIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Status Records List */}
        {statusLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : statusRecords.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No status records found for this date</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Records for {format(new Date(selectedDate), 'MMMM dd, yyyy')}
            </h3>
            
            <div className="grid gap-4">
              {statusRecords.map((record: StatusRecord, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg border ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{record.status}</h4>
                        <p className="text-sm text-gray-500">
                          {format(new Date(record.timestamp), 'HH:mm:ss')}
                        </p>
                      </div>
                    </div>
                    
                    {record.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {record.location}
                      </div>
                    )}
                  </div>
                  
                  {record.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default VehicleDetailPage;
