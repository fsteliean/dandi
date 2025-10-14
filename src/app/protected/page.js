'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';

export default function ProtectedPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidKey, setIsValidKey] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const router = useRouter();

  const showToast = useCallback((message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  }, []);

  const validateApiKey = useCallback(async () => {
    try {
      const apiKey = sessionStorage.getItem('apiKey');
      
      if (!apiKey) {
        showToast('Invalid API key access denied', 'error');
        setIsValidKey(false);
        setIsValidating(false);
        return;
      }

      // Call API to validate the key
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: apiKey }),
      });

      const result = await response.json();

      if (result.success && result.valid) {
        setIsValidKey(true);
        showToast('Valid API Key', 'success');
      } else {
        setIsValidKey(false);
        showToast('Invalid API key access denied', 'error');
      }
    } catch (error) {
      console.error('Validation error:', error);
      setIsValidKey(false);
      showToast('Invalid API key access denied', 'error');
    } finally {
      setIsValidating(false);
    }
  }, [showToast]);

  useEffect(() => {
    validateApiKey();
  }, [validateApiKey]);

  const hideToast = () => {
    setToast({ isVisible: false, message: '', type: 'success' });
  };

  const handleBackToPlayground = () => {
    sessionStorage.removeItem('apiKey');
    router.push('/playground');
  };

  if (isValidating) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating API Key</h2>
            <p className="text-gray-600">Please wait while we verify your API key...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidKey) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-6">The API key you provided is invalid or has expired.</p>
              
              <button
                onClick={handleBackToPlayground}
                className="bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>

        <Toast
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
          type={toast.type}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to API Playground</h1>
              <p className="text-gray-600">Your API key has been validated successfully!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">API Status</h3>
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">API Key: Valid</span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Connection: Active</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Permissions: Read & Write</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Test API Endpoint
                  </button>
                  <button 
                    onClick={() => router.push('/documentation')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Documentation
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleBackToPlayground}
                className="bg-gray-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors mr-4"
              >
                Back to Playground
              </button>
              <button
                onClick={() => router.push('/dashboards')}
                className="bg-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
        type={toast.type}
      />
    </div>
  );
}
