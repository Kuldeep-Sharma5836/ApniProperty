import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { FaUpload, FaTrash, FaHome, FaBuilding, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch property details
  const { data: property, isLoading, error } = useQuery(
    ['property', id],
    async () => {
      const response = await api.get(`/api/properties/${id}`);
      return response.data.data;
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue
  } = useForm();

  const listingType = watch('listingType');

  // Update form when property data loads
  useEffect(() => {
    if (property) {
      setValue('title', property.title);
      setValue('description', property.description);
      setValue('price', property.price);
      setValue('propertyType', property.propertyType);
      setValue('listingType', property.listingType);
      setValue('status', property.status);
      setValue('location.address', property.location?.address || '');
      setValue('location.city', property.location?.city || '');
      setValue('location.state', property.location?.state || '');
      setValue('location.zipCode', property.location?.zipCode || '');
      setValue('features.bedrooms', property.features?.bedrooms || '');
      setValue('features.bathrooms', property.features?.bathrooms || '');
      setValue('features.squareFeet', property.features?.squareFeet || '');
      setValue('features.parking', property.features?.parking || '');
      setValue('features.amenities', property.features?.amenities || []);
      
      setExistingImages(property.images || []);
    }
  }, [property, setValue]);

  // Update property mutation
  const updatePropertyMutation = useMutation(
    async (formData) => {
      const data = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'features') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      // Add new images
      images.forEach((image, index) => {
        data.append('images', image);
      });

      // Add existing images that weren't removed
      data.append('existingImages', JSON.stringify(existingImages));

      const response = await api.put(`/api/properties/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Property updated successfully!');
        queryClient.invalidateQueries(['properties']);
        queryClient.invalidateQueries(['property', id]);
        navigate('/dashboard/my-properties');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update property');
      },
    }
  );

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValid) {
        toast.error(`${file.name} is not a valid image file`);
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
      }
      
      return isValid && isValidSize;
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (images.length === 0 && existingImages.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setUploading(true);
    try {
      await updatePropertyMutation.mutateAsync(data);
    } finally {
      setUploading(false);
    }
  };

  const propertyTypes = [
    { value: 'house', label: 'House', icon: FaHome },
    { value: 'apartment', label: 'Apartment', icon: FaBuilding },
    { value: 'condo', label: 'Condo', icon: FaBuilding },
    { value: 'townhouse', label: 'Townhouse', icon: FaHome },
    { value: 'land', label: 'Land', icon: FaMapMarkerAlt },
    { value: 'commercial', label: 'Commercial', icon: FaBuilding },
    { value: 'other', label: 'Other', icon: FaHome }
  ];

  const amenities = [
    'pool', 'garden', 'balcony', 'fireplace', 'central-heating',
    'air-conditioning', 'dishwasher', 'washer-dryer', 'gym',
    'security-system', 'elevator', 'furnished', 'pet-friendly'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">Property Not Found</h1>
          <p className="text-secondary-600 mb-6">The property you're trying to edit doesn't exist.</p>
          <button onClick={() => navigate('/dashboard/my-properties')} className="btn-primary">
            Back to My Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={() => navigate('/dashboard/my-properties')}
                  className="text-secondary-600 hover:text-primary-600"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-bold text-secondary-900">
                  Edit Property
                </h1>
              </div>
              <p className="text-secondary-600">
                Update your property listing information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Property Title *</label>
                  <input
                    type="text"
                    {...register('title', {
                      required: 'Property title is required',
                      minLength: { value: 5, message: 'Title must be at least 5 characters' }
                    })}
                    className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="e.g., Beautiful 3-bedroom house in downtown"
                  />
                  {errors.title && <p className="form-error">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="form-label">Property Type *</label>
                  <select
                    {...register('propertyType', { required: 'Property type is required' })}
                    className={`input-field ${errors.propertyType ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.propertyType && <p className="form-error">{errors.propertyType.message}</p>}
                </div>

                <div>
                  <label className="form-label">Listing Type *</label>
                  <select
                    {...register('listingType', { required: 'Listing type is required' })}
                    className={`input-field ${errors.listingType ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select listing type</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                  {errors.listingType && <p className="form-error">{errors.listingType.message}</p>}
                </div>

                <div>
                  <label className="form-label">Status *</label>
                  <select
                    {...register('status', { required: 'Status is required' })}
                    className={`input-field ${errors.status ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select status</option>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="pending">Pending</option>
                  </select>
                  {errors.status && <p className="form-error">{errors.status.message}</p>}
                </div>

                <div>
                  <label className="form-label">Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                      $
                    </span>
                    <input
                      type="number"
                      {...register('price', {
                        required: 'Price is required',
                        min: { value: 0, message: 'Price must be positive' }
                      })}
                      className={`input-field pl-8 ${errors.price ? 'border-red-500' : ''}`}
                      placeholder="Enter price"
                    />
                  </div>
                  {errors.price && <p className="form-error">{errors.price.message}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label className="form-label">Description *</label>
                <textarea
                  {...register('description', {
                    required: 'Description is required',
                    minLength: { value: 20, message: 'Description must be at least 20 characters' }
                  })}
                  rows={4}
                  className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Describe your property in detail..."
                />
                {errors.description && <p className="form-error">{errors.description.message}</p>}
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    {...register('location.address', { required: 'Address is required' })}
                    className={`input-field ${errors['location.address'] ? 'border-red-500' : ''}`}
                    placeholder="Street address"
                  />
                  {errors['location.address'] && <p className="form-error">{errors['location.address'].message}</p>}
                </div>

                <div>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    {...register('location.city', { required: 'City is required' })}
                    className={`input-field ${errors['location.city'] ? 'border-red-500' : ''}`}
                    placeholder="City"
                  />
                  {errors['location.city'] && <p className="form-error">{errors['location.city'].message}</p>}
                </div>

                <div>
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    {...register('location.state', { required: 'State is required' })}
                    className={`input-field ${errors['location.state'] ? 'border-red-500' : ''}`}
                    placeholder="State"
                  />
                  {errors['location.state'] && <p className="form-error">{errors['location.state'].message}</p>}
                </div>

                <div>
                  <label className="form-label">ZIP Code *</label>
                  <input
                    type="text"
                    {...register('location.zipCode', { required: 'ZIP code is required' })}
                    className={`input-field ${errors['location.zipCode'] ? 'border-red-500' : ''}`}
                    placeholder="ZIP code"
                  />
                  {errors['location.zipCode'] && <p className="form-error">{errors['location.zipCode'].message}</p>}
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                Property Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Bedrooms</label>
                  <input
                    type="number"
                    {...register('features.bedrooms', { min: 0 })}
                    className="input-field"
                    placeholder="Number of bedrooms"
                  />
                </div>

                <div>
                  <label className="form-label">Bathrooms</label>
                  <input
                    type="number"
                    {...register('features.bathrooms', { min: 0 })}
                    className="input-field"
                    placeholder="Number of bathrooms"
                  />
                </div>

                <div>
                  <label className="form-label">Square Feet</label>
                  <input
                    type="number"
                    {...register('features.squareFeet', { min: 0 })}
                    className="input-field"
                    placeholder="Square footage"
                  />
                </div>



                <div>
                  <label className="form-label">Parking</label>
                  <select {...register('features.parking')} className="input-field">
                    <option value="">Select parking type</option>
                    <option value="none">None</option>
                    <option value="street">Street</option>
                    <option value="garage">Garage</option>
                    <option value="covered">Covered</option>
                  </select>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-6">
                <label className="form-label">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map(amenity => (
                    <label key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={amenity}
                        {...register('features.amenities')}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-secondary-700 capitalize">
                        {amenity.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                Property Images
              </h2>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-secondary-900 mb-3">Current Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image?.url || image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center">
                  <FaUpload className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                  <div className="text-sm text-secondary-600 mb-4">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="font-medium text-primary-600 hover:text-primary-500">
                        Click to upload
                      </span>
                      {' '}or drag and drop
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-secondary-500">
                    PNG, JPG, GIF up to 5MB each
                  </p>
                </div>

                {/* New Image Preview */}
                {images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-3">New Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`New Property ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/dashboard/my-properties')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || updatePropertyMutation.isLoading}
                className="btn-primary"
              >
                {uploading || updatePropertyMutation.isLoading ? (
                  <LoadingSpinner size="small" className="text-white" />
                ) : (
                  'Update Property'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProperty; 