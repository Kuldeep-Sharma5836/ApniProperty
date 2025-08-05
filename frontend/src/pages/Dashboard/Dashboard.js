import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaHome, FaPlus, FaUser, FaChartBar } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Dashboard = () => {
  // Fetch user's properties
  const { data: propertiesData, isLoading } = useQuery(
    ['my-properties'],
    async () => {
      const response = await api.get('/api/properties/my-properties');
      return response.data;
    }
  );

  const properties = propertiesData?.data || [];
  const totalProperties = properties.length;
  const totalValue = properties.reduce((sum, property) => sum + property.price, 0);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Dashboard
          </h1>
          <p className="text-secondary-600">
            Welcome back! Here's an overview of your property portfolio.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <FaHome className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-600">Total Properties</p>
                <p className="text-2xl font-bold text-secondary-900">{totalProperties}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <FaChartBar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-600">Total Value</p>
                <p className="text-2xl font-bold text-secondary-900">{formatPrice(totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FaUser className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-600">Account Status</p>
                <p className="text-2xl font-bold text-secondary-900">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/add-property"
              className="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <FaPlus className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-secondary-900">Add New Property</p>
                <p className="text-sm text-secondary-600">List a new property</p>
              </div>
            </Link>

            <Link
              to="/my-properties"
              className="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <FaHome className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-secondary-900">My Properties</p>
                <p className="text-sm text-secondary-600">Manage your listings</p>
              </div>
            </Link>

            <Link
              to="/profile"
              className="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <FaUser className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-secondary-900">Edit Profile</p>
                <p className="text-sm text-secondary-600">Update your information</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary-900">
              Recent Properties
            </h2>
            <Link
              to="/my-properties"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                No properties yet
              </h3>
              <p className="text-secondary-600 mb-4">
                Start by adding your first property to the marketplace.
              </p>
              <Link to="/add-property" className="btn-primary">
                Add Your First Property
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.slice(0, 3).map(property => (
                <div
                  key={property._id}
                  className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-secondary-200 rounded-lg mr-4">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0].url}
                          alt={property.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaHome className="w-6 h-6 text-secondary-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{property.title}</p>
                      <p className="text-sm text-secondary-600">
                        {property.propertyType} • {property.area.toLocaleString()} sqft
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{formatPrice(property.price)}</p>
                    <p className="text-xs text-secondary-500">
                      {new Date(property.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 