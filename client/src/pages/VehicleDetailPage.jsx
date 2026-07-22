import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicleById } from '../api/vehicles';
import { createBooking } from '../api/bookings';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);

  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm();
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicleById(id).then((r) => r.data.data),
  });

  const totalDays = startDate && endDate
    ? Math.max(0, differenceInCalendarDays(new Date(endDate), new Date(startDate)))
    : 0;
  const totalPrice = vehicle ? (totalDays * parseFloat(vehicle.pricePerDay)).toFixed(2) : 0;

  async function onBook(formData) {
    if (!user) return navigate('/login');
    try {
      setError('');
      const locationId = vehicle.locationId || vehicle.location?.id;
      if (!locationId) {
        return setError('Location not found for this vehicle.');
      }
      const booking = await createBooking({
        vehicleId: id,
        pickupLocationId: locationId,
        dropoffLocationId: locationId,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      navigate(`/bookings?new=${booking.data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    }
  }

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="h-72 bg-gray-200 animate-pulse rounded-xl mb-6" />
    </div>
  );

  if (!vehicle) return <p className="text-center py-20 text-gray-500">Vehicle not found.</p>;

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="rounded-xl overflow-hidden bg-gray-100 h-72">
            {vehicle.images?.length > 0 ? (
              <img src={vehicle.images[activeImg]?.url.startsWith('http') ? vehicle.images[activeImg]?.url : `http://localhost:5000${vehicle.images[activeImg]?.url}`} alt={vehicle.make} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🚗</div>
            )}
          </div>
          {vehicle.images?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {vehicle.images.map((img, i) => (
                <button key={img.id} onClick={() => setActiveImg(i)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 ${i === activeImg ? 'border-blue-500' : 'border-transparent'}`}>
                  <img src={img.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{vehicle.make} {vehicle.model}</h1>
          <p className="text-gray-500 mt-1">{vehicle.year} · {vehicle.color}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {[vehicle.fuelType, vehicle.transmission, `${vehicle.seats} seats`, `${vehicle.doors} doors`].map((tag) => (
              <span key={tag} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>

          {vehicle.features?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {vehicle.features.map((f) => (
                <span key={f} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{f}</span>
              ))}
            </div>
          )}

          {vehicle.description && <p className="text-gray-600 mt-4 text-sm">{vehicle.description}</p>}

          <p className="text-3xl font-bold text-blue-600 mt-4">
            ${vehicle.pricePerDay}<span className="text-sm font-normal text-gray-500">/day</span>
          </p>
          <p className="text-gray-400 text-sm mt-1">📍 {vehicle.location?.name}, {vehicle.location?.city}</p>
        </div>
      </div>

      {/* Booking Form */}
      <div className="mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Book this vehicle</h2>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded">{error}</p>}
        <form onSubmit={handleSubmit(onBook)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
            <input
              type="date"
              min={today}
              {...register('startDate', { required: 'Required' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
            <input
              type="date"
              min={startDate || today}
              {...register('endDate', { required: 'Required' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !user}
            className="bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {!user ? 'Login to Book' : isSubmitting ? 'Booking...' : `Book${totalDays > 0 ? ` · $${totalPrice}` : ''}`}
          </button>
        </form>
        {totalDays > 0 && (
          <p className="text-sm text-gray-500 mt-3">{totalDays} day{totalDays > 1 ? 's' : ''} · ${vehicle.pricePerDay}/day · Total: <strong>${totalPrice}</strong></p>
        )}
      </div>

      {/* Reviews */}
      {vehicle.reviews?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Reviews</h2>
          <div className="space-y-4">
            {vehicle.reviews.map((r) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800">{r.user.firstName} {r.user.lastName}</span>
                  <span className="text-amber-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
