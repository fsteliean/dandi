import { useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ 
    isVisible: false, 
    message: '', 
    type: 'success' 
  });

  const showToast = (message, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast({ isVisible: false, message: '', type: 'success' });
  };

  return {
    toast,
    showToast,
    hideToast
  };
}
