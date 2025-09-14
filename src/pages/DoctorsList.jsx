import React, { useState, useEffect } from 'react';
import { 
  UserPlusIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { doctorAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RegisterDoctor from '../components/RegisterDoctor';
import ConfirmationModal from '../components/ConfirmationModal';
import { getAvatarFallback, formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRegisterDoctor, setShowRegisterDoctor] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });

  useEffect(() => {
    fetchDoctors();
  }, [statusFilter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getAllDoctors(statusFilter);
      setDoctors(response.data.data.doctors);
    } catch (error) {
      toast.error('Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorRegistered = () => {
    fetchDoctors(); // Refresh the doctors list
  };

  const handleDeactivateDoctor = (doctor) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Deactivate Doctor',
      message: `Are you sure you want to deactivate ${doctor.name}? They will not be able to access the system until reactivated.`,
      onConfirm: () => deactivateDoctor(doctor.id),
      type: 'warning'
    });
  };

  const handleReactivateDoctor = (doctor) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Reactivate Doctor',
      message: `Are you sure you want to reactivate ${doctor.name}? They will regain access to the system.`,
      onConfirm: () => reactivateDoctor(doctor.id),
      type: 'info'
    });
  };

  const deactivateDoctor = async (doctorId) => {
    try {
      await doctorAPI.deactivateDoctor(doctorId);
      toast.success('Doctor deactivated successfully');
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate doctor');
    } finally {
      setConfirmationModal({ ...confirmationModal, isOpen: false });
    }
  };

  const reactivateDoctor = async (doctorId) => {
    try {
      await doctorAPI.reactivateDoctor(doctorId);
      toast.success('Doctor reactivated successfully');
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reactivate doctor');
    } finally {
      setConfirmationModal({ ...confirmationModal, isOpen: false });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" text="Loading doctors..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Doctors</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage and view all registered doctors
          </p>
        </div>
        <Button
          onClick={() => setShowRegisterDoctor(true)}
          icon={UserPlusIcon}
        >
          Register Doctor
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="active">Active Doctors</option>
          <option value="inactive">Inactive Doctors</option>
        </select>
      </div>

      {/* Doctors List */}
      <Card>
        <Card.Content className="p-0">
          {doctors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👨‍⚕️</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No doctors found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No doctors have registered in the system yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {doctor.profile_picture ? (
                              <img
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                src={`http://localhost:5000${doctor.profile_picture}`}
                                alt={doctor.name}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {getAvatarFallback(doctor.name)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {doctor.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {doctor.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {doctor.employee_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {doctor.department || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {doctor.phone || 'Not provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          doctor.is_active 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
                        }`}>
                          {doctor.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(doctor.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {doctor.is_active ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivateDoctor(doctor)}
                              className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-1"
                            >
                              <XCircleIcon className="w-4 h-4" />
                              <span>Deactivate</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReactivateDoctor(doctor)}
                              className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center space-x-1"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>Reactivate</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Register Doctor Modal */}
      {showRegisterDoctor && (
        <RegisterDoctor
          onClose={() => setShowRegisterDoctor(false)}
          onSuccess={handleDoctorRegistered}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
      />
    </div>
  );
};

export default DoctorsList;
