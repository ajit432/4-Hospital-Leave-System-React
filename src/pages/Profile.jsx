import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { CameraIcon, KeyIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { doctorAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { getAvatarFallback, isValidImageFile, formatFileSize } from '../utils/helpers';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      department: user?.department || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await doctorAPI.updateProfile(data);
      updateUser(response.data.data.user);
      toast.success('Profile updated successfully');
      reset(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setLoading(true);
      await doctorAPI.changePassword(data);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!isValidImageFile(file)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await doctorAPI.uploadProfilePicture(formData);
      const updatedUser = { ...user, profile_picture: response.data.data.profile_picture };
      updateUser(updatedUser);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoRemove = async () => {
    try {
      setRemovingPhoto(true);
      await doctorAPI.removeProfilePicture();
      const updatedUser = { ...user, profile_picture: null };
      updateUser(updatedUser);
      toast.success('Profile picture removed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove profile picture');
    } finally {
      setRemovingPhoto(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Picture Section */}
      <Card>
        <Card.Header>
          <Card.Title>Profile Picture</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex items-center space-x-6">
            <div className="relative">
              {user?.profile_picture ? (
                <img
                  className="w-24 h-24 rounded-full object-cover"
                  src={`http://localhost:5000${user.profile_picture}`}
                  alt={user.name}
                />
              ) : (
                <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {getAvatarFallback(user?.name)}
                  </span>
                </div>
              )}
              {(uploadingPhoto || removingPhoto) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <div className="mt-2">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto || removingPhoto}
                />
                
                {user?.profile_picture ? (
                  // Show both options when profile picture exists
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={CameraIcon}
                      disabled={uploadingPhoto || removingPhoto}
                      onClick={triggerFileInput}
                    >
                      {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={TrashIcon}
                      disabled={uploadingPhoto || removingPhoto}
                      onClick={handlePhotoRemove}
                      className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                    >
                      {removingPhoto ? 'Removing...' : 'Remove Photo'}
                    </Button>
                  </div>
                ) : (
                  // Show only upload option when no profile picture
                  <Button
                    variant="outline"
                    size="sm"
                    icon={CameraIcon}
                    disabled={uploadingPhoto}
                    onClick={triggerFileInput}
                  >
                    {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Profile Information */}
      <Card>
        <Card.Header>
          <Card.Title>Personal Information</Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
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
                label="Email Address"
                type="email"
                value={user?.email}
                disabled
                className="bg-gray-50"
              />

              <Input
                label="Employee ID"
                value={user?.employee_id}
                disabled
                className="bg-gray-50"
              />

              <Input
                label="Department"
                {...register('department')}
                error={errors.department?.message}
              />

              <Input
                label="Phone Number"
                type="tel"
                {...register('phone', {
                  pattern: {
                    value: /^[+]?[(]?[\d\s\-\(\)]{10,}$/,
                    message: 'Please enter a valid phone number',
                  },
                })}
                error={errors.phone?.message}
              />

              <Input
                label="Role"
                value={user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
              >
                Reset
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>

      {/* Security Settings */}
      <Card>
        <Card.Header>
          <Card.Title>Security Settings</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Password</h4>
              <p className="text-sm text-gray-600">
                Change your password to keep your account secure
              </p>
            </div>
            <Button
              variant="outline"
              icon={KeyIcon}
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            {...registerPassword('currentPassword', {
              required: 'Current password is required',
            })}
            error={passwordErrors.currentPassword?.message}
          />

          <Input
            label="New Password"
            type="password"
            {...registerPassword('newPassword', {
              required: 'New password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
              },
            })}
            error={passwordErrors.newPassword?.message}
          />

          <Input
            label="Confirm New Password"
            type="password"
            {...registerPassword('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === newPassword || 'Passwords do not match',
            })}
            error={passwordErrors.confirmPassword?.message}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Change Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;