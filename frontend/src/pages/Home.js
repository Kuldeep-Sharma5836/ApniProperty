import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaSearch, FaHome, FaBuilding, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';
import api from '../services/api';
import PropertyCard from '../components/Properties/PropertyCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Home = () => {
  const [searchParams, setSearchParams] = useState({
    search: '',
    propertyType: '',
    listingType: '',
    minPrice: '',
    maxPrice: '',
    city: ''
  });

  // Fetch featured properties
  const { data: featuredProperties, isLoading } = useQuery(
    ['featured-properties'],
    async () => {
      const response = await api.get('/api/properties?limit=6&isFeatured=true');
      return response.data.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key]) {
        params.append(key, searchParams[key]);
      }
    });
    window.location.href = `/properties?${params.toString()}`;
  };

  const propertyTypes = [
    { value: 'house', label: 'House', icon: FaHome },
    { value: 'apartment', label: 'Apartment', icon: FaBuilding },
    { value: 'condo', label: 'Condo', icon: FaBuilding },
    { value: 'commercial', label: 'Commercial', icon: FaBuilding },
  ];

  const listingTypes = [
    { value: 'sale', label: 'For Sale' },
    { value: 'rent', label: 'For Rent' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow">
              Find Your Dream Home
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Discover the perfect property with our comprehensive real estate marketplace
            </p>
            
            {/* Search Form */}
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="bg-white rounded-lg p-6 shadow-large">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <input
                      type="text"
                      name="search"
                      placeholder="Search properties..."
                      value={searchParams.search}
                      onChange={handleSearchChange}
                      className="input-field text-secondary-900"
                    />
                  </div>
                  <div>
                    <select
                      name="propertyType"
                      value={searchParams.propertyType}
                      onChange={handleSearchChange}
                      className="input-field text-secondary-900"
                    >
                      <option value="">Property Type</option>
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      name="listingType"
                      value={searchParams.listingType}
                      onChange={handleSearchChange}
                      className="input-field text-secondary-900"
                    >
                      <option value="">Listing Type</option>
                      {listingTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button type="submit" className="btn-primary w-full">
                      <FaSearch className="inline mr-2" />
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-secondary-600">Properties Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-secondary-600">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-secondary-600">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium properties that offer exceptional value and quality.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties?.map(property => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/properties" className="btn-primary">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">
              We provide comprehensive real estate services to help you find your perfect home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Advanced Search
              </h3>
              <p className="text-secondary-600">
                Find properties with our powerful search and filtering options.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Location Based
              </h3>
              <p className="text-secondary-600">
                Search properties by location with detailed area information.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaDollarSign className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Best Prices
              </h3>
              <p className="text-secondary-600">
                Get the best deals with our competitive pricing and negotiations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of satisfied customers who found their perfect property with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-secondary">
              Get Started
            </Link>
            <Link to="/properties" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 