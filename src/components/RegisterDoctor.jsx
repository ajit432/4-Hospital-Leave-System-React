import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../services/api';
import Button from './common/Button';
import Input from './common/Input';
import Card from './common/Card';
import { toast } from 'react-toastify';

const RegisterDoctor = ({ onClose, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await authAPI.registerDoctor(data);
      
      if (response.data.success) {
        toast.success('Doctor registered successfully!');
        reset();
        onSuccess?.();
        onClose?.();
      } else {
        toast.error(response.data.message || 'Failed to register doctor');
      }
    } catch (error) {
      console.error('Doctor registration error:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to register doctor. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Register New Doctor
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <Card className="border-0 shadow-none">
          <Card.Content className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Full Name"
                type="text"
                autoComplete="name"
                required
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                error={errors.name?.message}
              />

              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                required
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
                error={errors.email?.message}
              />

              <Input
                label="Employee ID"
                type="text"
                required
                {...register('employee_id', {
                  required: 'Employee ID is required',
                  minLength: {
                    value: 1,
                    message: 'Employee ID is required',
                  },
                })}
                error={errors.employee_id?.message}
              />

              <Input
                label="Department"
                type="text"
                {...register('department')}
                error={errors.department?.message}
              />

              <Input
                label="Phone Number"
                type="tel"
                {...register('phone', {
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Please enter a valid phone number',
                  },
                })}
                error={errors.phone?.message}
              />

              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                    },
                  })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ top: '32px' }}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
                error={errors.confirmPassword?.message}
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={loading}
                  disabled={loading}
                >
                  Register Doctor
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default RegisterDoctor;
