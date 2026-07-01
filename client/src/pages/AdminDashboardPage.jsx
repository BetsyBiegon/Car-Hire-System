import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data.data),
  });

  if (isLoading) return <p style={{ padding: 40 }}>Loading...</p>;

  const stats = [
    { label: 'Total Users', value: data?.totalUsers },
    { label: 'Total Vehicles', value: data?.totalVehicles },
    { label: 'Active Bookings', value: data?.activeBookings },
    { label: 'Total Revenue', value: `$${data?.totalRevenue}` },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#2563eb' }}>{s.value}</div>
            <div style={{ color: '#6b7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
