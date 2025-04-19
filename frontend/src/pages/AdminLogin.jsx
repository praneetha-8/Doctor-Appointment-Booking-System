import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        console.log('Attempting to login...'); // Debug log

        const response = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: formData.username, password: formData.password })
        });

        console.log('Response received:', response.status); // Debug log

        const data = await response.json();
        console.log('Response data:', data); // Debugging

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // ✅ Ensure token exists before storing it
        if (!data.token) {
            throw new Error('Token not received from server');
        }

        console.log('Token received:', data.token); // Debugging

        // ✅ Clear previous storage before setting new token
        localStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminToken');

            console.log('Storing in localStorage'); // Debug log
            localStorage.setItem('adminToken', data.token);
        

        console.log('Login successful, token stored.');
        alert('Login successful!');

        // ✅ Navigate only after successful login
        navigate('/admin_dashboard');

    } catch (error) {
        console.error('Login error:', error);
        setError(error.message || 'Failed to connect to the server');
    }
};


  
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
      <button
        onClick={() => navigate("/")}
        className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md shadow"
      >
        ⬅ Back to Home
      </button>
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Admin Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm">Remember me</label>
            </div>
          </div>

          <button type="submit" className="w-full py-2 bg-blue-600 text-white font-medium rounded-md">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
