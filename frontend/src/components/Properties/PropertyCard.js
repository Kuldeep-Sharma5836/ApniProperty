import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaRulerCombined, FaParking, FaSeedling, FaEnvelope, FaPhone, FaComments, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const PropertyCard = ({ property }) => {
  const [showContactModal, setShowContactModal] = useState(false);

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

  const handleContactClick = (e) => {
    e.preventDefault();
    setShowContactModal(true);
  };

  const ContactModal = () => {
    if (!showContactModal) return null;

    const contactOptions = [
      {
        id: 'email',
        title: 'Send Email',
        description: 'Send a direct email to the property owner',
        icon: FaEnvelope,
        action: () => {
          const subject = encodeURIComponent(`Inquiry about ${property.title}`);
          const body = encodeURIComponent(`Hi ${property.owner?.name || 'Property Owner'},

I'm interested in your property "${property.title}" listed for ${formatPrice(property.price)}.

Could you please provide more information about:
- Property availability
- Viewing schedule
- Additional details

Thank you!`);
          window.open(`mailto:${property.owner?.email}?subject=${subject}&body=${body}`);
          toast.success('Email client opened!');
          setShowContactModal(false);
        },
        color: 'bg-blue-500 hover:bg-blue-600'
      },
      {
        id: 'phone',
        title: 'Call Owner',
        description: 'Call the property owner directly',
        icon: FaPhone,
        action: () => {
          if (property.owner?.phone) {
            window.open(`tel:${property.owner.phone}`);
            toast.success('Phone dialer opened!');
          }
          setShowContactModal(false);
        },
        color: 'bg-green-500 hover:bg-green-600',
        disabled: !property.owner?.phone
      },
      {
        id: 'whatsapp',
        title: 'WhatsApp',
        description: 'Send a WhatsApp message',
        icon: FaComments,
        action: () => {
          const message = encodeURIComponent(`Hi! I'm interested in your property "${property.title}" listed for ${formatPrice(property.price)}. Could you provide more information?`);
          const phone = property.owner?.phone?.replace(/\D/g, '');
          if (phone) {
            window.open(`https://wa.me/${phone}?text=${message}`);
            toast.success('WhatsApp opened!');
          }
          setShowContactModal(false);
        },
        color: 'bg-green-600 hover:bg-green-700',
        disabled: !property.owner?.phone
      },
      {
        id: 'sms',
        title: 'Send SMS',
        description: 'Send a text message to the owner',
        icon: FaPhone,
        action: () => {
          const message = encodeURIComponent(`Hi! I'm interested in your property "${property.title}" listed for ${formatPrice(property.price)}. Could you provide more information?`);
          if (property.owner?.phone) {
            window.open(`sms:${property.owner.phone}?body=${message}`);
            toast.success('SMS app opened!');
          }
          setShowContactModal(false);
        },
        color: 'bg-purple-500 hover:bg-purple-600',
        disabled: !property.owner?.phone
      },
      {
        id: 'copy-email',
        title: 'Copy Email',
        description: 'Copy email address to clipboard',
        icon: FaEnvelope,
        action: async () => {
          try {
            await navigator.clipboard.writeText(property.owner?.email || '');
            toast.success('Email copied to clipboard!');
          } catch (error) {
            toast.error('Failed to copy email');
          }
          setShowContactModal(false);
        },
        color: 'bg-gray-500 hover:bg-gray-600'
      }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">
                Contact Property Owner
              </h3>
              <p className="text-sm text-secondary-600">
                Choose how you'd like to contact the owner
              </p>
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="text-secondary-400 hover:text-secondary-600"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Property Info */}
          <div className="p-6 border-b bg-secondary-50">
            <h4 className="font-medium text-secondary-900 mb-2">{property.title}</h4>
            <p className="text-primary-600 font-semibold">{formatPrice(property.price)}</p>
            <p className="text-sm text-secondary-600">
              {property.area.toLocaleString()} sqft • {getPropertyTypeLabel(property.propertyType)}
            </p>
          </div>

          {/* Contact Options */}
          <div className="p-6">
            <div className="space-y-3">
              {contactOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={option.action}
                  disabled={option.disabled}
                  className={`w-full flex items-center p-4 rounded-lg text-white transition-colors ${
                    option.disabled 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : option.color
                  }`}
                >
                  <option.icon className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{option.title}</div>
                    <div className="text-sm opacity-90">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Owner Info */}
            <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
              <h5 className="font-medium text-secondary-900 mb-2">Property Owner</h5>
              <p className="text-sm text-secondary-600">
                <strong>Name:</strong> {property.owner?.name || 'Not provided'}
              </p>
              {property.owner?.email && (
                <p className="text-sm text-secondary-600">
                  <strong>Email:</strong> {property.owner.email}
                </p>
              )}
              {property.owner?.phone && (
                <p className="text-sm text-secondary-600">
                  <strong>Phone:</strong> {property.owner.phone}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t">
            <button
              onClick={() => setShowContactModal(false)}
              className="w-full btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Image */}
        <div className="relative">
        <img
          src={property.primaryImage || property.images[0]?.url || '/placeholder-property.jpg'}
          alt={property.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-xs font-medium bg-white text-secondary-800 rounded-full shadow-sm">
            {getPropertyTypeLabel(property.propertyType)}
            </span>
          </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Price */}
        <div className="mb-3">
          <span className="text-2xl font-bold text-primary-600">
            {formatPrice(property.price)}
          </span>
        </div>

        {/* Title */}
          <h3 className="text-lg font-semibold text-secondary-900 mb-3 line-clamp-2">
          {property.title}
        </h3>

          {/* Area */}
        <div className="flex items-center text-secondary-600 text-sm mb-4">
            <FaRulerCombined className="w-4 h-4 mr-2" />
            <span>{property.area.toLocaleString()} sqft</span>
        </div>

          {/* Facilities */}
          <div className="flex items-center space-x-4 text-secondary-600 text-sm mb-4">
            {property.facilities.parking && (
              <div className="flex items-center">
                <FaParking className="w-4 h-4 mr-1 text-green-500" />
                <span>Parking</span>
              </div>
            )}
            {property.facilities.garden && (
              <div className="flex items-center">
                <FaSeedling className="w-4 h-4 mr-1 text-green-500" />
                <span>Garden</span>
              </div>
            )}
        </div>

        {/* Owner Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-primary-600 text-sm font-medium">
                  {property.owner?.name?.charAt(0) || 'U'}
                </span>
              </div>
            <span className="text-sm text-secondary-600">
              {property.owner?.name || 'Unknown Owner'}
            </span>
          </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Link
              to={`/properties/${property._id}`}
              className="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              View Details
            </Link>
            <button
              onClick={handleContactClick}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
            >
              <FaEnvelope className="w-4 h-4 mr-1" />
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal />
    </>
  );
};

export default PropertyCard; 