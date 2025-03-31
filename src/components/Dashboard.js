import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { connectToSmartwatch, sendCommand } from '../services/bluetoothService';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [serialPort, setSerialPort] = useState(null);

  const [receivedData, setReceivedData] = useState("");

  const [bgColor, setBgColor] = useState('#ff0000'); // for CMD:2
  const [brightness, setBrightness] = useState('UP'); // for CMD:4
  const [timeInput, setTimeInput] = useState('08/21/2025,12:30:00'); // for CMD:6

  // dummy data
  const [heartrateData] = useState({
    labels: ['1min', '2min', '3min', '4min', '5min'],
    datasets: [{
      label: 'Heart Rate',
      data: [72, 75, 73, 78, 76],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    }]
  });
  
  const [sleepData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Sleep Hours',
      data: [7, 6.5, 8, 7.5, 6, 8.5, 7],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  });
  
  const [activityData] = useState({
    labels: ['Steps', 'Calories', 'Distance'],
    datasets: [{
      label: "Today's Activity",
      data: [5000, 220, 3.5],
      backgroundColor: [
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)'
      ]
    }]
  });
  
  const handleConnect = async () => {
    const port = await connectToSmartwatch();
    if (port) {
      setSerialPort(port);
    }
  };
  const toggleHeartRateDisplay = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'CMD:1');
    }
  };

  const changeBackgroundColor = async (hexColor) => {
    if (serialPort) {
      await sendCommand(serialPort, `CMD:2:${hexColor}`);
    }
  };

  const toggleNotifications = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'CMD:3');
    }
  };

  const adjustBrightness = async (direction) => {
    if (serialPort && (direction === 'UP' || direction === 'DOWN')) {
      await sendCommand(serialPort, `CMD:4:${direction}`);
    }
  };

  const toggleClockDisplay = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'CMD:5');
    }
  };

  const setTime = async (timeString) => {
    if (serialPort) {
      await sendCommand(serialPort, `CMD:6:${timeString}`);
    }
  };

  useEffect(() => {
    if (!serialPort) return;

    let cancel = false; // to stop reading when component unmounts or port changes

    const readFromPort = async () => {
      try {
        // check if port is readable
        while (serialPort.readable && !cancel) {

          const reader = serialPort.readable.getReader();
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) {
                console.log("Reader closed");
                break;
              }
              if (value) {
                const text = new TextDecoder().decode(value);
                setReceivedData((prev) => prev + text);
                console.log("Received data:", text);
              }
            }
          } catch (err) {
            console.error("Reading error:", err);
          } finally {
            reader.releaseLock();
          }
        }
      } catch (error) {
        console.error("Error in readFromPort:", error);
      }
    };

    readFromPort();

    return () => {
      cancel = true;
    };
  }, [serialPort]);

  useEffect(() => {
    console.log("Dashboard mounted. Waiting for serial communication...");
  }, []);
  
  return (
    <div className="dashboard">
      <Link to="/">
        <button className="back-btn">Back to Home</button>
      </Link>
      <h2>Smartwatch Dashboard</h2>
      <div className="connection-section">
        <button onClick={handleConnect}>Connect to Smartwatch</button>
        {serialPort ? (
          <span className="status-indicator connected">Connected</span>
        ) : (
          <span className="status-indicator not-connected">Not Connected</span>
        )}
      </div>
      <div className="controls-section">
        {/* Command 1: Toggle Heart Rate Display */}
        <button onClick={toggleHeartRateDisplay}>
          Toggle Heart Rate Display
        </button>
        
        {/* Command 2: Change Background Color */}
        <div className="parameter-control">
          <input 
            id="bgColor"
            type="color" 
            className="control-input"
            value={bgColor} 
            onChange={(e) => setBgColor(e.target.value)}
          />
          <button onClick={() => changeBackgroundColor(bgColor)}>
            Change Background Color
          </button>
        </div>
        
        {/* Command 3: Toggle Notifications */}
        <button onClick={toggleNotifications}>
          Toggle Notifications
        </button>
        
        {/* Command 4: Adjust Brightness */}
        <div className="parameter-control">
          <select 
            id="brightness"
            className="control-input"
            value={brightness} 
            onChange={(e) => setBrightness(e.target.value)}
          >
            <option value="UP">Increase</option>
            <option value="DOWN">Decrease</option>
          </select>
          <button onClick={() => adjustBrightness(brightness)}>
            Adjust Brightness
          </button>
        </div>
        
        {/* Command 5: Toggle Clock Display */}
        <button onClick={toggleClockDisplay}>
          Toggle Clock Display
        </button>
        
        {/* Command 6: Set Time */}
        <div className="parameter-control">
          <input 
            id="timeInput"
            type="text" 
            className="control-input"
            placeholder="MM/DD/YYYY,HH:MIN:SEC" 
            value={timeInput} 
            onChange={(e) => setTimeInput(e.target.value)}
          />
          <button onClick={() => setTime(timeInput)}>
            Set Time
          </button>
        </div>
      </div>

            {/* Display incoming serial data */}
            <div className="incoming-data">
        <h4>Incoming Data</h4>
        <pre>{receivedData}</pre>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Heart Rate Trends</h3>
          <Line data={heartrateData} />
        </div>
        <div className="chart-container">
          <h3>Sleep Graph</h3>
          <Bar data={sleepData} />
        </div>
        <div className="chart-container">
          <h3>Activity Stats</h3>
          <Bar data={activityData} />
        </div>
      </div>


    </div>
  );
};

export default Dashboard;