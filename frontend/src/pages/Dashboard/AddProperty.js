import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AddProperty = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'villa', label: 'Villa' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' }
  ];

  const onDrop = (acceptedFiles) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const removeImage = (index) => {
    setUploadedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      return newImages;
    });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('price', data.price);
      formData.append('area', data.area);
      formData.append('propertyType', data.propertyType);
      formData.append('parking', data.parking || false);
      formData.append('garden', data.garden || false);

      // Add images if any
      uploadedImages.forEach((image, index) => {
        formData.append('images', image.file);
      });

      await api.post('/api/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Property added successfully!');
      navigate('/my-properties');
    } catch (error) {
      console.error('Add property error:', error);
      const message = error.response?.data?.message || 'Failed to add property. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Add New Property
          </h1>
          <p className="text-secondary-600">
              Fill in the details below to list your property
          </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="form-group">
                  <label className="form-label">Property Title *</label>
                  <input
                    type="text"
                    {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 5,
                    message: 'Title must be at least 5 characters'
                  }
                    })}
                    className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter property title"
              />
              {errors.title && (
                <p className="form-error">{errors.title.message}</p>
              )}
            </div>

            {/* Price and Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  type="number"
                  {...register('price', {
                    required: 'Price is required',
                    min: {
                      value: 0,
                      message: 'Price must be positive'
                    }
                  })}
                  className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                                      placeholder="Enter price in ₹"
                />
                {errors.price && (
                  <p className="form-error">{errors.price.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Area (sqft) *</label>
                <input
                  type="number"
                  {...register('area', {
                    required: 'Area is required',
                    min: {
                      value: 0,
                      message: 'Area must be positive'
                    }
                  })}
                  className={`input-field ${errors.area ? 'border-red-500' : ''}`}
                  placeholder="Enter area in square feet"
                />
                {errors.area && (
                  <p className="form-error">{errors.area.message}</p>
                )}
              </div>
                </div>

            {/* Property Type */}
            <div className="form-group">
                  <label className="form-label">Property Type *</label>
                  <select
                {...register('propertyType', {
                  required: 'Property type is required'
                })}
                    className={`input-field ${errors.propertyType ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
              {errors.propertyType && (
                <p className="form-error">{errors.propertyType.message}</p>
              )}
            </div>

            {/* Facilities */}
            <div className="form-group">
              <label className="form-label">Facilities (Optional)</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('parking')}
                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <span className="text-secondary-700">Parking Available</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('garden')}
                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <span className="text-secondary-700">Garden</span>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">Property Images (Optional)</label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-300 hover:border-primary-400'
                }`}
              >
                <input {...getInputProps()} />
                <FaUpload className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                {isDragActive ? (
                  <p className="text-primary-600">Drop the images here...</p>
                ) : (
            <div>
                    <p className="text-secondary-600">
                      Drag & drop images here, or click to select files
                    </p>
                    <p className="text-sm text-secondary-500 mt-2">
                      Maximum 5 images, 5MB each (optional)
                    </p>
                </div>
                )}
              </div>
                </div>

                {/* Image Preview */}
            {uploadedImages.length > 0 && (
              <div className="form-group">
                <label className="form-label">Uploaded Images</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                        <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/my-properties')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Adding Property...</span>
                  </>
                ) : (
                  'Add Property'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty; 