import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import { leaveAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
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
      const response = await leaveAPI.getAllDoctors();
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
      const response = await leaveAPI.getDoctorLeaveBalance(doctorId, { year });
      setDoctorBalance(response.data.data.balance);
      setSelectedDoctor(response.data.data.doctor);
    } catch (error) {
      toast.error('Failed to load doctor leave balance');
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleViewBalance = (doctor) => {
    setSelectedDoctor(doctor);
    fetchDoctorBalance(doctor.id, currentYear);
    setShowViewModal(true);
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
        <h1 className="text-2xl font-bold text-gray-900">Leave Allocation Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and allocate leave days for doctors by category
        </p>
      </div>

      {/* Year Selector */}
      <Card>
        <Card.Content className="py-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Year:</label>
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
      <Card>
        <Card.Header>
          <Card.Title>Doctors ({doctors.length})</Card.Title>
        </Card.Header>
        <Card.Content>
          {doctors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600">No doctors are registered in the system yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {doctor.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.employee_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={EyeIcon}
                          onClick={() => handleViewBalance(doctor)}
                        >
                          View Balance
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={PlusIcon}
                          onClick={() => handleSetAllocation(doctor)}
                        >
                          Set Allocation
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* View Balance Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={`Leave Balance - ${selectedDoctor?.name} (${currentYear})`}
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Doctor Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {selectedDoctor?.name}</p>
                  <p><strong>Employee ID:</strong> {selectedDoctor?.employee_id}</p>
                  <p><strong>Department:</strong> {selectedDoctor?.department}</p>
                  <p><strong>Email:</strong> {selectedDoctor?.email}</p>
                </div>
              </div>

              {/* Leave Balance */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Leave Allocations</h4>
                {doctorBalance.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📋</div>
                    <p className="text-gray-600">No leave allocations set for {currentYear}</p>
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
                      <div key={balance.category_id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{balance.category_name}</h5>
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
                            <p className="text-gray-600">Total Days</p>
                            <p className="font-medium">{balance.total_days}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Used Days</p>
                            <p className="font-medium text-orange-600">{balance.used_days}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Remaining Days</p>
                            <p className="font-medium text-green-600">{balance.remaining_days}</p>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${balance.total_days > 0 ? (balance.used_days / balance.total_days) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Doctor Information</h4>
            <div className="text-sm text-gray-600">
              <p><strong>Name:</strong> {selectedDoctor?.name}</p>
              <p><strong>Employee ID:</strong> {selectedDoctor?.employee_id}</p>
              <p><strong>Department:</strong> {selectedDoctor?.department}</p>
            </div>
          </div>

          {/* Allocation Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    {category.name} (Max: {category.max_days} days)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Days <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                max={getSelectedCategory()?.max_days || 365}
                value={allocationData.total_days}
                onChange={(e) =>
                  setAllocationData({ ...allocationData, total_days: e.target.value })
                }
                placeholder="Enter total days"
              />
              {getSelectedCategory() && (
                <p className="text-xs text-gray-600 mt-1">
                  Maximum allowed: {getSelectedCategory().max_days} days
                </p>
              )}
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
