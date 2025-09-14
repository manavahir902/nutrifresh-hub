import React from 'react';
import { createRoot } from "react-dom/client";

const DebugApp = () => {
  console.log('DebugApp rendering...');
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>Debug App - Checking App Component</h1>
      <p>If you can see this, the basic setup is working.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Testing App Component Import:</h2>
        <button onClick={() => {
          try {
            const App = require('./App.tsx').default;
            console.log('App component loaded successfully:', App);
            alert('App component loaded successfully!');
          } catch (error) {
            console.error('Error loading App component:', error);
            alert('Error loading App component: ' + error.message);
          }
        }}>
          Test App Component Import
        </button>
      </div>
    </div>
  );
};

export default DebugApp;
