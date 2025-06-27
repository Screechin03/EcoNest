import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import './index.css'

// Import context test in development only
if (import.meta.env.DEV) {
  import('./contextTest.jsx')
    .then(() => console.log('Context test module loaded successfully'))
    .catch(err => console.error('Failed to load context test:', err));
}

// Log React version for debugging
console.log('React version:', React.version);

// Expose React to window for the error detection script in index.html
if (typeof window !== 'undefined') {
  window.React = React;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
