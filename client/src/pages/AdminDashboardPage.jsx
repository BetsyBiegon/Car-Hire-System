import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data.data),
  });

  const { data: revenue } = useQuery({
    queryKey: ['revenueReport'],
    queryFn: () => api.get('/admin/reports/revenue').then((r) => r.data.data),
  });

  const stats = [
    { label: 'Total Customers', value: data?.totalUsers, icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Vehicles', value: data?.totalVehicles, icon: '🚗', color: 'bg-green-50 text-green-600' },
    { label: 'Active Bookings', value: data?.activeBookings, icon: '📅', color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Revenue', value: `$${Number(data?.totalRevenue || 0).toFixed(2)}`, icon: '💰', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold">{isLoading ? '...' : s.value}</div>
            <div className="text-sm font-medium mt-1 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Vehicle</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {revenue?.payments?.slice(0, 10).map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-700">{p.booking?.vehicle?.make} {p.booking?.vehicle?.model}</td>
                  <td className="px-6 py-3 font-medium text-gray-800">${p.amount}</td>
                  <td className="px-6 py-3 text-gray-500">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!revenue?.payments?.length && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
