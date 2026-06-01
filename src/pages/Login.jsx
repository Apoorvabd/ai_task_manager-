import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Welcome Back</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            required 
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            required 
            value={formData.password} 
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
          />
        </div>
        <button type="submit" className="btn-primary auth-btn">Login</button>
        <p className="auth-footer">Don't have an account? <Link to="/register">Sign up</Link></p>
      </form>
    </div>
  );
};

export default Login;