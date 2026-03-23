import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/Authcontext';
import { Store, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);

      if (!['admin', 'editor'].includes(data?.user?.role)) {
        toast.error('You do not have permission to access the admin panel.');
        return;
      }

      navigate('/admin/dashboard');  
    } catch (err) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Invalid credentials';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">
            <Store size={28} />
          </div>
          <h1>E-Commerce</h1>
          <p>Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--sidebar-bg) 0%, #2d1a08 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .login-card {
          background: var(--surface);
          border-radius: var(--radius-xl);
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: var(--shadow-lg);
        }
        .login-logo {
          text-align: center;
          margin-bottom: 32px;
        }
        .login-logo .logo-icon {
          width: 56px; height: 56px;
          background: var(--primary);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: white; margin: 0 auto 12px;
        }
        .login-logo h1 { font-size: 22px; font-weight: 700; }
        .login-logo p { color: var(--text-muted); font-size: 13px; margin-top: 2px; }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
      `}</style>
    </div>
  );
}