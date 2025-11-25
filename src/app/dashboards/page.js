'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';
import Sidebar from '@/components/Sidebar';
import PlanCard from '@/components/PlanCard';
import APIKeysTable from '@/components/APIKeysTable';
import ApiKeyModal from '@/components/ApiKeyModal';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { apiKeys, isLoading, error, setError, createApiKey, updateApiKey, deleteApiKey } = useApiKeys();
  const { toast, showToast, hideToast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">You must be signed in to access this page.</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Event handlers
  const handleCreate = async (formData) => {
    const result = await createApiKey(formData);
    if (result.success) {
      setShowCreateForm(false);
      setError('');
      showToast('API Key created successfully');
    }
  };

  const handleUpdate = async (formData) => {
    const result = await updateApiKey(editingKey.id, formData);
    if (result.success) {
      setEditingKey(null);
      setError('');
      showToast('API Key updated successfully');
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteApiKey(id);
    if (result.success) {
      setError('');
      showToast('API Key deleted successfully', 'delete');
    }
  };

  const handleEdit = (key) => {
    setEditingKey(key);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied API Key to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      showToast('Failed to copy to clipboard');
    }
  };

  const handleModalSubmit = (formData) => {
    if (editingKey) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
  };

  const handleModalClose = () => {
    setShowCreateForm(false);
    setEditingKey(null);
    setError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Toast Notification */}
      <Toast 
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
        type={toast.type}
      />
      
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          </div>

          {/* Current Plan Section */}
          <PlanCard />

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* API Keys Section */}
          <APIKeysTable 
            apiKeys={apiKeys}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCopy={handleCopy}
            onCreateNew={() => setShowCreateForm(true)}
          />

          {/* Create/Edit Modal */}
          <ApiKeyModal 
            isOpen={showCreateForm || !!editingKey}
            onClose={handleModalClose}
            onSubmit={handleModalSubmit}
            editingKey={editingKey}
          />
        </div>
      </div>
    </div>
  );
}
