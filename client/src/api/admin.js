import api from './client';

export const getDashboard = () => api.get('/admin/dashboard');
export const getRevenueReport = (params) => api.get('/admin/reports/revenue', { params });
export const getOccupancyReport = () => api.get('/admin/reports/occupancy');
export const getAllUsers = (params) => api.get('/users', { params });
export const toggleUserStatus = (id) => api.put(`/users/${id}/status`);
export const getAllBookings = (params) => api.get('/bookings/all', { params });
export const updateBookingStatus = (id, status) => api.patch(`/bookings/${id}/status`, { status });
export const createVehicle = (data) => api.post('/vehicles', data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);
export const getAllVehicles = (params) => api.get('/vehicles', { params });
