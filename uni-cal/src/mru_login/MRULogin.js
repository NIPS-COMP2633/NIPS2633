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
      
      mru_login(username, password);
      
      // Navigate to bookmarklet page after login
      navigate('/bookmarklet');
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
            <button type="button" className="back-btn" onClick={() => navigate('/')}>Go Back</button>
            <button type="submit" className="submit-btn">Login</button>
          </div>
          <div className="button-group">
            <button type="button" className="skip-btn" onClick={() => navigate('/bookmarklet')}>Skip to Outline Import</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MRULogin;
