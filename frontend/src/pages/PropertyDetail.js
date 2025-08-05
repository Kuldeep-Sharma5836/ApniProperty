import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaRulerCombined, FaParking, FaSeedling, FaUser, FaArrowLeft, FaEnvelope, FaPhone } from 'react-icons/fa';
import api from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const PropertyDetail = () => {
  const { id } = useParams();

  const { data: propertyData, isLoading, error } = useQuery(
    ['property', id],
    async () => {
      const response = await api.get(`/api/properties/${id}`);
      return response.data;
    }
  );

  const property = propertyData?.data;

  const formatPrice = (price) => {
    // Convert to Indian Rupees format
    if (price >= 10000000) {
      // Convert to crores
      const crores = (price / 10000000).toFixed(2);
      return `₹${crores} Crore`;
    } else if (price >= 100000) {
      // Convert to lakhs
      const lakhs = (price / 100000).toFixed(2);
      return `₹${lakhs} Lakh`;
    } else {
      // For smaller amounts, use regular formatting
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }
  };

  const getPropertyTypeLabel = (type) => {
    const types = {
      house: 'House',
      apartment: 'Apartment',
      condo: 'Condo',
      villa: 'Villa',
      land: 'Land',
      commercial: 'Commercial'
    };
    return types[type] || type;
  };

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
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Property Not Found</h2>
          <p className="text-secondary-600 mb-4">The property you're looking for doesn't exist.</p>
          <Link to="/properties" className="btn-primary">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/properties" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <div>
                  <img
                    src={property.images[0].url}
                    alt={property.title}
                    className="w-full h-96 object-cover"
                  />
                  {property.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 p-4">
                      {property.images.slice(1).map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={`${property.title} ${index + 2}`}
                          className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-secondary-200 flex items-center justify-center">
                  <span className="text-secondary-500">No images available</span>
                </div>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full mb-2">
                  {getPropertyTypeLabel(property.propertyType)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                {property.title}
              </h1>
              <div className="text-3xl font-bold text-primary-600 mb-4">
                {formatPrice(property.price)}
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                Property Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaRulerCombined className="w-5 h-5 text-secondary-400 mr-3" />
                  <span className="text-secondary-600">Area:</span>
                  <span className="ml-2 font-medium text-secondary-900">
                    {property.area.toLocaleString()} sqft
                  </span>
                </div>
                
                {/* Facilities */}
                <div className="flex items-center space-x-6">
                  <span className="text-secondary-600">Facilities:</span>
                  <div className="flex space-x-4">
                    {property.facilities.parking && (
                      <div className="flex items-center">
                        <FaParking className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-secondary-700">Parking</span>
                      </div>
                    )}
                    {property.facilities.garden && (
                      <div className="flex items-center">
                        <FaSeedling className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-secondary-700">Garden</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                Property Owner
              </h2>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <FaUser className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">
                    {property.owner?.name || 'Unknown Owner'}
                  </p>
                  <p className="text-sm text-secondary-600">
                    Listed on {new Date(property.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaEnvelope className="w-4 h-4 text-secondary-400 mr-3" />
                  <span className="text-secondary-600">Email:</span>
                  <span className="ml-2 text-secondary-900">
                    {property.owner?.email || 'Email not available'}
                  </span>
                </div>
                {property.owner?.phone && (
                  <div className="flex items-center">
                    <FaPhone className="w-4 h-4 text-secondary-400 mr-3" />
                    <span className="text-secondary-600">Phone:</span>
                    <span className="ml-2 text-secondary-900">
                      {property.owner.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button className="w-full btn-primary">
                Contact Owner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail; 