import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  getDashboard, getRevenueReport, getAllUsers, toggleUserStatus,
  getAllBookings, updateBookingStatus, getAllVehicles, createVehicle, updateVehicle, deleteVehicle
} from '../api/admin';
import { useForm } from 'react-hook-form';

const TABS = ['Overview', 'Vehicles', 'Bookings', 'Users'];

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('Overview');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <OverviewTab />}
      {tab === 'Vehicles' && <VehiclesTab />}
      {tab === 'Bookings' && <BookingsTab />}
      {tab === 'Users' && <UsersTab />}
    </div>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────
function OverviewTab() {
  const { data, isLoading } = useQuery({ queryKey: ['adminDashboard'], queryFn: () => getDashboard().then(r => r.data.data) });
  const { data: revenue } = useQuery({ queryKey: ['revenueReport'], queryFn: () => getRevenueReport().then(r => r.data.data) });

  const stats = [
    { label: 'Total Customers', value: data?.totalUsers, icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Vehicles', value: data?.totalVehicles, icon: '🚗', color: 'bg-green-50 text-green-600' },
    { label: 'Active Bookings', value: data?.activeBookings, icon: '📅', color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Revenue', value: `$${Number(data?.totalRevenue || 0).toFixed(2)}`, icon: '💰', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold">{isLoading ? '...' : s.value}</div>
            <div className="text-sm font-medium mt-1 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-800">Recent Payments</div>
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
              {revenue?.payments?.slice(0, 8).map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-700">{p.booking?.vehicle?.make} {p.booking?.vehicle?.model}</td>
                  <td className="px-6 py-3 font-medium">${p.amount}</td>
                  <td className="px-6 py-3 text-gray-500">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
              {!revenue?.payments?.length && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No payments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Vehicles ────────────────────────────────────────────────────────────────
function VehiclesTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const { data } = useQuery({ queryKey: ['adminVehicles'], queryFn: () => getAllVehicles({ limit: 100 }).then(r => r.data.data) });

  const create = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => { queryClient.invalidateQueries(['adminVehicles']); setShowForm(false); reset(); },
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => updateVehicle(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['adminVehicles']); setEditVehicle(null); reset(); },
  });

  const remove = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => queryClient.invalidateQueries(['adminVehicles']),
  });

  function onEdit(v) {
    setEditVehicle(v);
    setShowForm(true);
    ['make', 'model', 'year', 'licensePlate', 'pricePerDay', 'color', 'fuelType', 'transmission', 'seats'].forEach(f => setValue(f, v[f]));
  }

  function onSubmit(data) {
    if (editVehicle) {
      update.mutate({ id: editVehicle.id, data });
    } else {
      create.mutate(data);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Vehicles ({data?.length || 0})</h2>
        <button onClick={() => { setShowForm(!showForm); setEditVehicle(null); reset(); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
          {showForm ? 'Cancel' : '+ Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'make', placeholder: 'Make (Toyota)' },
            { name: 'model', placeholder: 'Model (Corolla)' },
            { name: 'year', placeholder: 'Year', type: 'number' },
            { name: 'licensePlate', placeholder: 'License Plate' },
            { name: 'pricePerDay', placeholder: 'Price/Day ($)', type: 'number' },
            { name: 'color', placeholder: 'Color' },
          ].map(({ name, placeholder, type }) => (
            <input key={name} type={type || 'text'} placeholder={placeholder}
              {...register(name, { required: true })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          ))}
          <select {...register('fuelType')} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'].map(f => <option key={f}>{f}</option>)}
          </select>
          <select {...register('transmission')} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {['MANUAL', 'AUTOMATIC'].map(t => <option key={t}>{t}</option>)}
          </select>
          <input type="number" placeholder="Seats" {...register('seats')} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <div className="md:col-span-3 flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">
              {editVehicle ? 'Update Vehicle' : 'Create Vehicle'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Vehicle</th>
              <th className="px-6 py-3 text-left">Plate</th>
              <th className="px-6 py-3 text-left">Price/Day</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{v.make} {v.model} ({v.year})</td>
                <td className="px-6 py-3 text-gray-500">{v.licensePlate}</td>
                <td className="px-6 py-3">${v.pricePerDay}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{v.status}</span>
                </td>
                <td className="px-6 py-3 flex gap-2">
                  <button onClick={() => onEdit(v)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove.mutate(v.id)} className="text-red-500 hover:underline text-xs">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Bookings ────────────────────────────────────────────────────────────────
function BookingsTab() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data } = useQuery({
    queryKey: ['adminBookings', statusFilter],
    queryFn: () => getAllBookings({ status: statusFilter || undefined, limit: 50 }).then(r => r.data.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries(['adminBookings']),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">All Bookings</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          {['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Vehicle</th>
              <th className="px-6 py-3 text-left">Dates</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-700">{b.user?.firstName} {b.user?.lastName}</td>
                <td className="px-6 py-3">{b.vehicle?.make} {b.vehicle?.model}</td>
                <td className="px-6 py-3 text-gray-500 text-xs">
                  {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-3 font-medium">${b.totalAmount}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                </td>
                <td className="px-6 py-3">
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus.mutate({ id: b.id, status: e.target.value })}
                    className="border border-gray-300 rounded px-2 py-1 text-xs">
                    {['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!data?.length && <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No bookings found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Users ───────────────────────────────────────────────────────────────────
function UsersTab() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => getAllUsers({ limit: 50 }).then(r => r.data.data),
  });

  const toggle = useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: () => queryClient.invalidateQueries(['adminUsers']),
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">All Users ({data?.length || 0})</h2>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Joined</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{u.firstName} {u.lastName}</td>
                <td className="px-6 py-3 text-gray-500">{u.email}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                </td>
                <td className="px-6 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button onClick={() => toggle.mutate(u.id)}
                    className={`text-xs hover:underline ${u.isActive ? 'text-red-500' : 'text-green-600'}`}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
