import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';

function LandingPage() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Uni-Cal</h1>
        <p>
          Your university calendar management system
        </p>
        <Link 
          to="/login"
          className="login-link"
        >
          Go to Login
        </Link>
      </header>
    </div>
  );
}

export default LandingPage;
