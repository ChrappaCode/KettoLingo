import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';  // Adjust the import path if necessary

// Get the root element in the HTML
const rootElement = document.getElementById('root');

// Use createRoot instead of ReactDOM.render
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
