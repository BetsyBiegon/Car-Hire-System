import api from './client';

export const getMyBookings = (params) => api.get('/bookings', { params });
export const createBooking = (data) => api.post('/bookings', data);
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.post(`/bookings/${id}/cancel`);
export const extendBooking = (id, data) => api.post(`/bookings/${id}/extend`, data);
