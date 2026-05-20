import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/register", formData);
      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">Register to access DatasetHub.</p>

        <form className="form" onSubmit={handleRegister}>
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />

          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label>Organization</label>
          <input name="organization" value={formData.organization} onChange={handleChange} />

          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />

          <button className="primary-btn" type="submit">
            Register
          </button>
        </form>

        <p className="auth-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;