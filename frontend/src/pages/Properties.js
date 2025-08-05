import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FaSearch } from 'react-icons/fa';
import api from '../services/api';
import PropertyCard from '../components/Properties/PropertyCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all properties
  const { data: propertiesData, isLoading, error } = useQuery(
    ['properties'],
    async () => {
      const response = await api.get('/api/properties');
      return response.data;
    }
  );

  // Filter properties based on search term
  const filteredProperties = propertiesData?.data?.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.propertyType.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            All Properties
          </h1>
          <p className="text-secondary-600">
            Browse through our collection of properties
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search properties by title or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              {searchTerm ? 'No properties found' : 'No properties available'}
            </h3>
            <p className="text-secondary-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'Be the first to add a property to our marketplace!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map(property => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties; 