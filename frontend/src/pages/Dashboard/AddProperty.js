import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { FaUpload, FaTrash, FaHome, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AddProperty = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Load saved form data from localStorage
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('addPropertyFormData');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading saved form data:', error);
      return {};
    }
  };

  // Load saved images from localStorage
  const loadSavedImages = () => {
    try {
      const saved = localStorage.getItem('addPropertyImages');
      if (saved) {
        const imageData = JSON.parse(saved);
        // Convert base64 strings back to File objects
        return imageData.map(img => {
          const byteString = atob(img.data.split(',')[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          return new File([ab], img.name, { type: img.type });
        });
      }
      return [];
    } catch (error) {
      console.error('Error loading saved images:', error);
      return [];
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue
  } = useForm({
    defaultValues: loadSavedData()
  });

  const listingType = watch('listingType');

  // Calculate form completion percentage
  const calculateProgress = () => {
    const formValues = watch();
    const requiredFields = [
      'title', 'description', 'price', 'propertyType', 'listingType',
      'location.address', 'location.city', 'location.state', 'location.zipCode'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], formValues)
        : formValues[field];
      return value && value.toString().trim() !== '';
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const progress = calculateProgress();

  // Add property mutation - moved here to fix initialization order
  const addPropertyMutation = useMutation(
    async (formData) => {
      const data = new FormData();
      
      // Add basic form fields directly
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('propertyType', formData.propertyType);
      data.append('listingType', formData.listingType);
      
      // Add location fields
      data.append('location.address', formData.location?.address || '');
      data.append('location.city', formData.location?.city || '');
      data.append('location.state', formData.location?.state || '');
      data.append('location.zipCode', formData.location?.zipCode || '');
      
      // Handle features
      const features = {};
      if (formData.features) {
        if (formData.features.bedrooms) features.bedrooms = parseInt(formData.features.bedrooms);
        if (formData.features.bathrooms) features.bathrooms = parseInt(formData.features.bathrooms);
        if (formData.features.squareFeet) features.squareFeet = parseInt(formData.features.squareFeet);
        if (formData.features.parking) features.parking = formData.features.parking;
        if (formData.features.amenities && Array.isArray(formData.features.amenities)) {
          features.amenities = formData.features.amenities;
        }
      }
      data.append('features', JSON.stringify(features));

      // Add images
      images.forEach((image, index) => {
        data.append('images', image);
      });

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of data.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await api.post('/api/properties', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('Property creation successful:', data);
        toast.success('Property added successfully!');
        clearSavedData(); // Clear saved data after successful submission
        queryClient.invalidateQueries(['properties']);
        // Use setTimeout to ensure the toast is shown before navigation
        setTimeout(() => {
          navigate('/dashboard/my-properties');
        }, 1000);
      },
      onError: (error) => {
        console.error('Property creation error:', error.response?.data);
        console.error('Full error response:', error.response);
        console.error('Request data:', error.config?.data);
        if (error.response?.data?.errors) {
          // Show validation errors
          error.response.data.errors.forEach(err => {
            toast.error(`${err.path}: ${err.msg}`);
          });
        } else {
          toast.error(error.response?.data?.message || 'Failed to add property');
        }
      },
    }
  );

  // Save form data to localStorage whenever form values change
  useEffect(() => {
    const subscription = watch((value) => {
      // Don't save if we're currently submitting
      if (!uploading && !addPropertyMutation.isLoading) {
        localStorage.setItem('addPropertyFormData', JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, uploading, addPropertyMutation.isLoading]);

  // Show auto-save notification on first load
  useEffect(() => {
    const hasShownNotification = localStorage.getItem('addPropertyAutoSaveNotified');
    if (!hasShownNotification) {
      toast.success('Your form data will be automatically saved as you type', {
        duration: 4000,
        icon: '💾'
      });
      localStorage.setItem('addPropertyAutoSaveNotified', 'true');
    }
  }, []);

  // Warn user before leaving if they have unsaved data
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const savedData = localStorage.getItem('addPropertyFormData');
      if (savedData && Object.keys(JSON.parse(savedData)).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Load saved images on component mount
  useEffect(() => {
    const savedImages = loadSavedImages();
    if (savedImages.length > 0) {
      setIsRestoring(true);
      setImages(savedImages);
      toast.success('Previous form data restored successfully', {
        duration: 3000,
        icon: '🔄'
      });
      setIsRestoring(false);
    }
  }, []);

  // Save images to localStorage whenever images change
  useEffect(() => {
    if (images.length > 0) {
      const imagePromises = images.map(img => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              name: img.name,
              type: img.type,
              data: reader.result
            });
          };
          reader.readAsDataURL(img);
        });
      });

      Promise.all(imagePromises).then(imageData => {
        localStorage.setItem('addPropertyImages', JSON.stringify(imageData));
      });
    } else {
      localStorage.removeItem('addPropertyImages');
    }
  }, [images]);

  // Clear saved data after successful submission
  const clearSavedData = () => {
    localStorage.removeItem('addPropertyFormData');
    localStorage.removeItem('addPropertyImages');
  };

  // Clear form and saved data
  const handleClearForm = () => {
    reset();
    setImages([]);
    clearSavedData();
    toast.success('Form cleared successfully');
  };

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

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    console.log('Form submission started with data:', data);
    
    // Validate required fields
    const requiredFields = {
      title: data.title,
      description: data.description,
      price: data.price,
      propertyType: data.propertyType,
      listingType: data.listingType,
      'location.address': data.location?.address,
      'location.city': data.location?.city,
      'location.state': data.location?.state,
      'location.zipCode': data.location?.zipCode
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || value.toString().trim() === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    // Debug: Log the form data
    console.log('Form data being sent:', data);
    console.log('Images:', images);

    setUploading(true);
    try {
      const result = await addPropertyMutation.mutateAsync(data);
      console.log('Property created successfully:', result);
    } catch (error) {
      console.error('Error creating property:', error);
      // Don't reset the form on error, let the user fix the issues
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

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Add New Property
          </h1>
          <p className="text-secondary-600">
            List your property for sale or rent. Fill in the details below to get started.
          </p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Auto-save enabled - Your progress is automatically saved
          </div>
          {progress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-secondary-600 mb-1">
                <span>Form Progress</span>
                <span>{progress}% Complete</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Debug Panel - only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-3 p-3 bg-gray-100 rounded text-xs">
              <div className="font-semibold mb-1">Debug Info:</div>
              <div>Form Progress: {progress}%</div>
              <div>Images Uploaded: {images.length}</div>
              <div>Uploading: {uploading ? 'Yes' : 'No'}</div>
              <div>Mutation Loading: {addPropertyMutation.isLoading ? 'Yes' : 'No'}</div>
            </div>
          )}
        </div>

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

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Property ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleClearForm}
                className="btn-secondary"
              >
                Clear Form
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/my-properties')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || addPropertyMutation.isLoading}
                className="btn-primary"
              >
                {uploading || addPropertyMutation.isLoading ? (
                  <LoadingSpinner size="small" className="text-white" />
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