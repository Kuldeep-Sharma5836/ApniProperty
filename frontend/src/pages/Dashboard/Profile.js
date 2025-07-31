import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      role: user?.role || 'buyer'
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (formData) => {
      const response = await api.put('/api/users/profile', formData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Profile updated successfully!');
        updateProfile(data.data);
        queryClient.invalidateQueries(['user']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      },
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    async (formData) => {
      const response = await api.put('/api/users/change-password', formData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Password changed successfully!');
        setShowPasswordForm(false);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to change password');
      },
    }
  );

  const updateRoleMutation = useMutation(
    async (role) => {
      const response = await api.put('/api/users/role', { role });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(`Role updated to ${data.data.role}`);
        queryClient.invalidateQueries(['user']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update role');
      },
    }
  );

  const handleRoleUpdate = (role) => {
    updateRoleMutation.mutate(role);
  };

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-secondary-600">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-secondary-200">
                <h2 className="text-xl font-semibold text-secondary-900">Basic Information</h2>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                      <input
                        type="text"
                        {...register('name', {
                          required: 'Name is required',
                          minLength: { value: 2, message: 'Name must be at least 2 characters' }
                        })}
                        className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && <p className="form-error">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="form-label">Email Address *</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="form-label">Phone Number</label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                      <input
                        type="tel"
                        {...register('phone')}
                        className="input-field pl-10"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Role</label>
                    <select
                      {...register('role')}
                      className="input-field"
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Address</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-secondary-400 w-4 h-4" />
                    <textarea
                      {...register('address')}
                      rows={3}
                      className="input-field pl-10"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="btn-primary"
                  >
                    {updateProfileMutation.isLoading ? (
                      <LoadingSpinner size="small" className="text-white" />
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-secondary-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-secondary-900">Change Password</h2>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                  </button>
                </div>
              </div>
              
              {showPasswordForm && (
                <form onSubmit={handleSubmit(onPasswordSubmit)} className="p-6 space-y-6">
                  <div>
                    <label className="form-label">Current Password *</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('currentPassword', { required: 'Current password is required' })}
                        className={`input-field pl-10 pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.currentPassword && <p className="form-error">{errors.currentPassword.message}</p>}
                  </div>

                  <div>
                    <label className="form-label">New Password *</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        {...register('newPassword', {
                          required: 'New password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        className={`input-field pl-10 pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showNewPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="form-error">{errors.newPassword.message}</p>}
                  </div>

                  <div>
                    <label className="form-label">Confirm New Password *</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword', { required: 'Please confirm your password' })}
                        className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isLoading}
                      className="btn-primary"
                    >
                      {changePasswordMutation.isLoading ? (
                        <LoadingSpinner size="small" className="text-white" />
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Profile Picture</h3>
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-secondary-200 flex items-center justify-center mb-4">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <FaUser className="w-16 h-16 text-secondary-400" />
                    )}
                  </div>
                  <button className="absolute bottom-2 right-2 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors">
                    <FaCamera className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-secondary-600">
                  Click to upload a new profile picture
                </p>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Member Since</span>
                  <span className="font-medium text-secondary-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Account Status</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Email Verified</span>
                  <span className={`font-medium ${user?.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.isVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Login Method</span>
                  <span className="font-medium text-secondary-900">
                    {user?.googleId ? 'Google' : 'Email'}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Update Section (for testing) */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Update Role (Testing)
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRoleUpdate('buyer')}
                  className="btn-secondary"
                  disabled={updateRoleMutation.isLoading}
                >
                  Set as Buyer
                </button>
                <button
                  onClick={() => handleRoleUpdate('seller')}
                  className="btn-secondary"
                  disabled={updateRoleMutation.isLoading}
                >
                  Set as Seller
                </button>
                <button
                  onClick={() => handleRoleUpdate('admin')}
                  className="btn-secondary"
                  disabled={updateRoleMutation.isLoading}
                >
                  Set as Admin
                </button>
              </div>
              <p className="text-sm text-secondary-600 mt-2">
                Current role: {user?.role}
              </p>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors">
                  Download My Data
                </button>
                <button className="w-full text-left px-4 py-2 text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors">
                  Privacy Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 