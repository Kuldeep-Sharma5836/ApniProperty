import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaHome, FaBuilding, FaRulerCombined } from 'react-icons/fa';
import api from '../services/api';
import PropertyCard from '../components/Properties/PropertyCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Home = () => {
  // Fetch recent properties
  const { data: recentProperties, isLoading } = useQuery(
    ['recent-properties'],
    async () => {
      const response = await api.get('/api/properties');
      return response.data.data.slice(0, 6); // Get first 6 properties
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  return (
    <div className="min-h-screen">
      {/* Simple Hero Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find Your Dream Property
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            Simple and easy property marketplace
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/properties" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Browse Properties
            </Link>
            <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors">
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Recent Properties
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">
              Check out the latest properties added to our marketplace.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="large" />
            </div>
          ) : recentProperties?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentProperties.map(property => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                No properties yet
              </h3>
              <p className="text-secondary-600 mb-6">
                Be the first to add a property to our marketplace!
              </p>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          )}

          {recentProperties?.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/properties" className="btn-primary">
                View All Properties
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Simple Features */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">
              Simple and effective property marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHome className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Easy to Use
              </h3>
              <p className="text-secondary-600">
                Simple interface to list and find properties.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRulerCombined className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Detailed Information
              </h3>
              <p className="text-secondary-600">
                Get all essential details about each property.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBuilding className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Multiple Types
              </h3>
              <p className="text-secondary-600">
                Houses, apartments, condos, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join our community and start your property journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Get Started
            </Link>
            <Link to="/properties" className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 