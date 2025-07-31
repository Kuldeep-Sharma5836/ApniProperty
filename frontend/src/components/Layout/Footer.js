import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🏡</div>
              <span className="text-xl font-bold text-primary-400">RealEstate</span>
            </div>
            <p className="text-secondary-300 text-sm leading-relaxed">
              Find your dream home with our comprehensive real estate marketplace. 
              Browse properties for sale and rent with advanced search and filtering options.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-secondary-300 hover:text-primary-400 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-secondary-300 hover:text-primary-400 transition-colors text-sm">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-secondary-300 hover:text-primary-400 transition-colors text-sm">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-secondary-300 hover:text-primary-400 transition-colors text-sm">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Property Types</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/properties?propertyType=house" className="text-secondary-300 hover:text-primary-400 transition-colors text-sm">
                  Houses
                </Link>
              </li>
              <li>
                <Link to="/properties?propertyType=apartment" className="text-secondary-300 hover:text-primary-400 transition-colors text-sm">
                  Apartments
                </Link>
              </li>
              <li>
                <Link to="/properties?propertyType=condo" className="text-secondary-300 hover:text-primary-400 transition-colors text-sm">
                  Condos
                </Link>
              </li>
              <li>
                <Link to="/properties?propertyType=commercial" className="text-secondary-300 hover:text-primary-400 transition-colors text-sm">
                  Commercial
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="w-4 h-4 text-primary-400" />
                <span className="text-secondary-300 text-sm">
                  123 Real Estate St, City, State 12345
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="w-4 h-4 text-primary-400" />
                <span className="text-secondary-300 text-sm">
                  (555) 123-4567
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="w-4 h-4 text-primary-400" />
                <span className="text-secondary-300 text-sm">
                  info@realestate.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-secondary-400 text-sm">
              © 2024 RealEstate. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 