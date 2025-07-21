'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/services/userService';
import Alert from '@/components/ui/Alert';

// Define interfaces for better type safety
interface PasswordResetResponse {
  success: boolean;
  message?: string;
}

interface ErrorWithResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await requestPasswordReset(email) as PasswordResetResponse;
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Failed to send password reset email');
      }
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      
      // Type-safe error handling
      let errorMessage = 'An error occurred while sending the reset email';
      
      if (err && typeof err === 'object') {
        const error = err as ErrorWithResponse;
        
        // Check for API response error message
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="py-4 px-6 bg-gray-600 text-white text-center">
            <h2 className="text-2xl font-bold">Forgot Password</h2>
          </div>

          <div className="py-8 px-6">
            {success ? (
              <div className="text-center">
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  Password reset email sent! Check your inbox for instructions to reset your password.
                </div>
                <Link 
                  href="/auth/login" 
                  className="text-gray-600 hover:text-gray-800 hover:underline transition-colors duration-200"
                >
                  Return to Login
                </Link>
              </div>
            ) : (
              <>
                <p className="mb-6 text-gray-600">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                {error && (
                  <div className="mb-4">
                    <Alert type="error">{error}</Alert>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email.trim() || !isValidEmail(email)}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-md font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Remember your password?{' '}
                    <Link 
                      href="/auth/login" 
                      className="text-gray-600 hover:text-gray-800 hover:underline transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}