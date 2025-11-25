'use client';

import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a session missing error - if so, don't treat it as an error
    const errorMessage = error?.message || error?.toString() || '';
    if (
      errorMessage.includes('session missing') ||
      errorMessage.includes('Auth session missing') ||
      errorMessage.includes('AuthSessionMissingError')
    ) {
      // This is not a real error - just return null to continue rendering
      return null;
    }
    
    // For other errors, set the error state
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Check if this is a session missing error
    const errorMessage = error?.message || error?.toString() || '';
    if (
      errorMessage.includes('session missing') ||
      errorMessage.includes('Auth session missing') ||
      errorMessage.includes('AuthSessionMissingError')
    ) {
      // Silently ignore these errors
      console.warn('Ignoring session missing error:', error);
      return;
    }
    
    // Log other errors
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    // If it's a session missing error, just render children normally
    if (this.state.error) {
      const errorMessage = this.state.error?.message || this.state.error?.toString() || '';
      if (
        errorMessage.includes('session missing') ||
        errorMessage.includes('Auth session missing') ||
        errorMessage.includes('AuthSessionMissingError')
      ) {
        return this.props.children;
      }
    }
    
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-600">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

