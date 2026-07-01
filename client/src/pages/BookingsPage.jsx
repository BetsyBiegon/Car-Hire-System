import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyBookings, cancelBooking } from '../api/bookings';

const statusColors = {
  PENDING: '#f59e0b', CONFIRMED: '#2563eb', ACTIVE: '#16a34a',
  COMPLETED: '#6b7280', CANCELLED: '#dc2626', EXTENDED: '#7c3aed',
};

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => getMyBookings().then((r) => r.data),
  });

  const cancel = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => queryClient.invalidateQueries(['myBookings']),
  });

  if (isLoading) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
      <h2>My Bookings</h2>
      {data?.data?.length === 0 && <p>No bookings yet.</p>}
      {data?.data?.map((b) => (
        <div key={b.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{b.vehicle?.make} {b.vehicle?.model}</h3>
            <span style={{ background: statusColors[b.status], color: '#fff', padding: '4px 10px', borderRadius: 12, fontSize: 12 }}>{b.status}</span>
          </div>
          <p>{new Date(b.startDate).toDateString()} → {new Date(b.endDate).toDateString()}</p>
          <p><strong>${b.totalAmount}</strong> ({b.totalDays} days)</p>
          {['PENDING', 'CONFIRMED'].includes(b.status) && (
            <button
              onClick={() => cancel.mutate(b.id)}
              style={{ padding: '6px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
