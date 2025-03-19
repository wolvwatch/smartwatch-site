import React from 'react';
import { Link } from 'react-router-dom';
import pcbDesign from '../assets/pcbDesign.svg';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <h1>Welcome to Smartwatch Control</h1>
      <div className="watch-display">
        <img src={pcbDesign} alt="PCB Design" className="pcb-image" />
      </div>
      <Link to="/dashboard">
        <button className="enter-dashboard-btn">Go to Dashboard</button>
      </Link>
    </div>
  );
};

export default LandingPage;