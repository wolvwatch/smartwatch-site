import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { connectToSmartwatch, sendCommand } from '../services/bluetoothService';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  // State now holds the serial port (opened via the Web Serial API)
  const [serialPort, setSerialPort] = useState(null);

  // State to accumulate data coming in over UART
  const [receivedData, setReceivedData] = useState("");

  // Dummy data for charts
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
  
  // Connect to the HC-05 device via the Web Serial API.
  const handleConnect = async () => {
    const port = await connectToSmartwatch();
    if (port) {
      setSerialPort(port);
    }
  };

  // Example commands
  const updateBackgroundColor = async (color) => {
    if (serialPort) {
      await sendCommand(serialPort, `SET_BG_COLOR:${color}`);
    }
  };

  const updateStatisticsDisplay = async () => {
    if (serialPort) {
      await sendCommand(serialPort, `TOGGLE_STATS_DISPLAY`);
    }
  };

  const enableNotifications = async () => {
    if (serialPort) {
      await sendCommand(serialPort, `ENABLE_NOTIFICATIONS`);
    }
  };

  // Start reading data from the device once we have a valid port
  useEffect(() => {
    // If there's no port, do nothing
    if (!serialPort) return;

    let cancel = false; // to stop reading when component unmounts or port changes

    const readFromPort = async () => {
      try {
        // Check if port is readable
        while (serialPort.readable && !cancel) {
          // Create a reader and read the stream
          const reader = serialPort.readable.getReader();
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) {
                // Done means no more data will be received
                console.log("Reader closed");
                break;
              }
              if (value) {
                // Convert Uint8Array to string
                const text = new TextDecoder().decode(value);
                // Append incoming text to the receivedData state
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
      // When unmounting, prevent further reading
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
        <button onClick={() => updateBackgroundColor('#ff0000')}>
          Set Background Color Red
        </button>
        <button onClick={updateStatisticsDisplay}>
          Toggle Statistics Display
        </button>
        <button onClick={enableNotifications}>
          Enable Notifications
        </button>
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