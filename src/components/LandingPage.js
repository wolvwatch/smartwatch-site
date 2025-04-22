// landingpage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import PCBModel from './PCBModel';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="cyber-grid"></div>
      
      <header className="landing-header">
        <h1 className="glitch-text">WOLV WATCH</h1>
        <div className="subtitle">EECS 373 - Embedded System Design</div>
      </header>
      <div className="model-section">
        <PCBModel />
      </div>

      <div className="team-section">
        <h2>TEAM 13</h2>
        <div className="team-members">
          <div className="member">
            <div className="member-name">AUSTIN SIERCO</div>
            <div className="member-role">Hardware</div>
          </div>
          <div className="member">
            <div className="member-name">SANDRO PETROVSKI</div>
            <div className="member-role">Software</div>
          </div>
          <div className="member">
            <div className="member-name">RYAN KAELLE</div>
            <div className="member-role">Software</div>
          </div>
          <div className="member">
            <div className="member-name">TENZIN SHERAB</div>
            <div className="member-role">Design</div>
          </div>
        </div>
      </div>

      <div className="watch-info">
        <div className="info-card">
          <h3>SPECIFICATIONS</h3>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">Processor</span>
              <span className="spec-value">STM32 L4964RGTx</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Display</span>
              <span className="spec-value">WAVESHARE 1.28 x 1.28in</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Battery</span>
              <span className="spec-value">3.7V 300mAh LiPo</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Sensors</span>
              <span className="spec-value">MAX30102, ADX362, HC05</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>FEATURES</h3>
          <ul className="features-list">
            <li>Real-time health monitoring</li>
            <li>Customizable watchfaces</li>
            <li>Wireless connectivity</li>
            <li>Gesture controls</li>
            <li>App ecosystem</li>
          </ul>
        </div>
      </div>

      <div className="cta-section">
        <Link to="/dashboard" className="cta-button">
          <span className="button-text">LAUNCH CONTROL PANEL</span>
          <div className="button-glow"></div>
        </Link>
      </div>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>ABOUT</h4>
            <p>Developed for EECS 373 at the University of Michigan, the Nexus Watch represents the future of wearable technology.</p>
          </div>
          <div className="footer-section">
            <h4>COURSE INFO</h4>
            <p>EECS 373 - Embedded System Design</p>
            <p>University of Michigan</p>
            <p>Winter 2024</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;