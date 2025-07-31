import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaSearch, FaUser, FaHeart, FaPlus, FaBars, FaTimes } from 'react-icons/fa';
import SearchBar from '../Search/SearchBar';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl">🏡</div>
            <span className="text-xl font-bold text-primary-600">RealEstate</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-primary-600' : 'text-secondary-600 hover:text-primary-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/properties"
              className={`text-sm font-medium transition-colors ${
                isActive('/properties') ? 'text-primary-600' : 'text-secondary-600 hover:text-primary-600'
              }`}
            >
              Properties
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-primary-600' : 'text-secondary-600 hover:text-primary-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/add-property"
                  className="btn-primary text-sm"
                >
                  <FaPlus className="inline mr-1" />
                  Add Property
                </Link>
              </>
            )}
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button
              onClick={toggleSearch}
              className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
              <FaSearch className="w-5 h-5" />
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleMenu}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <FaUser className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-secondary-700">
                    {user?.name}
                  </span>
                  {isMenuOpen ? (
                    <FaTimes className="w-4 h-4 text-secondary-500" />
                  ) : (
                    <FaBars className="w-4 h-4 text-secondary-500" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-large border border-secondary-200 py-2">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/my-properties"
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Properties
                    </Link>
                    <Link
                      to="/dashboard/favorites"
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaHeart className="inline mr-2" />
                      Favorites
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-outline text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') ? 'bg-primary-100 text-primary-600' : 'text-secondary-600 hover:bg-secondary-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/properties"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/properties') ? 'bg-primary-100 text-primary-600' : 'text-secondary-600 hover:bg-secondary-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Properties
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/dashboard') ? 'bg-primary-100 text-primary-600' : 'text-secondary-600 hover:bg-secondary-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/add-property"
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaPlus className="inline mr-2" />
                    Add Property
                  </Link>
                  <Link
                    to="/dashboard/my-properties"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Properties
                  </Link>
                  <Link
                    to="/dashboard/favorites"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaHeart className="inline mr-2" />
                    Favorites
                  </Link>
                  <Link
                    to="/dashboard/profile"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Search Bar Overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-large border-t border-secondary-200 p-4">
          <SearchBar onClose={() => setIsSearchOpen(false)} />
        </div>
      )}
    </header>
  );
};

export default Header; 