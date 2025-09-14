import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { leaveAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { calculateDaysBetween, formatDateForInput } from '../utils/helpers';
import { toast } from 'react-toastify';

const ApplyLeave = () => {
  const [categories, setCategories] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setError,
    clearErrors,
  } = useForm();

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const categoryId = watch('category_id');
  const totalDays = startDate && endDate ? calculateDaysBetween(startDate, endDate) : 0;
  
  // Get selected category details
  const selectedCategory = categories.find(cat => cat.id === parseInt(categoryId));
  const maxDaysForCategory = selectedCategory?.max_days || 0;
  
  // Get balance for selected category
  const selectedCategoryBalance = leaveBalance.find(balance => balance.category_id === parseInt(categoryId));
  const remainingDays = selectedCategoryBalance?.remaining_days || 0;

  useEffect(() => {
    fetchCategories();
    fetchLeaveBalance();
  }, []);

  // Real-time validation for max days and balance
  useEffect(() => {
    if (totalDays > 0 && selectedCategory) {
      if (totalDays > maxDaysForCategory) {
        setError('totalDays', {
          type: 'maxDays',
          message: `Total days (${totalDays}) exceed the maximum allowed (${maxDaysForCategory}) for ${selectedCategory.name}`
        });
      } else if (selectedCategoryBalance && totalDays > remainingDays) {
        setError('totalDays', {
          type: 'insufficientBalance',
          message: `Insufficient leave balance. You have ${remainingDays} days remaining for ${selectedCategory.name}`
        });
      } else {
        clearErrors('totalDays');
      }
    } else {
      clearErrors('totalDays');
    }
  }, [totalDays, maxDaysForCategory, selectedCategory, selectedCategoryBalance, remainingDays, setError, clearErrors]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getCategories();
      setCategories(response.data.data.categories);
    } catch (error) {
      toast.error('Failed to load leave categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await leaveAPI.getLeaveBalance();
      setLeaveBalance(response.data.data.balance);
    } catch (error) {
      console.log('Failed to load leave balance:', error);
      // Don't show error toast as some doctors might not have allocations yet
      setLeaveBalance([]);
    }
  };

  const onSubmit = async (data) => {
    // Additional frontend validation before submission
    if (totalDays > maxDaysForCategory) {
      toast.error(`Cannot apply for ${totalDays} days. Maximum allowed for ${selectedCategory?.name} is ${maxDaysForCategory} days.`);
      return;
    }

    if (selectedCategoryBalance && totalDays > remainingDays) {
      toast.error(`Insufficient leave balance. You have ${remainingDays} days remaining for ${selectedCategory?.name}.`);
      return;
    }

    try {
      setSubmitting(true);
      await leaveAPI.applyLeave(data);
      toast.success('Leave application submitted successfully!');
      reset();
      // Refresh balance after successful submission
      fetchLeaveBalance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const today = formatDateForInput(new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
        <p className="mt-1 text-sm text-gray-600">
          Submit a new leave application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Form */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>Leave Application Form</Card.Title>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input"
                    {...register('category_id', {
                      required: 'Please select a leave category',
                    })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} (Max: {category.max_days} days)
                      </option>
                    ))}
                  </select>
                  {selectedCategory && (
                    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <div><strong>Selected:</strong> {selectedCategory.name}</div>
                          <div className="mt-1">Maximum: {selectedCategory.max_days} days per category</div>
                          {selectedCategory.description && (
                            <div className="mt-1 text-xs">{selectedCategory.description}</div>
                          )}
                        </div>
                        {selectedCategoryBalance && (
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Your Allocation</div>
                            <div className="font-medium text-green-600">
                              {remainingDays} of {selectedCategoryBalance.total_days} days remaining
                            </div>
                          </div>
                        )}
                      </div>
                      {!selectedCategoryBalance && (
                        <div className="mt-2 text-xs text-amber-600">
                          ℹ️ No specific allocation found for this category. You can apply up to the category maximum.
                        </div>
                      )}
                    </div>
                  )}
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Start Date"
                    type="date"
                    min={today}
                    {...register('start_date', {
                      required: 'Start date is required',
                    })}
                    error={errors.start_date?.message}
                  />

                  <Input
                    label="End Date"
                    type="date"
                    min={startDate || today}
                    {...register('end_date', {
                      required: 'End date is required',
                      validate: (value) => {
                        if (startDate && value < startDate) {
                          return 'End date cannot be before start date';
                        }
                        return true;
                      },
                    })}
                    error={errors.end_date?.message}
                  />
                </div>

                {totalDays > 0 && (
                  <div className={`p-3 border rounded-lg ${
                    errors.totalDays 
                      ? 'bg-red-50 border-red-200' 
                      : totalDays > maxDaysForCategory && maxDaysForCategory > 0
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                  }`}>
                    <p className={`text-sm ${
                      errors.totalDays 
                        ? 'text-red-800' 
                        : totalDays > maxDaysForCategory && maxDaysForCategory > 0
                          ? 'text-yellow-800'
                          : 'text-blue-800'
                    }`}>
                      <strong>Total Leave Days:</strong> {totalDays} day{totalDays > 1 ? 's' : ''}
                      {selectedCategory && (
                        <span className="ml-2">
                          (Max for {selectedCategory.name}: {maxDaysForCategory} days)
                        </span>
                      )}
                    </p>
                    {errors.totalDays && (
                      <p className="mt-1 text-sm text-red-600">{errors.totalDays.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Leave <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="input"
                    placeholder="Please provide a detailed reason for your leave request..."
                    {...register('reason', {
                      required: 'Reason is required',
                      minLength: {
                        value: 10,
                        message: 'Reason must be at least 10 characters',
                      },
                      maxLength: {
                        value: 500,
                        message: 'Reason cannot exceed 500 characters',
                      },
                    })}
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    icon={CalendarIcon}
                    loading={submitting}
                    disabled={
                      submitting || 
                      errors.totalDays || 
                      (totalDays > maxDaysForCategory && maxDaysForCategory > 0) ||
                      (selectedCategoryBalance && totalDays > remainingDays)
                    }
                  >
                    Submit Application
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>
        </div>

        {/* Leave Balance & Categories Info */}
        <div>
          {/* Leave Balance */}
          {leaveBalance.length > 0 && (
            <Card className="mb-6">
              <Card.Header>
                <Card.Title>Your Leave Balance</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {leaveBalance.map((balance) => (
                    <div key={balance.category_id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{balance.category_name}</h4>
                        <span className="text-sm font-medium text-green-600">
                          {balance.remaining_days} days left
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {balance.used_days} used of {balance.total_days} allocated
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{
                            width: `${balance.total_days > 0 ? (balance.used_days / balance.total_days) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Leave Categories */}
          <Card>
            <Card.Header>
              <Card.Title>Available Leave Categories</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {categories.map((category) => {
                  const categoryBalance = leaveBalance.find(b => b.category_id === category.id);
                  return (
                    <div key={category.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Max: {category.max_days} days per category
                          </p>
                          {category.description && (
                            <p className="text-xs text-gray-500 mt-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                        {categoryBalance && (
                          <div className="text-right text-sm">
                            <div className="font-medium text-green-600">
                              {categoryBalance.remaining_days} available
                            </div>
                            <div className="text-xs text-gray-500">
                              of {categoryBalance.total_days} allocated
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Content>
          </Card>

          {/* Tips */}
          <Card className="mt-6">
            <Card.Header>
              <Card.Title>Application Tips</Card.Title>
            </Card.Header>
            <Card.Content>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Apply for leave at least 3 days in advance</li>
                <li>• Provide a clear and detailed reason</li>
                <li>• Check your leave balance before applying</li>
                <li>• Weekend days are automatically excluded</li>
                <li>• You'll receive email notifications about status updates</li>
              </ul>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
