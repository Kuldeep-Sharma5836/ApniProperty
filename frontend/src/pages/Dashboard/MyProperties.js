import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaHeart, FaMapMarkerAlt, 
  FaBed, FaBath, FaDollarSign, FaCalendarAlt, FaFilter,
  FaSearch, FaHome, FaBuilding, FaRulerCombined
} from 'react-icons/fa';
import api from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const MyProperties = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    listingType: '',
    propertyType: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch user's properties
  const { data: properties, isLoading, error } = useQuery(
    ['my-properties'],
    async () => {
      const response = await api.get('/api/properties/user/my-properties');
      return response.data.data;
    }
  );

  // Delete property mutation
  const deletePropertyMutation = useMutation(
    async (propertyId) => {
      const response = await api.delete(`/api/properties/${propertyId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Property deleted successfully!');
        queryClient.invalidateQueries(['my-properties']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete property');
      },
    }
  );

  // Toggle property status mutation
  const toggleStatusMutation = useMutation(
    async ({ propertyId, status }) => {
      const response = await api.patch(`/api/properties/${propertyId}`, { status });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Property status updated!');
        queryClient.invalidateQueries(['my-properties']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update property status');
      },
    }
  );

  const handleDelete = (propertyId, propertyTitle) => {
    if (window.confirm(`Are you sure you want to delete "${propertyTitle}"?`)) {
      deletePropertyMutation.mutate(propertyId);
    }
  };

  const handleStatusToggle = (propertyId, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    toggleStatusMutation.mutate({ propertyId, status: newStatus });
  };

  const filteredProperties = properties?.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         property.location.city.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || property.status === filters.status;
    const matchesListingType = !filters.listingType || property.listingType === filters.listingType;
    const matchesPropertyType = !filters.propertyType || property.propertyType === filters.propertyType;
    
    return matchesSearch && matchesStatus && matchesListingType && matchesPropertyType;
  });

  const stats = {
    total: properties?.length || 0,
    available: properties?.filter(p => p.status === 'available').length || 0,
    sold: properties?.filter(p => p.status === 'sold').length || 0,
    totalViews: properties?.reduce((sum, p) => sum + (p.views || 0), 0) || 0
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                My Properties
              </h1>
              <p className="text-secondary-600">
                Manage your property listings and track their performance
              </p>
            </div>
            <Link to="/dashboard/add-property" className="btn-primary">
              <FaPlus className="w-4 h-4 mr-2" />
              Add Property
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <FaHome className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Properties</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <FaEye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Available</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.available}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <FaDollarSign className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Sold</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.sold}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <FaEye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Views</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600"
            >
              <FaFilter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={() => setFilters({ search: '', status: '', listingType: '', propertyType: '' })}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              Clear All
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Listing Type</label>
                <select
                  value={filters.listingType}
                  onChange={(e) => setFilters({ ...filters, listingType: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Properties</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Properties List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading properties. Please try again.</p>
          </div>
        ) : filteredProperties?.length === 0 ? (
          <div className="text-center py-12">
            <FaHome className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              {properties?.length === 0 ? 'No properties yet' : 'No properties match your filters'}
            </h3>
            <p className="text-secondary-600 mb-6">
              {properties?.length === 0 
                ? 'Start by adding your first property listing'
                : 'Try adjusting your search criteria'
              }
            </p>
            {properties?.length === 0 && (
              <Link to="/dashboard/add-property" className="btn-primary">
                Add Your First Property
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProperties.map(property => (
              <div key={property._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-6">
                    {/* Property Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={property.primaryImage || property.images[0]?.url || '/placeholder-property.jpg'}
                        alt={property.title}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                            {property.title}
                          </h3>
                          <div className="flex items-center text-secondary-600 mb-2">
                            <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                            <span className="truncate">
                              {property.location.city}, {property.location.state}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-3">
                            {property.features?.bedrooms && (
                              <span className="flex items-center">
                                <FaBed className="w-4 h-4 mr-1" />
                                {property.features.bedrooms} beds
                              </span>
                            )}
                            {property.features?.bathrooms && (
                              <span className="flex items-center">
                                <FaBath className="w-4 h-4 mr-1" />
                                {property.features.bathrooms} baths
                              </span>
                            )}
                            {property.features?.squareFeet && (
                              <span className="flex items-center">
                                <FaRulerCombined className="w-4 h-4 mr-1" />
                                {property.features.squareFeet} sq ft
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold text-primary-600">
                              ${property.price.toLocaleString()}
                              {property.listingType === 'rent' && '/month'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              property.status === 'available' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {property.status}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              property.listingType === 'sale' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            to={`/properties/${property._id}`}
                            className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                            title="View Property"
                          >
                            <FaEye className="w-4 h-4" />
                          </Link>
                          
                          <Link
                            to={`/dashboard/edit-property/${property._id}`}
                            className="p-2 text-secondary-600 hover:text-blue-600 transition-colors"
                            title="Edit Property"
                          >
                            <FaEdit className="w-4 h-4" />
                          </Link>
                          
                          <button
                            onClick={() => handleStatusToggle(property._id, property.status)}
                            className={`p-2 rounded-full transition-colors ${
                              property.status === 'available'
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-orange-600 hover:bg-orange-50'
                            }`}
                            title={property.status === 'available' ? 'Mark as Sold' : 'Mark as Available'}
                          >
                            <FaDollarSign className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(property._id, property.title)}
                            className="p-2 text-secondary-600 hover:text-red-600 transition-colors"
                            title="Delete Property"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="mt-4 pt-4 border-t border-secondary-200">
                        <div className="flex items-center justify-between text-sm text-secondary-600">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <FaEye className="w-4 h-4 mr-1" />
                              {property.views || 0} views
                            </span>
                            <span className="flex items-center">
                              <FaHeart className="w-4 h-4 mr-1" />
                              {property.favorites?.length || 0} favorites
                            </span>
                          </div>
                          <span className="flex items-center">
                            <FaCalendarAlt className="w-4 h-4 mr-1" />
                            Listed {new Date(property.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
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