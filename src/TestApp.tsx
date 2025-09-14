import React from 'react';

const TestApp = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>Test App - This should be visible!</h1>
      <p>If you can see this, the basic React setup is working.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default TestApp;
