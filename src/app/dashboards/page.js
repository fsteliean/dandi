'use client';

import { useState } from 'react';
import Link from 'next/link';
import Toast from '@/components/Toast';
import Sidebar from '@/components/Sidebar';
import PlanCard from '@/components/PlanCard';
import APIKeysTable from '@/components/APIKeysTable';
import ApiKeyModal from '@/components/ApiKeyModal';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useToast } from '@/hooks/useToast';

export default function Dashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { apiKeys, isLoading, error, setError, createApiKey, updateApiKey, deleteApiKey } = useApiKeys();
  const { toast, showToast, hideToast } = useToast();

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
