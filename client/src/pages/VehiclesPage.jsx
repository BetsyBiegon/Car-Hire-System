import { useQuery } from '@tanstack/react-query';
import { getVehicles } from '../api/vehicles';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function VehiclesPage() {
  const [filters, setFilters] = useState({});
  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => getVehicles(filters).then((r) => r.data),
  });

  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: 24 }}>
      <h2>Available Vehicles</h2>
      {isLoading && <p>Loading...</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {data?.data?.map((vehicle) => (
          <Link key={vehicle.id} to={`/vehicles/${vehicle.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              {vehicle.images?.[0] && (
                <img src={vehicle.images[0].url} alt={vehicle.make} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              )}
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: '0 0 8px' }}>{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>{vehicle.location?.city}</p>
                <p style={{ fontWeight: 'bold', margin: '8px 0 0' }}>${vehicle.pricePerDay}/day</p>
                {vehicle.avgRating && <p style={{ margin: '4px 0 0', color: '#f59e0b' }}>★ {vehicle.avgRating} ({vehicle.reviewCount})</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
