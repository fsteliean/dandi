'use client';

import { useState, useEffect } from 'react';

export default function ApiKeyModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingKey = null 
}) {
  const [formData, setFormData] = useState({
    name: '',
    monthlyLimit: 1000
  });

  useEffect(() => {
    if (editingKey) {
      setFormData({
        name: editingKey.name,
        monthlyLimit: editingKey.monthlyLimit || 1000
      });
    } else {
      setFormData({
        name: '',
        monthlyLimit: 1000
      });
    }
  }, [editingKey, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ name: '', monthlyLimit: 1000 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {editingKey ? 'Edit API Key' : 'Create a new API key'}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter a name and limit for the new API key.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Key Name — A unique name to identify this key
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Key Name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Limit monthly usage*
              </label>
              <input
                type="number"
                value={formData.monthlyLimit}
                onChange={(e) => setFormData({...formData, monthlyLimit: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="1000"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                * If the combined usage of all your keys exceeds your plan&apos;s limit, all requests will be rejected.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingKey ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
