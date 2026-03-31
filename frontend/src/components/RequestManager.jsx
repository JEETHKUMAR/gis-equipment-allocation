import React, { useState, useEffect } from 'react';

export default function RequestManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/requests`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${apiUrl}/api/requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        fetchRequests();
      } else if (res.status === 400) {
        const errorData = await res.json();
        alert(`Allocation Failed: ${errorData.error}`);
      } else {
        console.error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleCompleteRequest = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/api/requests/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (res.ok) {
        fetchRequests();
      } else {
        const errorData = await res.json();
        alert(`Failed to complete job: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error completing job:', err);
    }
  };
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">Pending</span>;
      case 'approved':
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      case 'allocated':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200">Allocated</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full border border-gray-200">{status || 'Unknown'}</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">Farmer Requests Command Center</h2>
        <button 
          onClick={fetchRequests} 
          className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-semibold shadow-sm"
        >
          Refresh Data
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-left bg-white text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Farmer Phone</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Equipment Requested</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Coordinates [Lat, Lng]</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading requests...</td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No requests found.</td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req._id || req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{req.farmer_id}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {req.equipment_type} <span className="text-xs text-gray-400">({req.farm_size} acres, {req.crop})</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono">
                    {req.location?.coordinates ? `[${req.location.coordinates[1].toFixed(4)}, ${req.location.coordinates[0].toFixed(4)}]` : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {req.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(req._id || req.id, 'approved')}
                          className="text-green-700 hover:text-green-900 font-medium px-3 py-1 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(req._id || req.id, 'rejected')}
                          className="text-red-700 hover:text-red-900 font-medium px-3 py-1 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : (req.status === 'approved' || req.status === 'allocated') ? (
                      <button 
                        onClick={() => handleCompleteRequest(req._id || req.id)}
                        className="text-blue-700 hover:text-blue-900 font-medium px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-sm"
                      >
                        Complete Job
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm italic pr-2">Processed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
