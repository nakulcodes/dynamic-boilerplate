import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from './GoogleLogin';
import { Loader2, X } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  showLoginPopup?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  showLoginPopup = true
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && showLoginPopup) {
      // Show login popup automatically when page loads if not authenticated
      setShowModal(true);
    }
  }, [isLoading, isAuthenticated, showLoginPopup]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-zinc-400">Checking authentication...</p>
        </motion.div>
      </div>
    );
  }

  // If authenticated, show the protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, show login modal
  return (
    <div className="min-h-screen bg-zinc-950 relative">
      {/* Background content (blurred if modal is open) */}
      <div className={`${showModal ? 'blur-sm' : ''} transition-all duration-300`}>
        {children}
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />

            {/* Modal Content */}
            <motion.div
              className="relative bg-zinc-900 rounded-xl p-8 max-w-md w-full mx-4 border border-zinc-800 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            >
      

              {/* Modal Header */}
              <div className="text-center mb-6">

                <h2 className="text-2xl font-bold text-zinc-50 mb-2">
                  Welcome to Dynamic Boilerplate
                </h2>
                <p className="text-zinc-400">
                  Sign in with your Google account to continue
                </p>
              </div>

              {/* Google Login Button */}
              <div className="space-y-4">
                <GoogleLogin
                  className="w-full"
                  onLoginClick={() => setShowModal(false)}
                />

                <p className="text-xs text-zinc-500 text-center">
                  By signing in, you agree to our terms of service and privacy policy.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static login prompt if modal is closed */}
      {!showModal && (
        <motion.div
          className="fixed bottom-6 right-6 z-40"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🔐</span>
            Sign In
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};