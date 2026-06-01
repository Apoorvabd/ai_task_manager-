import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Create an Account</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>Name</label>
          <input 
            type="text" 
            required 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          />
        </div>
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
        <button type="submit" className="btn-primary auth-btn">Sign Up</button>
        <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;