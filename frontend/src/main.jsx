// src/main.jsx (REVERT to this standard structure)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import your main App component
//import './index.css'; // Assuming you have a global CSS file
import './i18n/i18n'; // Import your i18n configuration to initialize it

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App /> {/* Render your App component */}
  </React.StrictMode>
);