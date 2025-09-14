import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import { leaveAPI, doctorAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAvatarFallback } from '../utils/helpers';
import { toast } from 'react-toastify';

const AdminLeaveAllocation = () => {
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorBalance, setDoctorBalance] = useState([]);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [allocationData, setAllocationData] = useState({
    category_id: '',
    total_days: '',
    year: new Date().getFullYear(),
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDoctors();
    fetchCategories();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getAllDoctors('active');
      setDoctors(response.data.data.doctors);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await leaveAPI.getCategories();
      setCategories(response.data.data.categories);
    } catch (error) {
      toast.error('Failed to load leave categories');
    }
  };

  const fetchDoctorBalance = async (doctorId, year = currentYear) => {
    try {
      setLoadingBalance(true);
      console.log(`🔍 Fetching balance for doctor ${doctorId}, year ${year}`);
      const response = await leaveAPI.getDoctorLeaveBalance(doctorId, { year });
      console.log('📊 Balance response:', response.data.data);
      console.log('📊 Balance array length:', response.data.data.balance.length);
      console.log('📊 Balance content:', response.data.data.balance);
      
      // Force set to empty array if no data from database
      if (!response.data.data.balance || response.data.data.balance.length === 0) {
        console.log('⚠️ No balance data from database, setting empty array');
        setDoctorBalance([]);
      } else {
        console.log('✅ Setting balance data from database');
        setDoctorBalance(response.data.data.balance);
      }
      setSelectedDoctor(response.data.data.doctor);
    } catch (error) {
      console.error('❌ Failed to load doctor balance:', error);
      toast.error('Failed to load doctor leave balance');
      // Clear balance if failed to fetch
      setDoctorBalance([]);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleViewBalance = (doctor) => {
    console.log('🔍 Opening balance modal for doctor:', doctor);
    setSelectedDoctor(doctor);
    setDoctorBalance([]); // Clear previous balance data
    setShowViewModal(true);
    // Force a fresh fetch with a small delay to ensure modal is open
    setTimeout(() => {
      fetchDoctorBalance(doctor.id, currentYear);
    }, 100);
  };

  const forceClearAndRefresh = () => {
    // Clear all state
    setDoctorBalance([]);
    setSelectedDoctor(null);
    
    // Clear any potential browser cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Force reload data if modal is open
    if (showViewModal && selectedDoctor) {
      fetchDoctorBalance(selectedDoctor.id, currentYear);
    }
    
    toast.success('Cache cleared and data refreshed');
  };

  const handleSetAllocation = (doctor, category = null) => {
    setSelectedDoctor(doctor);
    setAllocationData({
      category_id: category?.category_id || '',
      total_days: category?.total_days || '',
      year: currentYear,
    });
    setShowAllocationModal(true);
  };

  const submitAllocation = async () => {
    if (!allocationData.category_id || !allocationData.total_days) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (allocationData.total_days <= 0) {
      toast.error('Total days must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      await leaveAPI.setDoctorLeaveAllocation(selectedDoctor.id, allocationData);
      toast.success('Leave allocation updated successfully');
      setShowAllocationModal(false);
      
      // Refresh the balance if viewing the same doctor
      if (showViewModal && selectedDoctor) {
        fetchDoctorBalance(selectedDoctor.id, currentYear);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update leave allocation');
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.id == allocationData.category_id);
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leave Allocation Management</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage and allocate leave days for doctors by category
        </p>
      </div>

      {/* Year Selector */}
      <Card>
        <Card.Content className="py-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year:</label>
            <select
              value={currentYear}
              onChange={(e) => {
                setCurrentYear(parseInt(e.target.value));
                if (showViewModal && selectedDoctor) {
                  fetchDoctorBalance(selectedDoctor.id, parseInt(e.target.value));
                }
              }}
              className="input w-auto"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() + i - 2;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </Card.Content>
      </Card>

      {/* Doctors List */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Doctors ({doctors.length})</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Only active doctors are shown for leave allocation</p>
        </div>
        
        <Card>
          <Card.Content className="p-0">
            {doctors.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No active doctors found</h3>
                <p className="text-gray-600 dark:text-gray-400">No active doctors are available for leave allocation</p>
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
                        Email
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
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                  {getAvatarFallback(doctor.name)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {doctor.name}
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
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {doctor.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewBalance(doctor)}
                              className="flex items-center space-x-1"
                            >
                              <EyeIcon className="w-4 h-4" />
                              <span>View Balance</span>
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSetAllocation(doctor)}
                              className="flex items-center space-x-1"
                            >
                              <PlusIcon className="w-4 h-4" />
                              <span>Set Allocation</span>
                            </Button>
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
      </div>

      {/* View Balance Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={
          <div className="flex items-center justify-between">
            <span>{`Leave Balance - ${selectedDoctor?.name} (${currentYear})`}</span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedDoctor && fetchDoctorBalance(selectedDoctor.id, currentYear)}
                disabled={loadingBalance}
              >
                {loadingBalance ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={forceClearAndRefresh}
                disabled={loadingBalance}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Clear Cache
              </Button>
            </div>
          </div>
        }
        size="lg"
      >
        <div className="space-y-4">
          {loadingBalance ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" text="Loading balance..." />
            </div>
          ) : (
            <>
              {/* Doctor Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Doctor Information</h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p><strong>Name:</strong> {selectedDoctor?.name}</p>
                  <p><strong>Employee ID:</strong> {selectedDoctor?.employee_id}</p>
                  <p><strong>Department:</strong> {selectedDoctor?.department}</p>
                  <p><strong>Email:</strong> {selectedDoctor?.email}</p>
                </div>
              </div>

              {/* Leave Balance */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Leave Allocations</h4>
                {doctorBalance.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">📋</div>
                    <p className="text-gray-600 dark:text-gray-400">No leave allocations set for {currentYear}</p>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={PlusIcon}
                      onClick={() => {
                        setShowViewModal(false);
                        handleSetAllocation(selectedDoctor);
                      }}
                      className="mt-3"
                    >
                      Set Allocation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {doctorBalance.map((balance) => (
                      <div key={balance.category_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">{balance.category_name}</h5>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={PencilIcon}
                            onClick={() => {
                              setShowViewModal(false);
                              handleSetAllocation(selectedDoctor, balance);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Total Days</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{balance.total_days}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Used Days</p>
                            <p className="font-medium text-orange-600 dark:text-orange-400">{balance.used_days}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Remaining Days</p>
                            <p className="font-medium text-green-600 dark:text-green-400">{balance.remaining_days}</p>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${balance.total_days > 0 ? (balance.used_days / balance.total_days) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {balance.total_days > 0 ? Math.round((balance.used_days / balance.total_days) * 100) : 0}% used
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Set Allocation Modal */}
      <Modal
        isOpen={showAllocationModal}
        onClose={() => setShowAllocationModal(false)}
        title={`Set Leave Allocation - ${selectedDoctor?.name}`}
        size="md"
      >
        <div className="space-y-4">
          {/* Doctor Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Doctor Information</h4>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p><strong>Name:</strong> {selectedDoctor?.name}</p>
              <p><strong>Employee ID:</strong> {selectedDoctor?.employee_id}</p>
              <p><strong>Department:</strong> {selectedDoctor?.department}</p>
            </div>
          </div>

          {/* Allocation Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leave Category <span className="text-red-500">*</span>
              </label>
              <select
                value={allocationData.category_id}
                onChange={(e) =>
                  setAllocationData({ ...allocationData, category_id: e.target.value })
                }
                className="input"
              >
                <option value="">Select leave category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Days <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={allocationData.total_days}
                onChange={(e) =>
                  setAllocationData({ ...allocationData, total_days: e.target.value })
                }
                placeholder="Enter total days"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={allocationData.year}
                onChange={(e) =>
                  setAllocationData({ ...allocationData, year: parseInt(e.target.value) })
                }
                className="input"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() + i - 2;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowAllocationModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitAllocation}
              loading={submitting}
              disabled={submitting || !allocationData.category_id || !allocationData.total_days}
            >
              Set Allocation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLeaveAllocation;
