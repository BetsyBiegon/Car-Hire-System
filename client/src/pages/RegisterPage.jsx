import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function onSubmit(data) {
    try {
      setError('');
      const res = await registerUser(data);
      const { user, accessToken, refreshToken } = res.data.data;
      loginUser(user, accessToken, refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h2>Create Account</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        {['firstName', 'lastName'].map((field) => (
          <div key={field} style={{ marginBottom: 12 }}>
            <input placeholder={field} {...register(field, { required: true })} style={{ width: '100%', padding: 8 }} />
          </div>
        ))}
        <div style={{ marginBottom: 12 }}>
          <input placeholder="Email" type="email" {...register('email', { required: true })} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input placeholder="Password (min 8 chars)" type="password" {...register('password', { required: true, minLength: 8 })} style={{ width: '100%', padding: 8 }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Register
        </button>
      </form>
      <p style={{ marginTop: 16 }}><Link to="/login">Already have an account? Login</Link></p>
    </div>
  );
}
