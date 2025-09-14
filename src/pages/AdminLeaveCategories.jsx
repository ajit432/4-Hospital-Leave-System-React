import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { leaveAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminLeaveCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [statusFilter, setStatusFilter] = useState('active');
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });
  const [formData, setFormData] = useState({
    name: '',
    max_days: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [statusFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories...');
      const response = await leaveAPI.getCategories(statusFilter);
      console.log('Categories response:', response.data);
      console.log('Categories data:', response.data.data.categories);
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Fetch categories error:', error);
      toast.error('Failed to load leave categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingCategory(null);
    setFormData({ name: '', max_days: '', description: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      max_days: category.max_days.toString(),
      description: category.description || ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleDeleteClick = (category) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Deactivate Leave Category',
      message: `Are you sure you want to deactivate "${category.name}"? This will prevent new leave applications using this category.`,
      onConfirm: () => deactivateCategory(category.id),
      type: 'warning'
    });
  };

  const handleActivateClick = (category) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Activate Leave Category',
      message: `Are you sure you want to activate "${category.name}"? This will make it available for leave applications.`,
      onConfirm: () => activateCategory(category.id),
      type: 'info'
    });
  };

  const activateCategory = async (categoryId) => {
    try {
      await leaveAPI.activateLeaveCategory(categoryId);
      toast.success('Leave category activated successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate leave category');
    } finally {
      setConfirmationModal({ ...confirmationModal, isOpen: false });
    }
  };

  const deactivateCategory = async (categoryId) => {
    try {
      await leaveAPI.deactivateLeaveCategory(categoryId);
      toast.success('Leave category deactivated successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate leave category');
    } finally {
      setConfirmationModal({ ...confirmationModal, isOpen: false });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    }

    if (!formData.max_days.trim()) {
      errors.max_days = 'Maximum days is required';
    } else {
      const maxDays = parseInt(formData.max_days);
      if (isNaN(maxDays) || maxDays <= 0) {
        errors.max_days = 'Maximum days must be a positive number';
      } else if (maxDays > 365) {
        errors.max_days = 'Maximum days cannot exceed 365';
      }
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const categoryData = {
        name: formData.name.trim(),
        max_days: parseInt(formData.max_days),
        description: formData.description.trim() || null
      };

      if (editingCategory) {
        await leaveAPI.updateLeaveCategory(editingCategory.id, categoryData);
        toast.success('Leave category updated successfully');
      } else {
        await leaveAPI.createLeaveCategory(categoryData);
        toast.success('Leave category created successfully');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Update category error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Failed to save leave category';
      toast.error(errorMessage);
      
      // Additional debugging info
      if (error.response?.status === 404) {
        toast.error('API endpoint not found - check if backend server is running');
      }
    } finally {
      setSubmitting(false);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" text="Loading leave categories..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leave Categories</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage leave categories and their maximum days allocation
          </p>
        </div>
        <Button onClick={handleCreateClick} className="flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>Add Category</span>
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
          <option value="active">Active Categories</option>
          <option value="inactive">Inactive Categories</option>
        </select>
      </div>

      {/* Categories List */}
      <Card>
        <Card.Content className="p-0">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Leave Categories</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first leave category</p>
              <Button onClick={handleCreateClick} className="flex items-center space-x-2 mx-auto">
                <PlusIcon className="w-5 h-5" />
                <span>Add Category</span>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Max Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                              <TagIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {category.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          {category.max_days} days
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          category.is_active 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
                        }`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                          {category.description || (
                            <span className="text-gray-400 dark:text-gray-500 italic">No description</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(category)}
                            className="flex items-center space-x-1"
                          >
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit</span>
                          </Button>
                          {category.is_active ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(category)}
                              className="text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center space-x-1"
                            >
                              <XCircleIcon className="w-4 h-4" />
                              <span>Deactivate</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivateClick(category)}
                              className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center space-x-1"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>Activate</span>
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Leave Category' : 'Create Leave Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Annual Leave, Sick Leave"
              error={formErrors.name}
              required
            />
          </div>

          <div>
            <Input
              label="Maximum Days"
              name="max_days"
              type="number"
              value={formData.max_days}
              onChange={handleInputChange}
              placeholder="e.g., 30"
              min="1"
              max="365"
              error={formErrors.max_days}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-gray-400 dark:text-gray-500">(Optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                formErrors.description ? 'border-red-300 dark:border-red-600' : ''
              }`}
              placeholder="Brief description of the leave category..."
            />
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>


      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        title={confirmationModal.title}
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {confirmationModal.type === 'warning' ? (
                <InformationCircleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              ) : (
                <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {confirmationModal.message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmationModal.onConfirm}
              loading={submitting}
              className={confirmationModal.type === 'warning' ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}
            >
              {confirmationModal.type === 'warning' ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLeaveCategories;
