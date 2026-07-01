import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicleById } from '../api/vehicles';
import { createBooking } from '../api/bookings';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicleById(id).then((r) => r.data.data),
  });

  async function onBook(formData) {
    if (!user) return navigate('/login');
    try {
      setError('');
      await createBooking({
        vehicleId: id,
        pickupLocationId: data.locationId,
        dropoffLocationId: data.locationId,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    }
  }

  if (isLoading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (!data) return <p style={{ padding: 40 }}>Vehicle not found.</p>;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <h2>{data.make} {data.model} ({data.year})</h2>
      {data.images?.[0] && <img src={data.images[0].url} alt={data.make} style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }} />}
      <p>{data.description}</p>
      <p><strong>Price:</strong> ${data.pricePerDay}/day</p>
      <p><strong>Location:</strong> {data.location?.name}, {data.location?.city}</p>
      <p><strong>Fuel:</strong> {data.fuelType} | <strong>Transmission:</strong> {data.transmission} | <strong>Seats:</strong> {data.seats}</p>

      <h3>Book this vehicle</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit(onBook)} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <label>Start Date</label>
          <input type="date" {...register('startDate', { required: true })} style={{ display: 'block', padding: 8 }} />
        </div>
        <div>
          <label>End Date</label>
          <input type="date" {...register('endDate', { required: true })} style={{ display: 'block', padding: 8 }} />
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <button type="submit" style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Book Now
          </button>
        </div>
      </form>
    </div>
  );
}
