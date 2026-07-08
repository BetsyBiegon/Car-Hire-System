import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyBookings, cancelBooking, extendBooking } from '../api/bookings';
import { format } from 'date-fns';
import { useState } from 'react';
import api from '../api/client';

const STATUS_STYLES = {
  PENDING:   'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  ACTIVE:    'bg-green-100 text-green-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
  EXTENDED:  'bg-purple-100 text-purple-700',
};

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [extendId, setExtendId] = useState(null);
  const [newEndDate, setNewEndDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => getMyBookings().then((r) => r.data),
  });

  const cancel = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => queryClient.invalidateQueries(['myBookings']),
  });

  const extend = useMutation({
    mutationFn: ({ id, date }) => extendBooking(id, { newEndDate: date }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myBookings']);
      setExtendId(null);
      setNewEndDate('');
    },
  });

  async function handlePayNow(bookingId) {
    try {
      const res = await api.post(`/payments/checkout/${bookingId}`);
      window.location.href = res.data.data.url;
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed.');
    }
  }

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />)}
    </div>
  );

  const bookings = data?.data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>

      {bookings.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🚗</p>
          <p className="text-lg">No bookings yet. <a href="/" className="text-blue-600 hover:underline">Find a car</a></p>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {b.vehicle?.images?.[0] && (
                <img src={b.vehicle.images[0].url} alt="" className="w-full md:w-48 h-40 object-cover" />
              )}
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <h3 className="font-semibold text-gray-800 text-lg">{b.vehicle?.make} {b.vehicle?.model}</h3>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {format(new Date(b.startDate), 'MMM d, yyyy')} → {format(new Date(b.endDate), 'MMM d, yyyy')}
                  <span className="ml-2 text-gray-400">({b.totalDays} day{b.totalDays > 1 ? 's' : ''})</span>
                </p>
                <p className="font-bold text-blue-600 mt-1">${b.totalAmount}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {b.status === 'PENDING' && (
                    <button onClick={() => handlePayNow(b.id)}
                      className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">
                      Pay Now
                    </button>
                  )}
                  {['PENDING', 'CONFIRMED'].includes(b.status) && (
                    <button onClick={() => cancel.mutate(b.id)}
                      className="border border-red-300 text-red-600 text-sm px-4 py-1.5 rounded-lg hover:bg-red-50 transition">
                      Cancel
                    </button>
                  )}
                  {b.status === 'ACTIVE' && (
                    <button onClick={() => setExtendId(b.id)}
                      className="border border-blue-300 text-blue-600 text-sm px-4 py-1.5 rounded-lg hover:bg-blue-50 transition">
                      Extend
                    </button>
                  )}
                </div>

                {/* Extend form */}
                {extendId === b.id && (
                  <div className="mt-3 flex gap-2 items-center">
                    <input
                      type="date"
                      min={format(new Date(b.endDate), 'yyyy-MM-dd')}
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <button onClick={() => extend.mutate({ id: b.id, date: newEndDate })}
                      disabled={!newEndDate}
                      className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      Confirm Extension
                    </button>
                    <button onClick={() => setExtendId(null)} className="text-gray-400 text-sm hover:text-gray-600">Cancel</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
