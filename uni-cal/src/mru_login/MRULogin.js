import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './mru_login.css';
import { mru_login } from '../client-side-scripts/mock';
import { XmlToJsonConverter } from '../outline-calander/utils/xmlToJsonConverter';

function MRULogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const showNotification = (message, isSuccess = true) => {
    const div = document.createElement('div');
    div.textContent = message;
    const bgColor = isSuccess ? '#B2CD9C' : '#d32f2f';
    const textColor = isSuccess ? '#1a130f' : '#1a130f';
    const fontFamily = 'monospace';
    div.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${bgColor};
      color: ${textColor};
      padding: 20px 30px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: ${fontFamily};
      font-size: 18px;
      font-weight: 800;
      max-width: 500px;
      text-align: center;
    `;
    document.body.appendChild(div);
    setTimeout(() => {
      div.style.transition = 'opacity 0.5s';
      div.style.opacity = '0';
      setTimeout(() => document.body.removeChild(div), 500);
    }, isSuccess ? 1500 : 4000);
  };

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

          // Convert XML to JSON events
          const events = XmlToJsonConverter.convert(xmlData);
          console.log('Converted to events:', events);

          showNotification('✓ Login successful! Loading your calendar...', true);
          setTimeout(() => {
            // Navigate and pass the events data
            navigate('/bookmarklet', { state: { mruEvents: events } });
          }, 1500);
        })
        .catch(error => {
          console.error('Error fetching calendar:', error);
          showNotification('✗ Login failed. Please check your credentials and try again.', false);
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
