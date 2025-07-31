import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { 
  FaHeart, FaTrash, FaEye, FaMapMarkerAlt, FaBed, FaBath, 
  FaRulerCombined, FaDollarSign, FaFilter, FaSearch, FaHome
} from 'react-icons/fa';
import api from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import PropertyCard from '../../components/Properties/PropertyCard';

const Favorites = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    listingType: '',
    propertyType: '',
    minPrice: '',
    maxPrice: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch favorite properties
  const { data: favoriteProperties, isLoading, error } = useQuery(
    ['favorite-properties'],
    async () => {
      const response = await api.get('/api/properties/user/favorites');
      return response.data.data;
    }
  );

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation(
    async (propertyId) => {
      const response = await api.post(`/api/properties/${propertyId}/favorite`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Property removed from favorites');
        queryClient.invalidateQueries(['favorite-properties']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to remove from favorites');
      },
    }
  );

  const handleRemoveFavorite = (propertyId, propertyTitle) => {
    if (window.confirm(`Remove "${propertyTitle}" from favorites?`)) {
      removeFavoriteMutation.mutate(propertyId);
    }
  };

  const filteredProperties = favoriteProperties?.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         property.location.city.toLowerCase().includes(filters.search.toLowerCase());
    const matchesListingType = !filters.listingType || property.listingType === filters.listingType;
    const matchesPropertyType = !filters.propertyType || property.propertyType === filters.propertyType;
    const matchesMinPrice = !filters.minPrice || property.price >= parseInt(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || property.price <= parseInt(filters.maxPrice);
    
    return matchesSearch && matchesListingType && matchesPropertyType && matchesMinPrice && matchesMaxPrice;
  });

  const stats = {
    total: favoriteProperties?.length || 0,
    forSale: favoriteProperties?.filter(p => p.listingType === 'sale').length || 0,
    forRent: favoriteProperties?.filter(p => p.listingType === 'rent').length || 0,
    totalValue: favoriteProperties?.reduce((sum, p) => sum + p.price, 0) || 0
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                My Favorites
              </h1>
              <p className="text-secondary-600">
                Your saved properties and dream homes
              </p>
            </div>
            <Link to="/properties" className="btn-primary">
              Browse More Properties
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <FaHeart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Favorites</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <FaHome className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">For Sale</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.forSale}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <FaHome className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">For Rent</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.forRent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <FaDollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Value</p>
                <p className="text-2xl font-bold text-secondary-900">
                  ${(stats.totalValue / 1000000).toFixed(1)}M
                </p>
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
              onClick={() => setFilters({ search: '', listingType: '', propertyType: '', minPrice: '', maxPrice: '' })}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              Clear All
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Min Price</label>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Max Price</label>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
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
            <p className="text-red-600">Error loading favorites. Please try again.</p>
          </div>
        ) : filteredProperties?.length === 0 ? (
          <div className="text-center py-12">
            <FaHeart className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              {favoriteProperties?.length === 0 ? 'No favorites yet' : 'No properties match your filters'}
            </h3>
            <p className="text-secondary-600 mb-6">
              {favoriteProperties?.length === 0 
                ? 'Start browsing properties and save your favorites'
                : 'Try adjusting your search criteria'
              }
            </p>
            {favoriteProperties?.length === 0 && (
              <Link to="/properties" className="btn-primary">
                Browse Properties
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
                          
                          <button
                            onClick={() => handleRemoveFavorite(property._id, property.title)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Remove from Favorites"
                          >
                            <FaHeart className="w-4 h-4" />
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
                          <span className="text-secondary-500">
                            Added {new Date(property.createdAt).toLocaleDateString()}
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

        {/* Similar Properties Section */}
        {filteredProperties?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* This would typically show similar properties based on user preferences */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <FaHome className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">Discover More</h3>
                <p className="text-secondary-600 mb-4">
                  Find more properties that match your preferences
                </p>
                <Link to="/properties" className="btn-primary">
                  Browse Properties
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites; 