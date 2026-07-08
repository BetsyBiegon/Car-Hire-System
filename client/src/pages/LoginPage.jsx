import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function onSubmit(data) {
    try {
      setError('');
      const res = await login(data);
      const { user, accessToken, refreshToken } = res.data.data;
      loginUser(user, accessToken, refreshToken);
      navigate(user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome back</h2>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
          {' · '}
          <Link to="/register" className="text-blue-600 hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}
