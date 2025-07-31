import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaHome, FaHeart, FaPlus, FaEye, FaEdit, FaTrash, FaChartLine, FaDollarSign, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch user's properties
  const { data: myProperties, isLoading: loadingProperties } = useQuery(
    ['my-properties'],
    async () => {
      const response = await api.get('/api/properties/user/my-properties');
      return response.data.data;
    }
  );

  // Fetch favorite properties
  const { data: favoriteProperties, isLoading: loadingFavorites } = useQuery(
    ['favorite-properties'],
    async () => {
      const response = await api.get('/api/properties/user/favorites');
      return response.data.data;
    }
  );

  const stats = [
    {
      title: 'My Properties',
      value: myProperties?.length || 0,
      icon: FaHome,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Favorites',
      value: favoriteProperties?.length || 0,
      icon: FaHeart,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Total Views',
      value: myProperties?.reduce((sum, prop) => sum + (prop.views || 0), 0) || 0,
      icon: FaEye,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Listings',
      value: myProperties?.filter(prop => prop.status === 'available').length || 0,
      icon: FaChartLine,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Property',
      description: 'List your property for sale or rent',
      icon: FaPlus,
      link: '/dashboard/add-property',
      color: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      title: 'My Properties',
      description: 'Manage your property listings',
      icon: FaHome,
      link: '/dashboard/my-properties',
      color: 'bg-secondary-600 hover:bg-secondary-700'
    },
    {
      title: 'Favorites',
      description: 'View your saved properties',
      icon: FaHeart,
      link: '/dashboard/favorites',
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      title: 'Profile Settings',
      description: 'Update your account information',
      icon: FaEdit,
      link: '/dashboard/profile',
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-secondary-600 mt-1">
                Manage your properties and track your real estate activities
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard/add-property" className="btn-primary">
                <FaPlus className="w-4 h-4 mr-2" />
                Add Property
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`${action.color} text-white rounded-lg p-6 transition-colors duration-200`}
              >
                <div className="flex items-center mb-3">
                  <action.icon className="w-6 h-6 mr-3" />
                  <h3 className="font-semibold">{action.title}</h3>
                </div>
                <p className="text-sm opacity-90">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Properties */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-secondary-900">My Recent Properties</h2>
                <Link to="/dashboard/my-properties" className="text-primary-600 hover:text-primary-700 text-sm">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {loadingProperties ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="medium" />
                </div>
              ) : myProperties?.length === 0 ? (
                <div className="text-center py-8">
                  <FaHome className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No properties yet</h3>
                  <p className="text-secondary-600 mb-4">
                    Start by adding your first property listing
                  </p>
                  <Link to="/dashboard/add-property" className="btn-primary">
                    Add Property
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myProperties?.slice(0, 5).map(property => (
                    <div key={property._id} className="flex items-center space-x-4 p-4 border border-secondary-200 rounded-lg">
                      <img
                        src={property.primaryImage || property.images[0]?.url || '/placeholder-property.jpg'}
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-secondary-900 truncate">{property.title}</h3>
                        <p className="text-sm text-secondary-600">
                          <FaMapMarkerAlt className="inline w-3 h-3 mr-1" />
                          {property.location.city}, {property.location.state}
                        </p>
                        <p className="text-sm font-medium text-primary-600">
                          ${property.price.toLocaleString()}
                          {property.listingType === 'rent' && '/month'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.status === 'available' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Favorite Properties */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-secondary-900">Favorite Properties</h2>
                <Link to="/dashboard/favorites" className="text-primary-600 hover:text-primary-700 text-sm">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {loadingFavorites ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="medium" />
                </div>
              ) : favoriteProperties?.length === 0 ? (
                <div className="text-center py-8">
                  <FaHeart className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No favorites yet</h3>
                  <p className="text-secondary-600 mb-4">
                    Start browsing properties and save your favorites
                  </p>
                  <Link to="/properties" className="btn-primary">
                    Browse Properties
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {favoriteProperties?.slice(0, 5).map(property => (
                    <div key={property._id} className="flex items-center space-x-4 p-4 border border-secondary-200 rounded-lg">
                      <img
                        src={property.primaryImage || property.images[0]?.url || '/placeholder-property.jpg'}
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-secondary-900 truncate">{property.title}</h3>
                        <p className="text-sm text-secondary-600">
                          <FaMapMarkerAlt className="inline w-3 h-3 mr-1" />
                          {property.location.city}, {property.location.state}
                        </p>
                        <p className="text-sm font-medium text-primary-600">
                          ${property.price.toLocaleString()}
                          {property.listingType === 'rent' && '/month'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.listingType === 'sale' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-secondary-200">
            <h2 className="text-xl font-semibold text-secondary-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-lg">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <FaPlus className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-secondary-900">
                    <span className="font-medium">Property added</span> - Beautiful 3-bedroom house in downtown
                  </p>
                  <p className="text-xs text-secondary-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaEye className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-secondary-900">
                    <span className="font-medium">Property viewed</span> - Modern apartment in uptown
                  </p>
                  <p className="text-xs text-secondary-500">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-lg">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FaHeart className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-secondary-900">
                    <span className="font-medium">Property favorited</span> - Luxury condo with city view
                  </p>
                  <p className="text-xs text-secondary-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 