import React, { useState } from 'react';
import FarmerApp from './components/FarmerApp';
import AdminDashboard from './components/AdminDashboard';
import './styles.css';

function App() {
  const [view, setView] = useState('farmer');

  return (
    <div>
      <div className="nav">
        <button 
          onClick={() => setView('farmer')} 
          style={{ fontWeight: view === 'farmer' ? 'bold' : 'normal' }}
        >
          Farmer App View
        </button>
        <button 
          onClick={() => setView('admin')}
          style={{ fontWeight: view === 'admin' ? 'bold' : 'normal' }}
        >
          Admin Dashboard View
        </button>
      </div>

      {view === 'farmer' ? <FarmerApp /> : <AdminDashboard />}
    </div>
  );
}

export default App;
