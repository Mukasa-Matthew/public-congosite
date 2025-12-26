import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handlers to prevent external scripts (browser extensions, etc.) from breaking the app
window.addEventListener('error', (event) => {
  // Filter out errors from external scripts (browser extensions)
  const errorSource = event.filename || '';
  const isExternalScript = 
    errorSource.includes('giveFreely') ||
    errorSource.includes('sharebx') ||
    errorSource.includes('extension://') ||
    errorSource.includes('chrome-extension://') ||
    errorSource.includes('moz-extension://');
  
  if (isExternalScript) {
    // Suppress console errors from external scripts
    event.preventDefault();
    console.warn('External script error suppressed:', event.message);
    return;
  }
  
  // Log other errors normally
  console.error('Application error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  const errorMessage = error?.message || String(error);
  const errorStack = error?.stack || '';
  
  // Filter out errors from external scripts
  const isExternalError = 
    errorMessage.includes('giveFreely') ||
    errorStack.includes('giveFreely') ||
    errorStack.includes('sharebx') ||
    errorStack.includes('extension://') ||
    errorStack.includes('chrome-extension://') ||
    errorStack.includes('moz-extension://');
  
  if (isExternalError) {
    // Suppress promise rejections from external scripts
    event.preventDefault();
    console.warn('External script promise rejection suppressed:', errorMessage);
    return;
  }
  
  // Log other promise rejections normally
  console.error('Unhandled promise rejection:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
