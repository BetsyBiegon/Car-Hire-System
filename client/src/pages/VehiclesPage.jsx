import { useQuery } from '@tanstack/react-query';
import { getVehicles } from '../api/vehicles';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'];
const TRANSMISSIONS = ['MANUAL', 'AUTOMATIC'];

export default function VehiclesPage() {
  const [filters, setFilters] = useState({});
  const [form, setForm] = useState({ make: '', minPrice: '', maxPrice: '', fuelType: '', transmission: '', startDate: '', endDate: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => getVehicles(filters).then((r) => r.data),
  });

  function applyFilters(e) {
    e.preventDefault();
    const clean = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
    setFilters(clean);
  }

  function clearFilters() {
    setForm({ make: '', minPrice: '', maxPrice: '', fuelType: '', transmission: '', startDate: '', endDate: '' });
    setFilters({});
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Find Your Car</h1>

      {/* Filters */}
      <form onSubmit={applyFilters} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <input
          placeholder="Make (e.g. Toyota)"
          value={form.make}
          onChange={(e) => setForm({ ...form, make: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={form.fuelType}
          onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Fuel Types</option>
          {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          value={form.transmission}
          onChange={(e) => setForm({ ...form, transmission: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Transmissions</option>
          {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min $"
            value={form.minPrice}
            onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Max $"
            value={form.maxPrice}
            onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Pickup Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Return Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition">
            Search
          </button>
          <button type="button" onClick={clearFilters} className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition">
            Clear
          </button>
        </div>
      </form>

      {/* Results */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />)}
        </div>
      )}

      {!isLoading && data?.data?.length === 0 && (
        <p className="text-center text-gray-500 py-12">No vehicles found for your search.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.map((vehicle) => (
          <Link key={vehicle.id} to={`/vehicles/${vehicle.id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
            <div className="h-48 bg-gray-100 overflow-hidden">
              {vehicle.images?.[0] ? (
                <img src={vehicle.images[0].url} alt={vehicle.make} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🚗</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 text-lg">{vehicle.make} {vehicle.model}</h3>
              <p className="text-gray-500 text-sm">{vehicle.year} · {vehicle.transmission} · {vehicle.fuelType}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-blue-600 font-bold text-lg">${vehicle.pricePerDay}<span className="text-sm font-normal text-gray-500">/day</span></span>
                {vehicle.avgRating && (
                  <span className="text-sm text-amber-500">★ {vehicle.avgRating} <span className="text-gray-400">({vehicle.reviewCount})</span></span>
                )}
              </div>
              <p className="text-gray-400 text-xs mt-1">📍 {vehicle.location?.city}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
