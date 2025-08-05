import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes, FaHome, FaBuilding, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Buyer specific fields
    preferredPropertyType: '',
    budgetRange: '',
    preferredLocation: '',
    // Seller specific fields
    companyName: '',
    licenseNumber: '',
    experience: '',
    specialization: ''
  });

  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: userData, isLoading } = useQuery(
    ['user-profile'],
    async () => {
      const response = await api.get('/api/auth/profile');
      return response.data;
    },
    {
      onSuccess: (data) => {
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          // Buyer specific fields
          preferredPropertyType: data.data.preferredPropertyType || '',
          budgetRange: data.data.budgetRange || '',
          preferredLocation: data.data.preferredLocation || '',
          // Seller specific fields
          companyName: data.data.companyName || '',
          licenseNumber: data.data.licenseNumber || '',
          experience: data.data.experience || '',
          specialization: data.data.specialization || ''
        });
      }
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (data) => {
      console.log('Making API call to update profile:', data);
      const response = await api.put('/api/auth/profile', data);
      console.log('API response:', response.data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('Profile update successful:', data);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        queryClient.invalidateQueries(['user-profile']);
      },
      onError: (error) => {
        console.error('Profile update error:', error);
        console.error('Error response:', error.response);
        
        let message = 'Failed to update profile';
        if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.response?.data?.errors) {
          message = error.response.data.errors.map(err => err.msg).join(', ');
        } else if (error.message) {
          message = error.message;
        }
        
        toast.error(message);
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty fields and only send non-empty values
    const updateData = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] && formData[key].trim() !== '') {
        updateData[key] = formData[key];
      }
    });
    
    // Always include name and email if they exist (even if empty for validation)
    if (formData.name !== undefined) updateData.name = formData.name;
    if (formData.email !== undefined) updateData.email = formData.email;
    
    console.log('Sending update data:', updateData);
    updateProfileMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setFormData({
      name: userData?.data?.name || '',
      email: userData?.data?.email || '',
      phone: userData?.data?.phone || '',
      preferredPropertyType: userData?.data?.preferredPropertyType || '',
      budgetRange: userData?.data?.budgetRange || '',
      preferredLocation: userData?.data?.preferredLocation || '',
      companyName: userData?.data?.companyName || '',
      licenseNumber: userData?.data?.licenseNumber || '',
      experience: userData?.data?.experience || '',
      specialization: userData?.data?.specialization || ''
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const user = userData?.data;
  const isSeller = user?.role === 'seller';

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'villa', label: 'Villa' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' }
  ];

  const budgetRanges = [
    { value: 'under-10lakh', label: 'Under ₹10 Lakh' },
    { value: '10lakh-25lakh', label: '₹10 Lakh - ₹25 Lakh' },
    { value: '25lakh-50lakh', label: '₹25 Lakh - ₹50 Lakh' },
    { value: '50lakh-1crore', label: '₹50 Lakh - ₹1 Crore' },
    { value: '1crore-2crore', label: '₹1 Crore - ₹2 Crore' },
    { value: 'over-2crore', label: 'Over ₹2 Crore' }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner (0-2 years)' },
    { value: 'intermediate', label: 'Intermediate (3-5 years)' },
    { value: 'experienced', label: 'Experienced (6-10 years)' },
    { value: 'expert', label: 'Expert (10+ years)' }
  ];

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                My Profile
              </h1>
              <p className="text-secondary-600">
                Manage your account information
              </p>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  isSeller 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {isSeller ? 'Property Seller' : 'Property Buyer'}
                </span>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary flex items-center"
              >
                <FaEdit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <FaUser className="w-10 h-10 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">
                  Profile Picture
                </h3>
                <p className="text-sm text-secondary-600">
                  Profile picture feature coming soon
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-secondary-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="form-group">
                  <label className="form-label flex items-center">
                    <FaUser className="w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter your full name"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-white rounded-lg">
                      <span className="text-secondary-900">{user?.name || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label flex items-center">
                    <FaEnvelope className="w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter your email address"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-white rounded-lg">
                      <span className="text-secondary-900">{user?.email}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label className="form-label flex items-center">
                    <FaPhone className="w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="p-3 bg-white rounded-lg">
                      <span className="text-secondary-900">{user?.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Role-Specific Information */}
            {isSeller ? (
              /* Seller Information */
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                  <FaBuilding className="w-5 h-5 mr-2 text-blue-600" />
                  Seller Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Enter your company name"
                      />
                    ) : (
                      <div className="p-3 bg-white rounded-lg">
                        <span className="text-secondary-900">{user?.companyName || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* License Number */}
                  <div className="form-group">
                    <label className="form-label">License Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Enter your license number"
                      />
                    ) : (
                      <div className="p-3 bg-white rounded-lg">
                        <span className="text-secondary-900">{user?.licenseNumber || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    {isEditing ? (
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Select experience level</option>
                        {experienceLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-white rounded-lg">
                        <span className="text-secondary-900">
                          {experienceLevels.find(l => l.value === user?.experience)?.label || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Specialization */}
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="e.g., Residential, Commercial, Luxury"
                      />
                    ) : (
                      <div className="p-3 bg-white rounded-lg">
                        <span className="text-secondary-900">{user?.specialization || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Buyer Information */
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                  <FaHome className="w-5 h-5 mr-2 text-green-600" />
                  Buyer Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preferred Property Type */}
                  <div className="form-group">
                    <label className="form-label">Preferred Property Type</label>
                    {isEditing ? (
                      <select
                        name="preferredPropertyType"
                        value={formData.preferredPropertyType}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Select property type</option>
                        {propertyTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-white rounded-lg">
                        <span className="text-secondary-900">
                          {propertyTypes.find(t => t.value === user?.preferredPropertyType)?.label || 'Not specified'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Budget Range */}
                  <div className="form-group">
                    <label className="form-label">Budget Range</label>
                    {isEditing ? (
                      <select
                        name="budgetRange"
                        value={formData.budgetRange}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Select budget range</option>
                        {budgetRanges.map(range => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-white rounded-lg">
                        <span className="text-secondary-900">
                          {budgetRanges.find(r => r.value === user?.budgetRange)?.label || 'Not specified'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Preferred Location */}
                  <div className="form-group md:col-span-2">
                    <label className="form-label flex items-center">
                      <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                      Preferred Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="preferredLocation"
                        value={formData.preferredLocation}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="e.g., Downtown, Suburbs, Specific neighborhood"
                      />
                    ) : (
                      <div className="p-3 bg-white rounded-lg">
                        <span className="text-secondary-900">{user?.preferredLocation || 'Not specified'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Account Info */}
            <div className="bg-secondary-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-secondary-600">Member Since</p>
                  <p className="font-medium text-secondary-900">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Last Updated</p>
                  <p className="font-medium text-secondary-900">
                    {new Date(user?.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary flex items-center"
                >
                  <FaTimes className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isLoading}
                  className="btn-primary flex items-center"
                >
                  {updateProfileMutation.isLoading ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 