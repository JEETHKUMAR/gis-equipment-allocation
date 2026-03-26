import unittest
from allocation import allocate_equipment, haversine

class TestAllocation(unittest.TestCase):
    
    def setUp(self):
        # Base Request Location: Chandigarh [Lon: 76.7794, Lat: 30.7333]
        self.request_location = [76.7794, 30.7333]
        
        # Mock test data
        self.mock_equipment = [
            {
                "id": "eq-1",
                "name": "Tractor 1 (Within 2km)",
                "type": "Tractor",
                "status": "available",
                "location": {
                    "type": "Point",
                    "coordinates": [76.7794, 30.7450] # ~1.3km north
                }
            },
            {
                "id": "eq-2",
                "name": "Tractor 2 (Within 4km)",
                "type": "Tractor",
                "status": "available",
                "location": {
                    "type": "Point",
                    "coordinates": [76.7794, 30.7650] # ~3.5km north
                }
            },
            {
                "id": "eq-3",
                "name": "Tractor 3 (Outside 5km)",
                "type": "Tractor",
                "status": "available",
                "location": {
                    "type": "Point",
                    "coordinates": [76.7794, 30.8233] # ~10km north
                }
            },
            {
                "id": "eq-4",
                "name": "Tractor 4 (Closest but In-maintenance)",
                "type": "Tractor",
                "status": "maintenance",
                "location": {
                    "type": "Point",
                    "coordinates": [76.7794, 30.7380] # ~0.5km north
                }
            }
        ]

    def test_haversine_formula(self):
        # Coordinates for 1 degree difference along meridian ~ 111.1km
        dist = haversine(76.0, 30.0, 76.0, 31.0)
        self.assertAlmostEqual(dist, 111.19, places=1)

    def test_allocation_picks_closest_available(self):
        # Should pick eq-1 because it is closest (1.3km) and available.
        # eq-4 is closer but in maintenance.
        assigned, dist = allocate_equipment(self.request_location, self.mock_equipment)
        
        self.assertIsNotNone(assigned)
        self.assertEqual(assigned['id'], "eq-1")
        self.assertTrue(dist < 5.0)

    def test_allocation_ignores_outside_radius(self):
        # Only keep the one outside the 5km radius
        outside_only_equipment = [self.mock_equipment[2]]
        
        assigned, dist = allocate_equipment(self.request_location, outside_only_equipment, max_radius_km=5.0)
        
        self.assertIsNone(assigned)
        self.assertEqual(dist, float('inf'))

if __name__ == '__main__':
    unittest.main()
