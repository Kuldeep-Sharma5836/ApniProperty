import React from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';
import { format } from 'date-fns';

const PropertyCard = ({ property }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeLabel = (type) => {
    const types = {
      house: 'House',
      apartment: 'Apartment',
      condo: 'Condo',
      townhouse: 'Townhouse',
      land: 'Land',
      commercial: 'Commercial',
      other: 'Other'
    };
    return types[type] || type;
  };

  const getListingTypeLabel = (type) => {
    return type === 'sale' ? 'For Sale' : 'For Rent';
  };

  return (
    <div className="property-card group">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={property.primaryImage || property.images[0]?.url || '/placeholder-property.jpg'}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            property.listingType === 'sale' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {getListingTypeLabel(property.listingType)}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="px-2 py-1 text-xs font-medium bg-white text-secondary-800 rounded-full shadow-sm">
            {getPropertyTypeLabel(property.propertyType)}
          </span>
        </div>
        {property.isFeatured && (
          <div className="absolute bottom-4 left-4">
            <span className="px-2 py-1 text-xs font-medium bg-accent-500 text-white rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Price */}
        <div className="mb-3">
          <span className="text-2xl font-bold text-primary-600">
            {formatPrice(property.price)}
          </span>
          {property.listingType === 'rent' && (
            <span className="text-secondary-500 text-sm">/month</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-secondary-900 mb-2 line-clamp-2">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center text-secondary-600 text-sm mb-4">
          <FaMapMarkerAlt className="w-4 h-4 mr-1" />
          <span className="line-clamp-1">
            {property.location.address}, {property.location.city}, {property.location.state}
          </span>
        </div>

        {/* Features */}
        <div className="flex items-center justify-between text-secondary-600 text-sm mb-4">
          <div className="flex items-center space-x-4">
            {property.features.bedrooms && (
              <div className="flex items-center">
                <FaBed className="w-4 h-4 mr-1" />
                <span>{property.features.bedrooms} beds</span>
              </div>
            )}
            {property.features.bathrooms && (
              <div className="flex items-center">
                <FaBath className="w-4 h-4 mr-1" />
                <span>{property.features.bathrooms} baths</span>
              </div>
            )}
            {property.features.squareFeet && (
              <div className="flex items-center">
                <FaRulerCombined className="w-4 h-4 mr-1" />
                <span>{property.features.squareFeet.toLocaleString()} sqft</span>
              </div>
            )}
          </div>
        </div>

        {/* Owner Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {property.owner?.avatar ? (
              <img
                src={property.owner.avatar}
                alt={property.owner.name}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-primary-600 text-sm font-medium">
                  {property.owner?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <span className="text-sm text-secondary-600">
              {property.owner?.name || 'Unknown Owner'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-secondary-500">
              {format(new Date(property.createdAt), 'MMM dd, yyyy')}
            </span>
            <button className="text-secondary-400 hover:text-red-500 transition-colors">
              <FaHeart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/properties/${property._id}`}
          className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard; 