import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehicleAPI, reportAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { 
  TruckIcon, 
  CalendarIcon, 
  DocumentArrowDownIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import VehicleDetailModal from '../components/VehicleDetailModal';

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

const Dashboard: React.FC = () => {
  const { } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: vehiclesData, isLoading, error } = useQuery({
    queryKey: ['vehicles', currentPage, limit],
    queryFn: () => vehicleAPI.getVehicles(currentPage, limit),
  });

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDownloadReport = async (vehicleId: string) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
      const endDate = new Date();
      
      const response = await reportAPI.downloadReport(
        vehicleId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vehicle-report-${vehicleId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const vehicles = vehiclesData?.data?.vehicles || [];
  const totalPages = vehiclesData?.data?.pagination?.totalPages || 0;

  // Mock statistics data
  const stats = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter((v: Vehicle) => v.status === 'ACTIVE').length,
    maintenanceDue: 3,
    alerts: 2
  };

  return (
    <Layout title="Dashboard" subtitle="Fleet Management Overview" currentPage="dashboard">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Vehicles"
          value={stats.totalVehicles}
          change={{ value: "+2", type: "increase" }}
          icon={<TruckIcon />}
          color="blue"
        />
        <StatCard
          title="Active Vehicles"
          value={stats.activeVehicles}
          change={{ value: "+1", type: "increase" }}
          icon={<CheckCircleIcon />}
          color="green"
        />
        <StatCard
          title="Maintenance Due"
          value={stats.maintenanceDue}
          change={{ value: "-1", type: "decrease" }}
          icon={<ClockIcon />}
          color="yellow"
        />
        <StatCard
          title="Active Alerts"
          value={stats.alerts}
          change={{ value: "0", type: "neutral" }}
          icon={<ExclamationTriangleIcon />}
          color="red"
        />
      </div>

      {/* Vehicle List */}
      <Card 
        title="Vehicle Fleet" 
        subtitle="Manage and monitor your vehicle fleet"
        actions={
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <TruckIcon className="h-4 w-4 mr-2" />
            Add Vehicle
          </button>
        }
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-2" />
              <p>Error loading vehicles</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle: Vehicle) => (
              <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <TruckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{vehicle.plateNumber}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vehicle.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{vehicle.model}</span>
                        <span>•</span>
                        <span>{vehicle.year}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {vehicle.location || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVehicleClick(vehicle)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleDownloadReport(vehicle.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                      Download Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicle={selectedVehicle}
      />
    </Layout>
  );
};

export default Dashboard;