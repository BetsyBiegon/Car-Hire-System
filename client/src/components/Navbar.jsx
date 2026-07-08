import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/auth';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try { await logout(); } catch {}
    logoutUser();
    navigate('/login');
  }

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow">
      <Link to="/" className="text-xl font-bold tracking-tight">🚗 Car Hire</Link>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/" className="hover:text-blue-200 transition">Vehicles</Link>
        {user && <Link to="/bookings" className="hover:text-blue-200 transition">My Bookings</Link>}
        {user?.role === 'ADMIN' && <Link to="/admin" className="hover:text-blue-200 transition">Admin</Link>}
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-blue-200">{user.firstName}</span>
            <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link to="/login" className="hover:text-blue-200 transition">Login</Link>
            <Link to="/register" className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
