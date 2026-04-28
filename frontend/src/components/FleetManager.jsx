import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function FleetManager() {
  const [fleet, setFleet] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Tractor',
    lat: 30.7333,
    lng: 76.7794
  });
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/fleet`);
      const data = await res.json();
      setFleet(data);
    } catch (err) {
      toast.error('Error fetching fleet');
      console.error('Error fetching fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        location: {
          coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)]
        }
      };
      
      const res = await fetch(`${apiUrl}/api/fleet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setFormData({ ...formData, name: '' });
        toast.success('Equipment added successfully');
        fetchFleet();
      } else {
        toast.error('Failed to add equipment');
        console.error('Failed to add equipment');
      }
    } catch (err) {
      toast.error('Error adding equipment');
      console.error('Error adding equipment:', err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/api/fleet/${id}`, { method: 'PUT' });
      if (res.ok) {
        toast.success("Status updated");
        fetchFleet();
      }
    } catch (err) {
      toast.error('Error toggling status');
      console.error('Error toggling status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/fleet/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Equipment deleted");
        fetchFleet();
      }
    } catch (err) {
      toast.error('Error deleting equipment');
      console.error('Error deleting equipment:', err);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Create Equipment Form */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">Add New Equipment</h2>
        <form onSubmit={handleAddEquipment} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="e.g. Tractor A" 
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Type</label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleInputChange} 
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              <option value="Tractor">Tractor</option>
              <option value="Harvester">Harvester</option>
              <option value="Seeder">Seeder</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Latitude</label>
            <input 
              type="number" 
              step="any" 
              name="lat" 
              value={formData.lat} 
              onChange={handleInputChange} 
              required 
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Longitude</label>
            <input 
              type="number" 
              step="any" 
              name="lng" 
              value={formData.lng} 
              onChange={handleInputChange} 
              required 
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <button 
            type="submit" 
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            Add Equipment
          </button>
        </form>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-3xl px-6 py-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">Fleet Inventory</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-left bg-white text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Location [Lat, Lng]</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                      <span>Loading fleet data...</span>
                    </div>
                  </td>
                </tr>
              ) : fleet.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No equipment found in the fleet. Add some above.
                  </td>
                </tr>
              ) : (
                fleet.map((item, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={item._id || item.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">{item.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        item.status === 'available' ? 'bg-green-100 text-green-700 border border-green-200' :
                        item.status === 'assigned' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {item.status === 'available' ? 'Available' : item.status === 'assigned' ? 'In Use' : item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 data-font-mono">
                      {item.location?.coordinates ? `[${item.location.coordinates[1].toFixed(4)}, ${item.location.coordinates[0].toFixed(4)}]` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button 
                        onClick={() => handleToggleStatus(item._id || item.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all hover:scale-105"
                      >
                        Toggle Status
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id || item.id)}
                        className="text-red-600 hover:text-red-800 font-medium px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-all hover:scale-105"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
