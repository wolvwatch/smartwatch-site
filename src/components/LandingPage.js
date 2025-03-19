import React from 'react';
import { Link } from 'react-router-dom';
import pcbDesign from '../assets/pcbDesign.svg';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Smartwatch Control</h1>
      </header>
      <div className="image-container">
        <img src={pcbDesign} alt="Smartwatch PCB" className="pcb-image" />
      </div>
      <Link to="/dashboard">
        <button className="enter-dashboard-btn">Enter Dashboard</button>
      </Link>
    </div>
  );
};

export default LandingPage;