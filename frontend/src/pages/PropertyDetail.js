import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { 
  FaHeart, FaShare, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, 
  FaCar, FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaStar,
  FaChevronLeft, FaChevronRight, FaEye, FaHome
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import PropertyCard from '../components/Properties/PropertyCard';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Fetch property details
  const { data: property, isLoading, error } = useQuery(
    ['property', id],
    async () => {
      const response = await api.get(`/api/properties/${id}`);
      return response.data.data;
    }
  );

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation(
    async () => {
      const response = await api.post(`/api/properties/${id}/favorite`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['property', id]);
        queryClient.invalidateQueries(['favorite-properties']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update favorite');
      },
    }
  );

  // Contact seller mutation
  const contactMutation = useMutation(
    async (formData) => {
      const response = await api.post(`/api/properties/${id}/contact`, formData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Message sent successfully!');
        setShowContactForm(false);
        setContactForm({ name: '', email: '', phone: '', message: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to send message');
      },
    }
  );

  // Fetch similar properties
  const { data: similarProperties } = useQuery(
    ['similar-properties', property?.propertyType, property?.location?.city],
    async () => {
      if (!property) return [];
      const response = await api.get(`/api/properties?propertyType=${property.propertyType}&city=${property.location.city}&limit=3`);
      return response.data.data.filter(p => p._id !== id);
    },
    {
      enabled: !!property,
    }
  );

  const handleImageChange = (direction) => {
    if (!property?.images?.length) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    contactMutation.mutate(contactForm);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
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
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">Property Not Found</h1>
          <p className="text-secondary-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/properties')} className="btn-primary">
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  const currentImage = property.images[currentImageIndex] || property.primaryImage;

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <button onClick={() => navigate('/')} className="text-secondary-600 hover:text-primary-600">
              Home
            </button>
            <span className="text-secondary-400">/</span>
            <button onClick={() => navigate('/properties')} className="text-secondary-600 hover:text-primary-600">
              Properties
            </button>
            <span className="text-secondary-400">/</span>
            <span className="text-secondary-900">{property.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative">
                {property.images?.length > 0 ? (
                  <>
                    <img
                      src={currentImage?.url || currentImage}
                      alt={property.title}
                      className="w-full h-96 object-cover"
                    />
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={() => handleImageChange('prev')}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all"
                        >
                          <FaChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleImageChange('next')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all"
                        >
                          <FaChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {property.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-96 bg-secondary-200 flex items-center justify-center">
                    <FaHome className="w-16 h-16 text-secondary-400" />
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {property.images?.length > 1 && (
                <div className="p-4 border-t border-secondary-200">
                  <div className="flex space-x-2 overflow-x-auto">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                          index === currentImageIndex ? 'border-primary-500' : 'border-secondary-200'
                        }`}
                      >
                        <img
                          src={image?.url || image}
                          alt={`${property.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                    {property.title}
                  </h1>
                  <p className="text-xl font-semibold text-primary-600 mb-2">
                    ${property.price.toLocaleString()}
                    {property.listingType === 'rent' && '/month'}
                  </p>
                  <div className="flex items-center text-secondary-600">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                    <span>
                      {property.location.address}, {property.location.city}, {property.location.state} {property.location.zipCode}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                  >
                    <FaShare className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleFavoriteMutation.mutate()}
                    className={`p-2 rounded-full transition-colors ${
                      property.isFavorited
                        ? 'text-red-600 bg-red-100'
                        : 'text-secondary-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <FaHeart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {property.features?.bedrooms && (
                  <div className="flex items-center space-x-2">
                    <FaBed className="w-5 h-5 text-secondary-400" />
                    <span className="text-secondary-700">{property.features.bedrooms} Bedrooms</span>
                  </div>
                )}
                {property.features?.bathrooms && (
                  <div className="flex items-center space-x-2">
                    <FaBath className="w-5 h-5 text-secondary-400" />
                    <span className="text-secondary-700">{property.features.bathrooms} Bathrooms</span>
                  </div>
                )}
                {property.features?.squareFeet && (
                  <div className="flex items-center space-x-2">
                    <FaRulerCombined className="w-5 h-5 text-secondary-400" />
                    <span className="text-secondary-700">{property.features.squareFeet} sq ft</span>
                  </div>
                )}
                {property.features?.parking && (
                  <div className="flex items-center space-x-2">
                    <FaCar className="w-5 h-5 text-secondary-400" />
                    <span className="text-secondary-700">{property.features.parking}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-3">Description</h2>
                <p className="text-secondary-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.features?.amenities?.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-3">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {property.features.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <FaStar className="w-4 h-4 text-primary-500" />
                        <span className="text-secondary-700 capitalize">{amenity.replace('-', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Similar Properties */}
            {similarProperties?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Similar Properties</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {similarProperties.map(prop => (
                    <PropertyCard key={prop._id} property={prop} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Contact Information</h2>
              
              {property.owner && (
                <div className="mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <FaUser className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{property.owner.name}</p>
                      <p className="text-sm text-secondary-600">Property Owner</p>
                    </div>
                  </div>
                  
                  {property.contactInfo?.phone && (
                    <div className="flex items-center space-x-2 mb-2">
                      <FaPhone className="w-4 h-4 text-secondary-400" />
                      <span className="text-secondary-700">{property.contactInfo.phone}</span>
                    </div>
                  )}
                  
                  {property.contactInfo?.email && (
                    <div className="flex items-center space-x-2 mb-4">
                      <FaEnvelope className="w-4 h-4 text-secondary-400" />
                      <span className="text-secondary-700">{property.contactInfo.email}</span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="w-full btn-primary"
              >
                Contact Seller
              </button>
            </div>

            {/* Contact Form */}
            {showContactForm && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Send Message</h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="form-label">Message *</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={4}
                      className="input-field"
                      placeholder="I'm interested in this property..."
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={contactMutation.isLoading}
                      className="flex-1 btn-primary"
                    >
                      {contactMutation.isLoading ? <LoadingSpinner size="small" /> : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Property Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Property Type</span>
                  <span className="font-medium text-secondary-900 capitalize">{property.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Listing Type</span>
                  <span className="font-medium text-secondary-900 capitalize">{property.listingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Status</span>
                  <span className={`font-medium ${
                    property.status === 'available' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {property.status}
                  </span>
                </div>
                {property.features?.yearBuilt && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Year Built</span>
                    <span className="font-medium text-secondary-900">{property.features.yearBuilt}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-secondary-600">Views</span>
                  <span className="font-medium text-secondary-900">{property.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Listed</span>
                  <span className="font-medium text-secondary-900">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail; 