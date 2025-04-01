import React from 'react';
import { Link } from 'react-router-dom';
import pcbDesign from '../assets/pcbDesign.svg';
import ThreeDPCBViewer from '../components/ThreeDPCBViewer'; // <-- import the 3D viewer
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Smartwatch Control</h1>
      </header>
      
      {/* Your 3D viewer */}
      <div className="threeD-viewer-container">
        <ThreeDPCBViewer />
      </div>

      {/* Existing SVG or image if you still want to show it
      <div className="image-container">
        <img src={pcbDesign} alt="Smartwatch PCB" className="pcb-image" />
      </div> */}

      <Link to="/dashboard">
        <button className="enter-dashboard-btn">Enter Dashboard</button>
      </Link>
    </div>
  );
};

export default LandingPage;