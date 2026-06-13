import React from 'react';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe 
        src="/legacy.html" 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Legacy Carecay App"
      />
    </div>
  );
}
