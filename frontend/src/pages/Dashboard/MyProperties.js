import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaPlus, FaEdit, FaTrash, FaRulerCombined, FaParking, FaSeedling, FaHome } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const MyProperties = () => {
  // Fetch user's properties
  const { data: propertiesData, isLoading, error, refetch } = useQuery(
    ['my-properties'],
    async () => {
      const response = await api.get('/api/properties/user/my-properties');
      return response.data;
    }
  );

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/api/properties/${propertyId}`);
        toast.success('Property deleted successfully');
        refetch();
      } catch (error) {
        console.error('Delete property error:', error);
        toast.error('Failed to delete property');
      }
    }
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Error Loading Properties</h2>
          <p className="text-secondary-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                My Properties
              </h1>
              <p className="text-secondary-600">
                Manage your listed properties
              </p>
            </div>
            <Link to="/add-property" className="btn-primary">
              <FaPlus className="inline mr-2" />
              Add Property
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : propertiesData?.data?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              No properties yet
            </h3>
            <p className="text-secondary-600 mb-6">
              Start by adding your first property to the marketplace.
            </p>
            <Link to="/add-property" className="btn-primary">
              <FaPlus className="inline mr-2" />
                Add Your First Property
              </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {propertiesData?.data?.map(property => (
              <div key={property._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="md:flex">
                  {/* Image Section */}
                  <div className="md:w-1/3">
                    <div className="relative h-64 md:h-full">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0].url}
                        alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary-200 flex items-center justify-center">
                          <FaHome className="w-16 h-16 text-secondary-400" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-xs font-medium bg-white text-secondary-800 rounded-full shadow-sm">
                          {getPropertyTypeLabel(property.propertyType)}
                        </span>
                      </div>
                    </div>
                    </div>

                  {/* Content Section */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                            {property.title}
                          </h3>
                        <div className="text-2xl font-bold text-primary-600 mb-3">
                          {formatPrice(property.price)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                          <Link
                          to={`/edit-property/${property._id}`}
                          className="bg-primary-100 p-2 rounded-lg hover:bg-primary-200 transition-colors"
                            title="Edit Property"
                          >
                          <FaEdit className="w-4 h-4 text-primary-600" />
                          </Link>
                          <button
                          onClick={() => handleDelete(property._id)}
                          className="bg-red-100 p-2 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete Property"
                          >
                          <FaTrash className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-secondary-600">
                        <FaRulerCombined className="w-4 h-4 mr-2" />
                        <span>{property.area.toLocaleString()} sqft</span>
                      </div>

                      {/* Facilities */}
                          <div className="flex items-center space-x-4">
                        {property.facilities.parking && (
                          <div className="flex items-center text-green-600">
                            <FaParking className="w-4 h-4 mr-1" />
                            <span className="text-sm">Parking</span>
                          </div>
                        )}
                        {property.facilities.garden && (
                          <div className="flex items-center text-green-600">
                            <FaSeedling className="w-4 h-4 mr-1" />
                            <span className="text-sm">Garden</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Images */}
                    {property.images && property.images.length > 1 && (
                      <div className="mb-4">
                        <p className="text-sm text-secondary-600 mb-2">Additional Images:</p>
                        <div className="flex space-x-2">
                          {property.images.slice(1, 4).map((image, index) => (
                            <img
                              key={index}
                              src={image.url}
                              alt={`${property.title} ${index + 2}`}
                              className="w-16 h-16 object-cover rounded-lg border border-secondary-200"
                            />
                          ))}
                          {property.images.length > 4 && (
                            <div className="w-16 h-16 bg-secondary-100 rounded-lg flex items-center justify-center border border-secondary-200">
                              <span className="text-xs text-secondary-600">
                                +{property.images.length - 4}
                          </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Link
                        to={`/properties/${property._id}`}
                        className="btn-primary text-sm"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/edit-property/${property._id}`}
                        className="btn-secondary text-sm"
                      >
                        <FaEdit className="inline mr-1" />
                        Edit
                      </Link>
                    </div>

                    {/* Date Info */}
                    <div className="mt-4 pt-4 border-t border-secondary-200">
                      <p className="text-xs text-secondary-500">
                        Listed on {new Date(property.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProperties; 