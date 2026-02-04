import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './mru_login.css';
import { mru_login } from '../client-side-scripts/mock';

function MRULogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (username && password) {
      console.log('Login attempt:', { username, password });

      // Call the Netlify serverless function
      const requestBody = {
        username: username,
        password: password,
        term: 20260150
      };

      fetch('/.netlify/functions/backend-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text(); // Get XML as text
        })
        .then(xmlData => {
          console.log('Calendar data received:', xmlData);
          // TODO: Parse XML data here or pass it to next component
          // Navigate to bookmarklet page after successful login
          navigate('/bookmarklet');
        })
        .catch(error => {
          console.error('Error fetching calendar:', error);
          alert('Login failed. Please check your credentials and try again.');
        });
    }
  };

  return (
    <div className="mru-login-page">

      <div className="login-container">
        <h2>MRU Login</h2>
        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="button-group">
            <button type="submit" className="submit-btn">Login</button>
            <button type="button" className="back-btn" onClick={() => navigate('/')}>Go Back</button>

          </div>
        </form>
      </div>
      <div className="button-group">
        <button type="button" className="skip-btn" onClick={() => navigate('/bookmarklet')}>Skip This Step</button>
      </div>
    </div>
  );
}

export default MRULogin;
