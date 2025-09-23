import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/auth.service';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed) {
      console.log('AuthCallback: Already processed, skipping');
      return;
    }

    const handleCallback = async () => {
      try {
        console.log('AuthCallback: Starting callback handling');
        setHasProcessed(true);

        const token = searchParams.get('token');
        const error = searchParams.get('error');
        const callbackStatus = searchParams.get('status');

        console.log('AuthCallback: URL params:', { token: !!token, error, callbackStatus });

        if (error || callbackStatus === 'error') {
          console.error('AuthCallback: Error in callback', { error, callbackStatus });
          setStatus('error');
          setMessage(error || 'Authentication failed');
          return;
        }

        if (!token) {
          console.error('AuthCallback: No token received');
          setStatus('error');
          setMessage('No authentication token received');
          return;
        }

        console.log('AuthCallback: Token received, checking expiry');
        // Verify token is not expired
        if (AuthService.isTokenExpired(token)) {
          console.error('AuthCallback: Token is expired');
          setStatus('error');
          setMessage('Authentication token has expired');
          return;
        }

        console.log('AuthCallback: Extracting user data from token');
        // Extract user data from token
        const user = AuthService.extractUserFromToken(token);
        console.log('AuthCallback: Extracted user:', user);

        if (!user) {
          console.error('AuthCallback: Failed to extract user from token');
          setStatus('error');
          setMessage('Invalid authentication token');
          return;
        }

        console.log('AuthCallback: Logging in user');
        // Login the user
        login(token, user);
        setStatus('success');
        setMessage('Successfully authenticated! Redirecting...');

        console.log('AuthCallback: Setting up redirect timer');
        // Redirect to main app after a short delay
        setTimeout(() => {
          console.log('AuthCallback: Navigating to home page');
          navigate('/', { replace: true });
        }, 1500);

      } catch (error) {
        console.error('Authentication callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication');
      }
    };

    handleCallback();
  }, []); // Empty dependency array to run only once

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div
        className="text-center max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
        >
          {getIcon()}
        </motion.div>

        <motion.h1
          className="text-2xl font-bold text-zinc-50 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Welcome!'}
          {status === 'error' && 'Authentication Failed'}
        </motion.h1>

        <motion.p
          className={`text-lg ${getStatusColor()} mb-8`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {message}
        </motion.p>

        {status === 'error' && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-6 py-3 rounded-lg transition-colors"
            >
              Return to Home
            </button>
            <button
              onClick={() => AuthService.redirectToGoogleLogin()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            className="flex items-center justify-center gap-2 text-zinc-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Redirecting to application...</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};