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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const totalDays = startDate && endDate ? calculateDaysBetween(startDate, endDate) : 0;

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await leaveAPI.applyLeave(data);
      toast.success('Leave application submitted successfully!');
      reset();
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
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Total Leave Days:</strong> {totalDays} day{totalDays > 1 ? 's' : ''}
                    </p>
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

                <div className="flex justify-end space-x-3">
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
                    disabled={submitting}
                  >
                    Submit Application
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>
        </div>

        {/* Leave Categories Info */}
        <div>
          <Card>
            <Card.Header>
              <Card.Title>Leave Categories</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="p-3 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Max: {category.max_days} days
                    </p>
                    {category.description && (
                      <p className="text-xs text-gray-500 mt-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                ))}
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
