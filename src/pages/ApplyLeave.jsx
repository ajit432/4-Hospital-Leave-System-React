import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarIcon, UserIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { leaveAPI, doctorAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import DateInput from '../components/common/DateInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { calculateDaysBetween, formatDateForInput, formatDate, normalizeDate, debounce } from '../utils/helpers';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const ApplyLeave = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [departmentCoverage, setDepartmentCoverage] = useState(null);
  const [overlappingLeaves, setOverlappingLeaves] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

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
    fetchDoctorDetails();
  }, []);

  // Fetch doctor details for validation
  const fetchDoctorDetails = async () => {
    if (!user?.id) return;
    
    try {
      const response = await doctorAPI.getDashboard();
      const doctorData = response.data.data;
      
      // Set doctor details for display
      setDoctorDetails({
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        department: user.department,
        designation: user.designation || 'Doctor' // Default designation
      });
    } catch (error) {
      console.error('Failed to fetch doctor details:', error);
      toast.error('Failed to load doctor information');
    }
  };

  // Comprehensive validation functions
  const validateDoctorId = () => {
    if (!user?.id) {
      setValidationErrors(prev => ({ ...prev, doctorId: 'Doctor ID is required' }));
      return false;
    }
    setValidationErrors(prev => ({ ...prev, doctorId: null }));
    return true;
  };

  const validateDates = (startDate, endDate) => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Start date cannot be in the past (unless applying retrospectively with approval)
    if (start < today) {
      errors.startDate = 'Start date cannot be in the past. For retrospective applications, contact admin.';
    }
    
    // End date must be >= start date
    if (end < start) {
      errors.endDate = 'End date must be on or after start date';
    }
    
    return errors;
  };

  const checkOverlappingLeaves = async (startDate, endDate) => {
    if (!user?.id || !startDate || !endDate) return [];
    
    try {
      // Get all pending and approved leaves for the user
      const response = await leaveAPI.getMyLeaves({ 
        status: 'pending,approved'
      });
      const allLeaves = response.data.data.leaves || [];
      
      console.log('🔍 Checking overlaps for dates:', startDate, 'to', endDate);
      console.log('📋 All leaves:', allLeaves);
      
      // Normalize input dates to YYYY-MM-DD format
      const normalizedStartDate = normalizeDate(startDate);
      const normalizedEndDate = normalizeDate(endDate);
      
      // Convert normalized dates to Date objects for comparison
      const inputStart = new Date(normalizedStartDate);
      const inputEnd = new Date(normalizedEndDate);
      
      console.log('📅 Normalized input dates:', normalizedStartDate, 'to', normalizedEndDate);
      
      // Filter for overlapping leaves
      const overlappingLeaves = allLeaves.filter(leave => {
        // Normalize leave dates to YYYY-MM-DD format
        const normalizedLeaveStart = normalizeDate(leave.start_date);
        const normalizedLeaveEnd = normalizeDate(leave.end_date);
        
        const leaveStart = new Date(normalizedLeaveStart);
        const leaveEnd = new Date(normalizedLeaveEnd);
        
        // Check if the date ranges overlap
        // Two date ranges overlap if: start1 <= end2 AND start2 <= end1
        const overlaps = (inputStart <= leaveEnd && leaveStart <= inputEnd);
        
        console.log(`📅 Checking leave ${leave.id}: ${leave.start_date} (${normalizedLeaveStart}) to ${leave.end_date} (${normalizedLeaveEnd}) (${leave.status})`);
        console.log(`   Input: ${inputStart.toISOString()} to ${inputEnd.toISOString()}`);
        console.log(`   Leave: ${leaveStart.toISOString()} to ${leaveEnd.toISOString()}`);
        console.log(`   Overlaps: ${overlaps}`);
        
        return overlaps;
      });
      
      console.log('✅ Overlapping leaves found:', overlappingLeaves);
      return overlappingLeaves;
    } catch (error) {
      console.error('Error checking overlapping leaves:', error);
      return [];
    }
  };

  const checkDepartmentCoverage = async (startDate, endDate, department) => {
    if (!startDate || !endDate || !department) return null;
    
    try {
      const response = await leaveAPI.checkDepartmentCoverage({
        start_date: startDate,
        end_date: endDate,
        department: department
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error checking department coverage:', error);
      return null;
    }
  };

  // Clear overlapping leaves when dates change
  useEffect(() => {
    if (!startDate || !endDate) {
      setOverlappingLeaves([]);
      setDepartmentCoverage(null);
    }
  }, [startDate, endDate]);

  // Debounced validation function for API calls
  const debouncedValidateLeaveApplication = debounce(async (startDate, endDate, doctorDetails) => {
    const errors = {};
    
    // Only check for overlapping leaves if dates are valid
    if (startDate && endDate) {
      const dateErrors = validateDates(startDate, endDate);
      
      if (!dateErrors.startDate && !dateErrors.endDate) {
        try {
          const overlaps = await checkOverlappingLeaves(startDate, endDate);
          if (overlaps.length > 0) {
            errors.overlapping = `You have ${overlaps.length} overlapping leave application(s) for these dates`;
            setOverlappingLeaves(overlaps);
          } else {
            setOverlappingLeaves([]);
          }
        } catch (error) {
          console.error('Error checking overlapping leaves:', error);
          setOverlappingLeaves([]);
        }
        
        // Check department coverage only if dates are valid
        if (doctorDetails?.department) {
          try {
            const coverage = await checkDepartmentCoverage(startDate, endDate, doctorDetails.department);
            setDepartmentCoverage(coverage);
            if (coverage && !coverage.isCoverageAdequate) {
              errors.departmentCoverage = `Insufficient department coverage. Only ${coverage.availableDoctors} doctors available (minimum required: ${coverage.minimumRequired})`;
            }
          } catch (error) {
            console.error('Error checking department coverage:', error);
            setDepartmentCoverage(null);
          }
        }
      } else {
        // Clear overlapping leaves if dates are invalid
        setOverlappingLeaves([]);
        setDepartmentCoverage(null);
      }
    } else {
      // Clear states when dates are not complete
      setOverlappingLeaves([]);
      setDepartmentCoverage(null);
    }
    
    // Update validation errors
    setValidationErrors(prev => ({ ...prev, ...errors }));
    
    // Update form errors
    Object.keys(errors).forEach(key => {
      if (errors[key]) {
        setError(key, { type: 'custom', message: errors[key] });
      } else {
        clearErrors(key);
      }
    });
  }, 500); // 500ms delay

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear any pending debounced calls
      debouncedValidateLeaveApplication.cancel?.();
    };
  }, []);

  // Real-time validation for max days and balance
  useEffect(() => {
    const validateLeaveApplication = async () => {
      const errors = {};
      
      // Validate doctor ID
      if (!validateDoctorId()) {
        errors.doctorId = 'Doctor ID is required';
      }
      
      // Validate dates
      if (startDate && endDate) {
        const dateErrors = validateDates(startDate, endDate);
        Object.assign(errors, dateErrors);
        
        // Use debounced validation for API calls
        debouncedValidateLeaveApplication(startDate, endDate, doctorDetails);
      } else {
        // Clear states when dates are not complete
        setOverlappingLeaves([]);
        setDepartmentCoverage(null);
      }
      
      // Validate leave balance and category limits
      if (totalDays > 0 && selectedCategory) {
        if (totalDays > maxDaysForCategory) {
          errors.totalDays = `Total days (${totalDays}) exceed the maximum allowed (${maxDaysForCategory}) for ${selectedCategory.name}`;
        } else if (selectedCategoryBalance && totalDays > remainingDays) {
          errors.totalDays = `Insufficient leave balance. You have ${remainingDays} days remaining for ${selectedCategory.name}`;
        }
      }
      
      setValidationErrors(errors);
      
      // Update form errors
      Object.keys(errors).forEach(key => {
        if (key !== 'totalDays') {
          setError(key, { type: 'custom', message: errors[key] });
        } else {
          setError('totalDays', { type: 'custom', message: errors[key] });
        }
      });
      
      // Clear errors for fields that are now valid
      Object.keys(validationErrors).forEach(key => {
        if (!errors[key] && validationErrors[key]) {
          clearErrors(key);
        }
      });
    };
    
    validateLeaveApplication();
  }, [totalDays, maxDaysForCategory, selectedCategory, selectedCategoryBalance, remainingDays, startDate, endDate, doctorDetails, setError, clearErrors]);

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
    // Comprehensive validation before submission
    const hasErrors = Object.values(validationErrors).some(error => error !== null);
    
    if (hasErrors) {
      toast.error('Please fix all validation errors before submitting');
      return;
    }

    // Additional frontend validation before submission
    if (totalDays > maxDaysForCategory) {
      toast.error(`Cannot apply for ${totalDays} days. Maximum allowed for ${selectedCategory?.name} is ${maxDaysForCategory} days.`);
      return;
    }

    if (selectedCategoryBalance && totalDays > remainingDays) {
      toast.error(`Insufficient leave balance. You have ${remainingDays} days remaining for ${selectedCategory?.name}.`);
      return;
    }

    // Check for overlapping leaves one more time
    if (overlappingLeaves.length > 0) {
      toast.error('You have overlapping leave applications. Please check your existing leaves.');
      return;
    }

    // Check department coverage
    if (departmentCoverage && !departmentCoverage.isCoverageAdequate) {
      const proceed = window.confirm(
        `Warning: Insufficient department coverage. Only ${departmentCoverage.availableDoctors} doctors available (minimum required: ${departmentCoverage.minimumRequired}). Do you want to proceed?`
      );
      if (!proceed) return;
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Apply for Leave</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
                {/* Doctor Details Section */}
                {doctorDetails && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                      <UserIcon className="h-5 w-5 mr-2" />
                      Doctor Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Doctor ID
                        </label>
                        <Input
                          value={doctorDetails.employee_id || doctorDetails.id}
                          readOnly
                          className="bg-gray-100 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Full Name
                        </label>
                        <Input
                          value={doctorDetails.name}
                          readOnly
                          className="bg-gray-100 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Department / Specialty
                        </label>
                        <Input
                          value={doctorDetails.department || 'Not specified'}
                          readOnly
                          className="bg-gray-100 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Designation
                        </label>
                        <Input
                          value={doctorDetails.designation}
                          readOnly
                          className="bg-gray-100 dark:bg-gray-700"
                        />
                      </div>
                    </div>
                    {validationErrors.doctorId && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {validationErrors.doctorId}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-600 dark:text-gray-300">
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
                            <div className="text-xs text-gray-500 dark:text-gray-400">Your Allocation</div>
                            <div className="font-medium text-green-600 dark:text-green-400">
                              {remainingDays} of {selectedCategoryBalance.total_days} days remaining
                            </div>
                          </div>
                        )}
                      </div>
                      {!selectedCategoryBalance && (
                        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                          ℹ️ No specific allocation found for this category. You can apply up to the category maximum.
                        </div>
                      )}
                    </div>
                  )}
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category_id.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DateInput
                    label="Start Date"
                    min={today}
                    {...register('start_date', {
                      required: 'Start date is required',
                    })}
                    error={errors.start_date?.message || validationErrors.startDate}
                  />

                  <DateInput
                    label="End Date"
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
                    error={errors.end_date?.message || validationErrors.endDate}
                  />
                </div>

                {/* Overlapping Leaves Warning */}
                {overlappingLeaves.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Overlapping Leave Applications Found
                        </h4>
                        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                          You have {overlappingLeaves.length} existing leave application(s) that overlap with your selected dates:
                        </p>
                        <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                          {overlappingLeaves.map((leave, index) => (
                            <li key={index}>
                              {leave.category_name}: {formatDate(leave.start_date, 'dd-MM-yyyy')} to {formatDate(leave.end_date, 'dd-MM-yyyy')} ({leave.status})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Department Coverage Warning */}
                {departmentCoverage && !departmentCoverage.isCoverageAdequate && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Department Coverage Warning
                        </h4>
                        <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                          Only {departmentCoverage.availableDoctors} doctors available in {doctorDetails?.department} 
                          (minimum required: {departmentCoverage.minimumRequired}). 
                          Coverage: {departmentCoverage.coveragePercentage}%. 
                          This may impact department operations.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {totalDays > 0 && (
                  <div className={`p-3 border rounded-lg ${
                    errors.totalDays 
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                      : totalDays > maxDaysForCategory && maxDaysForCategory > 0
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}>
                    <p className={`text-sm ${
                      errors.totalDays 
                        ? 'text-red-800 dark:text-red-300' 
                        : totalDays > maxDaysForCategory && maxDaysForCategory > 0
                          ? 'text-yellow-800 dark:text-yellow-300'
                          : 'text-blue-800 dark:text-blue-300'
                    }`}>
                      <strong>Total Leave Days:</strong> {totalDays} day{totalDays > 1 ? 's' : ''}
                      {selectedCategory && (
                        <span className="ml-2">
                          (Max for {selectedCategory.name}: {maxDaysForCategory} days)
                        </span>
                      )}
                    </p>
                    {errors.totalDays && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.totalDays.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reason.message}</p>
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
                      (selectedCategoryBalance && totalDays > remainingDays) ||
                      Object.values(validationErrors).some(error => error !== null) ||
                      overlappingLeaves.length > 0
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
                    <div key={balance.category_id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{balance.category_name}</h4>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {balance.remaining_days} days left
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {balance.used_days} used of {balance.total_days} allocated
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full"
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
                    <div key={category.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{category.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Max: {category.max_days} days per category
                          </p>
                          {category.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                        {categoryBalance && (
                          <div className="text-right text-sm">
                            <div className="font-medium text-green-600 dark:text-green-400">
                              {categoryBalance.remaining_days} available
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
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
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
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
