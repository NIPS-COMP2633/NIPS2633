import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Your University Schedule, Simplified</h1>
          <p className="hero-subtitle">
            Seamlessly sync your MyMRU.ca calendar with Google Calendar
          </p>
          <p className="hero-description">
            Never miss a class, assignment, or important deadline. 
            Import your university schedule in seconds and keep everything organized in one place.
          </p>
          <Link to="/login" className="hero-cta">
            Get Started Free
          </Link>
          <p className="hero-note">No credit card required • Set up in under 2 minutes</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Uni-Cal?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-description">
                Sync your entire schedule in seconds. No manual entry, no hassle.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3 className="feature-title">Auto-Sync</h3>
              <p className="feature-description">
                Automatically adds repeating classes to your schedule.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                Uses secure requests to get your data.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Works Everywhere</h3>
              <p className="feature-description">
                Access your schedule on any device with Google Calendar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3 className="step-title">Connect Your Account</h3>
              <p className="step-description">
                Log in with your MyMRU credentials securely
              </p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3 className="step-title">Authorize Google</h3>
              <p className="step-description">
                Grant access to your Google Calendar
              </p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3 className="step-title">Done!</h3>
              <p className="step-description">
                Your schedule syncs automatically
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Students Using Uni-Cal</div>
            </div>
            <div className="stat">
              <div className="stat-number">10k+</div>
              <div className="stat-label">Events Synced</div>
            </div>
            <div className="stat">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Get Organized?</h2>
          <p className="cta-description">
            Join hundreds of students who never miss a deadline
          </p>
          <Link to="/login" className="cta-button">
            Start Syncing Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p className="footer-text">© 2026 Uni-Cal • Made for MRU Students</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
