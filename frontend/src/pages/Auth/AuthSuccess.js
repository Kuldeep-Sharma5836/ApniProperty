import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } else {
      // No token, redirect to login
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="text-center">
        <div className="mb-4">
          <LoadingSpinner size="large" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Authentication Successful!
        </h2>
        <p className="text-secondary-600">
          Redirecting you to your dashboard...
        </p>
      </div>
    </div>
  );
};

export default AuthSuccess; 