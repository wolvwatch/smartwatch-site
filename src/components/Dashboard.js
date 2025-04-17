import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { connectToSmartwatch, sendCommand } from '../services/bluetoothService';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';
import { storeSensorData, getAllSensorData, deleteAllSensorData } from '../firebaseInit';
import './Dashboard.css';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseInit';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  // -- TOGGLE STATE --
  const [useOldControls, setUseOldControls] = useState(false);

  // -- COMMON STATE --
  const [serialPort, setSerialPort] = useState(null);
  const [receivedData, setReceivedData] = useState("");

  // ---------------------------------
  // OLD CONTROLS STATE & COMMANDS
  // ---------------------------------
  const [bgColor, setBgColor] = useState('#ff0000'); 
  const [brightnessCMD, setBrightnessCMD] = useState('UP'); 
  const [timeInputCMD, setTimeInputCMD] = useState('08/21/2025,12:30:00');

  const toggleHeartRateDisplay_OLD = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'CMD:1');
    }
  };

  const changeBackgroundColor_OLD = async (hexColor) => {
    if (serialPort) {
      await sendCommand(serialPort, `CMD:2:${hexColor}`);
    }
  };

  const toggleNotifications_OLD = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'CMD:3');
    }
  };

  const adjustBrightness_OLD = async (direction) => {
    if (serialPort && (direction === 'UP' || direction === 'DOWN')) {
      await sendCommand(serialPort, `CMD:4:${direction}`);
    }
  };

  const toggleClockDisplay_OLD = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'CMD:5');
    }
  };

  const setTime_OLD = async (timeString) => {
    if (serialPort) {
      await sendCommand(serialPort, `CMD:6:${timeString}`);
    }
  };

  // ---------------------------------
  // NEW CONTROLS STATE & COMMANDS
  // ---------------------------------
  const [activeTab, setActiveTab] = useState('system');
  
  // System state
  const [systemInfo, setSystemInfo] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(null);
  
  // Screen state
  const [brightness, setBrightness] = useState(50);
  const [selectedWatchface, setSelectedWatchface] = useState(0);
  
  // App state
  const [appList, setAppList] = useState([]);
  const [selectedApp, setSelectedApp] = useState(0);
  
  // Settings state
  const [timezone, setTimezone] = useState(0);
  const [units, setUnits] = useState('METRIC');
  const [hrInterval, setHrInterval] = useState(15);
  
  // Sensor state
  const [sensorData, setSensorData] = useState({
    heartRate: null,
    spo2: null,
    accel: null,
    temp: null
  });
  
  // Time state
  const [timeValue, setTimeValue] = useState('12:30:00');
  const [dateValue, setDateValue] = useState('2025-08-21');
  
  // Notification state
  const [notificationText, setNotificationText] = useState('');
  const [callerName, setCallerName] = useState('');
  
  // ----- Sample chart data (used by both old & new UI) -----
  const [heartrateData, setHeartrateData] = useState({
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

  // Add new state for Firebase data
  const [firebaseData, setFirebaseData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add new state for sensor data charts
  const [heartRateChartData, setHeartRateChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Heart Rate (BPM)',
      data: [],
      borderColor: 'rgba(0, 255, 255, 1)', // Neon cyan
      backgroundColor: 'rgba(0, 255, 255, 0.1)',
      tension: 0.4,
      borderWidth: 2,
      pointBackgroundColor: 'rgba(0, 255, 255, 1)',
      pointBorderColor: '#000',
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  });

  const [stepsChartData, setStepsChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Steps',
      data: [],
      borderColor: 'rgba(255, 0, 255, 1)', // Neon magenta
      backgroundColor: 'rgba(255, 0, 255, 0.1)',
      tension: 0.4,
      borderWidth: 2,
      pointBackgroundColor: 'rgba(255, 0, 255, 1)',
      pointBorderColor: '#000',
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  });

  const [spo2ChartData, setSpo2ChartData] = useState({
    labels: [],
    datasets: [{
      label: 'SpO2 (%)',
      data: [],
      borderColor: 'rgba(255, 255, 0, 1)', // Neon yellow
      backgroundColor: 'rgba(255, 255, 0, 0.1)',
      tension: 0.4,
      borderWidth: 2,
      pointBackgroundColor: 'rgba(255, 255, 0, 1)',
      pointBorderColor: '#000',
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  });

  // Common chart options for cyberpunk theme
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(0, 255, 255, 1)',
          font: {
            family: "'Rajdhani', 'Orbitron', 'Share Tech Mono', monospace",
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        color: 'rgba(0, 255, 255, 1)',
        font: {
          family: "'Rajdhani', 'Orbitron', 'Share Tech Mono', monospace",
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 255, 255, 0.1)',
          borderColor: 'rgba(0, 255, 255, 0.3)'
        },
        ticks: {
          color: 'rgba(0, 255, 255, 0.8)',
          font: {
            family: "'Rajdhani', 'Orbitron', 'Share Tech Mono', monospace"
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 255, 255, 0.1)',
          borderColor: 'rgba(0, 255, 255, 0.3)'
        },
        ticks: {
          color: 'rgba(0, 255, 255, 0.8)',
          font: {
            family: "'Rajdhani', 'Orbitron', 'Share Tech Mono', monospace"
          }
        }
      }
    }
  };

  // Function to fetch data from Firebase
  const fetchFirebaseData = async () => {
    try {
      setIsLoading(true);
      const data = await getAllSensorData();
      setFirebaseData(data);
      
      // Sort data by timestamp
      const sortedData = [...data].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );

      // Get the last 24 hours of data
      const last24Hours = sortedData.filter(d => 
        new Date(d.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      // Update heart rate chart
      setHeartRateChartData({
        labels: last24Hours.map(d => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
          ...heartRateChartData.datasets[0],
          data: last24Hours.map(d => d.heartrate || 0)
        }]
      });

      // Update steps chart
      setStepsChartData({
        labels: last24Hours.map(d => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
          ...stepsChartData.datasets[0],
          data: last24Hours.map(d => d.steps || 0)
        }]
      });

      // Update SpO2 chart
      setSpo2ChartData({
        labels: last24Hours.map(d => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
          ...spo2ChartData.datasets[0],
          data: last24Hours.map(d => d.spo2 || 0)
        }]
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset all data
  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to delete all sensor data?')) {
      try {
        setIsLoading(true);
        await deleteAllSensorData();
        setFirebaseData([]);
        
        // Reset charts to empty state
        setHeartRateChartData({
          labels: [],
          datasets: [{
            ...heartRateChartData.datasets[0],
            data: []
          }]
        });
        
        setStepsChartData({
          labels: [],
          datasets: [{
            ...stepsChartData.datasets[0],
            data: []
          }]
        });
        
        setSpo2ChartData({
          labels: [],
          datasets: [{
            ...spo2ChartData.datasets[0],
            data: []
          }]
        });
      } catch (error) {
        console.error('Error resetting data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Add this function after the other state declarations
  const generateRandomData = async () => {
    try {
      setIsLoading(true);
      // Generate 24 hours of data points (one per hour)
      const now = new Date();
      const dataPoints = [];
      
      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        
        // Generate realistic values
        const heartRate = Math.floor(Math.random() * 40) + 60; // 60-100 BPM
        const steps = Math.floor(Math.random() * 1000) + 500; // 500-1500 steps per hour
        const spo2 = Math.floor(Math.random() * 5) + 95; // 95-100% SpO2
        
        const data = {
          timestamp: timestamp.toISOString(),
          heartrate: heartRate,
          steps: steps,
          spo2: spo2
        };
        
        // Store with timestamp as key
        await setDoc(doc(db, 'sensorData', timestamp.toISOString()), data);
      }
      
      // Refresh the data display
      await fetchFirebaseData();
    } catch (error) {
      console.error('Error generating random data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ----- NEW MODE COMMANDS -----
  // Connect
  const handleConnect = async () => {
    const port = await connectToSmartwatch();
    if (port) {
      setSerialPort(port);
      // If we're in new mode, fetch some info automatically:
      if (!useOldControls) {
        setTimeout(() => {
          getSystemInfo();
          getBatteryLevel();
          getAppList();
        }, 1000);
      }
    }
  };
  
  // === SYSTEM COMMANDS (new) ===
  const getSystemInfo = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'SYS:INFO');
    }
  };
  
  const getBatteryLevel = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'SYS:BATT');
    }
  };
  
  const rebootDevice = async () => {
    if (serialPort) {
      if (window.confirm('Are you sure you want to reboot the smartwatch?')) {
        await sendCommand(serialPort, 'SYS:REBOOT');
      }
    }
  };
  
  // === SCREEN COMMANDS (new) ===
  const setBrightnessLevel = async (level) => {
    if (serialPort) {
      await sendCommand(serialPort, `SCR:BRIGHT:${level}`);
      setBrightness(level);
    }
  };
  
  const setWatchface = async (faceId) => {
    if (serialPort) {
      await sendCommand(serialPort, `SCR:FACE:${faceId}`);
      setSelectedWatchface(faceId);
    }
  };
  
  const toggleScreen = async (state) => {
    if (serialPort) {
      await sendCommand(serialPort, `SCR:${state}`);
    }
  };
  
  // === APP COMMANDS (new) ===
  const getAppList = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'APP:LIST');
    }
  };
  
  const launchApp = async (appId) => {
    if (serialPort) {
      await sendCommand(serialPort, `APP:LAUNCH:${appId}`);
    }
  };
  
  const closeApp = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'APP:CLOSE');
    }
  };
  
  // === SETTINGS COMMANDS (new) ===
  const updateTimezone = async () => {
    if (serialPort) {
      await sendCommand(serialPort, `SET:TIMEZONE:${timezone}`);
    }
  };
  
  const updateUnits = async (unitSystem) => {
    if (serialPort) {
      await sendCommand(serialPort, `SET:UNITS:${unitSystem}`);
      setUnits(unitSystem);
    }
  };
  
  const updateHrInterval = async () => {
    if (serialPort) {
      await sendCommand(serialPort, `SET:HR_INTERVAL:${hrInterval}`);
    }
  };
  
  // === SENSOR COMMANDS (new) ===
  const getHeartRate = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'SENS:HR');
    }
  };
  
  const getSpO2 = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'SENS:SPO2');
    }
  };
  
  const getAccelerometer = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'SENS:ACCEL');
    }
  };
  
  const getTemperature = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'SENS:TEMP');
    }
  };
  
  // === TIME COMMANDS (new) ===
  const getCurrentTime = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'TIME:GET');
    }
  };
  
  const setTimeOnWatch = async () => {
    if (serialPort) {
      await sendCommand(serialPort, `TIME:SET:${timeValue}`);
    }
  };
  
  const setDateOnWatch = async () => {
    if (serialPort) {
      await sendCommand(serialPort, `TIME:DATE:${dateValue}`);
    }
  };
  
  // === NOTIFICATION COMMANDS (new) ===
  const sendTextNotification = async () => {
    if (serialPort && notificationText) {
      await sendCommand(serialPort, `NOTIF:TEXT:${notificationText}`);
    }
  };
  
  const sendCallNotification = async () => {
    if (serialPort && callerName) {
      await sendCommand(serialPort, `NOTIF:CALL:${callerName}`);
    }
  };
  
  const clearNotifications = async () => {
    if (serialPort) {
      await sendCommand(serialPort, 'NOTIF:CLEAR');
    }
  };
  
  // === Parsing new-mode data responses ===
  const processResponse = (text) => {
    if (text.startsWith('DATA:')) {
      const dataStr = text.substring(5);
      const dataPairs = dataStr.split(',');
      const sensorData = {};
      
      dataPairs.forEach(pair => {
        const [key, value] = pair.split('=');
        sensorData[key.toLowerCase()] = parseFloat(value);
      });

      // Add timestamp to the data
      const timestamp = new Date().toISOString();
      const dataWithTimestamp = {
        ...sensorData,
        timestamp: timestamp
      };

      // Store in Firebase with timestamp as key
      storeSensorData(dataWithTimestamp)
        .then(() => {
          // Refresh the data display
          fetchFirebaseData();
        })
        .catch(error => {
          console.error('Error storing sensor data:', error);
        });
    }
    // If in old mode, we don't parse "DATA:" lines
    if (useOldControls) return;

    // Otherwise, parse the new format
    if (text.startsWith('DATA:')) {
      const parts = text.split(':');
      if (parts.length >= 3) {
        const dataType = parts[1];
        const dataValue = parts.slice(2).join(':').trim();
        
        switch (dataType) {
          case 'SYSINFO':
            setSystemInfo(dataValue);
            break;
          case 'BATTERY':
            setBatteryLevel(dataValue);
            break;
          case 'HR':
            setSensorData(prev => ({ ...prev, heartRate: dataValue }));
            break;
          case 'SPO2':
            setSensorData(prev => ({ ...prev, spo2: dataValue }));
            break;
          case 'ACCEL':
            setSensorData(prev => ({ ...prev, accel: dataValue }));
            break;
          case 'TEMP':
            setSensorData(prev => ({ ...prev, temp: dataValue }));
            break;
          case 'TIME':
            // Parse time response
            if (dataValue.includes(' ')) {
              const [date, time] = dataValue.split(' ');
              setDateValue(date);
              setTimeValue(time);
            }
            break;
          case 'APPLIST':
            // Parse app list response, e.g. "0:Settings,1:Music"
            try {
              const apps = dataValue.split(',').map(app => {
                const [id, name] = app.split(':');
                return { id: parseInt(id), name };
              });
              setAppList(apps);
            } catch (e) {
              console.error('Error parsing app list:', e);
            }
            break;
          default:
            console.log(`Unhandled data type: ${dataType}`);
        }
      }
    }
  };

  // ---------------------------------
  // PORT READING (COMMON)
  // ---------------------------------
  useEffect(() => {
    if (!serialPort) return;

    let reader;
    let cancel = false;

    const readFromPort = async () => {
      try {
        while (serialPort.readable && !cancel) {
          reader = serialPort.readable.getReader();
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) {
                console.log("Reader closed");
                break;
              }
              if (value) {
                const text = new TextDecoder().decode(value);
                setReceivedData(prev => prev + text);
                
                const lines = text.split('\r\n');
                for (const line of lines) {
                  if (line.trim()) {
                    processResponse(line.trim());
                  }
                }

                console.log("Received data:", text);
              }
            }
          } catch (err) {
            console.error("Reading error:", err);
          } finally {
            if (reader) {
              reader.releaseLock();
            }
          }
        }
      } catch (error) {
        console.error("Error in readFromPort:", error);
      }
    };

    readFromPort();

    return () => {
      cancel = true;
      if (reader) {
        reader.releaseLock();
      }
      if (serialPort) {
        serialPort.close().catch(err => {
          console.error("Error closing port:", err);
        });
      }
    };
  }, [serialPort, useOldControls]);

  useEffect(() => {
    console.log("Dashboard mounted. Waiting for serial communication...");
  }, []);
  
  // Add this useEffect after the other state declarations
  useEffect(() => {
    if (activeTab === 'data') {
      fetchFirebaseData();
    }
  }, [activeTab]);

  // --------------------------------------------------------
  // RENDERING - OLD CONTROLS UI
  // --------------------------------------------------------
  const renderOldControlsUI = () => {
    return (
      <div className="controls-section">
        <h3>Legacy CMD Controls</h3>
        
        {/* CMD:1 Toggle Heart Rate Display */}
        <button onClick={toggleHeartRateDisplay_OLD}>
          Toggle Heart Rate Display (CMD:1)
        </button>
        
        {/* CMD:2 Change Background Color */}
        <div className="parameter-control">
          <label>Background Color (CMD:2): </label>
          <input 
            type="color" 
            value={bgColor} 
            onChange={(e) => setBgColor(e.target.value)}
          />
          <button onClick={() => changeBackgroundColor_OLD(bgColor)}>
            Change Background Color
          </button>
        </div>
        
        {/* CMD:3 Toggle Notifications */}
        <button onClick={toggleNotifications_OLD}>
          Toggle Notifications (CMD:3)
        </button>
        
        {/* CMD:4 Adjust Brightness */}
        <div className="parameter-control">
          <label>Brightness (CMD:4): </label>
          <select 
            value={brightnessCMD} 
            onChange={(e) => setBrightnessCMD(e.target.value)}
          >
            <option value="UP">Increase</option>
            <option value="DOWN">Decrease</option>
          </select>
          <button onClick={() => adjustBrightness_OLD(brightnessCMD)}>
            Adjust Brightness
          </button>
        </div>
        
        {/* CMD:5 Toggle Clock Display */}
        <button onClick={toggleClockDisplay_OLD}>
          Toggle Clock Display (CMD:5)
        </button>
        
        {/* CMD:6 Set Time */}
        <div className="parameter-control">
          <label>Set Time (CMD:6): </label>
          <input 
            type="text"
            placeholder="MM/DD/YYYY,HH:MIN:SEC" 
            value={timeInputCMD} 
            onChange={(e) => setTimeInputCMD(e.target.value)}
          />
          <button onClick={() => setTime_OLD(timeInputCMD)}>
            Set Time
          </button>
        </div>
      </div>
    );
  };

  // --------------------------------------------------------
  // RENDERING - NEW CONTROLS UI (TAB-BASED)
  // --------------------------------------------------------
  const renderNewControlsUI = () => {
    // tab content
    const renderTabContent = () => {
      switch (activeTab) {
        case 'system':
          return (
            <div className="tab-content">
              <h3>System Controls</h3>
              <div className="command-group">
                <button onClick={getSystemInfo} className="command-btn">Get System Info</button>
                <button onClick={getBatteryLevel} className="command-btn">Get Battery Level</button>
                <button onClick={rebootDevice} className="command-btn danger">Reboot Device</button>
              </div>
              <div className="info-display">
                {systemInfo && <div className="info-item"><span>System Info:</span> {systemInfo}</div>}
                {batteryLevel && <div className="info-item"><span>Battery:</span> {batteryLevel}</div>}
              </div>
            </div>
          );
          
        case 'screen':
          return (
            <div className="tab-content">
              <h3>Screen Controls</h3>
              <div className="command-group">
                <div className="parameter-control">
                  <label htmlFor="brightness">Brightness ({brightness}%)</label>
                  <input 
                    id="brightness"
                    type="range" 
                    min="0"
                    max="100"
                    step="5"
                    className="slider"
                    value={brightness} 
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                  />
                  <button onClick={() => setBrightnessLevel(brightness)}>Set Brightness</button>
                </div>
                
                <div className="parameter-control">
                  <label htmlFor="watchface">Watchface</label>
                  <select 
                    id="watchface"
                    value={selectedWatchface}
                    onChange={(e) => setSelectedWatchface(parseInt(e.target.value))}
                  >
                    <option value={0}>Digital Watchface</option>
                    <option value={1}>Analog Watchface</option>
                  </select>
                  <button onClick={() => setWatchface(selectedWatchface)}>Set Watchface</button>
                </div>
                
                <div className="button-group">
                  <button onClick={() => toggleScreen('ON')} className="command-btn">Screen ON</button>
                  <button onClick={() => toggleScreen('OFF')} className="command-btn">Screen OFF</button>
                </div>
              </div>
            </div>
          );
          
        case 'apps':
          return (
            <div className="tab-content">
              <h3>App Management</h3>
              <div className="command-group">
                <button onClick={getAppList} className="command-btn">Refresh App List</button>
                
                <div className="parameter-control">
                  <label htmlFor="app-select">Select App</label>
                  <select 
                    id="app-select"
                    value={selectedApp}
                    onChange={(e) => setSelectedApp(parseInt(e.target.value))}
                  >
                    {appList.map(app => (
                      <option key={app.id} value={app.id}>{app.name}</option>
                    ))}
                    {appList.length === 0 && <option value={0}>Settings</option>}
                  </select>
                  <button onClick={() => launchApp(selectedApp)}>Launch App</button>
                </div>
                
                <button onClick={closeApp} className="command-btn">Close Current App</button>
              </div>
            </div>
          );
          
        case 'settings':
          return (
            <div className="tab-content">
              <h3>Settings</h3>
              <div className="command-group">
                <div className="parameter-control">
                  <label htmlFor="timezone">Timezone (UTC{timezone >= 0 ? '+' : ''}{timezone})</label>
                  <input 
                    id="timezone"
                    type="range" 
                    min="-12"
                    max="14"
                    className="slider"
                    value={timezone} 
                    onChange={(e) => setTimezone(parseInt(e.target.value))}
                  />
                  <button onClick={updateTimezone}>Set Timezone</button>
                </div>
                
                <div className="parameter-control">
                  <label htmlFor="units">Units</label>
                  <div className="radio-group">
                    <label>
                      <input 
                        type="radio"
                        name="units"
                        value="METRIC"
                        checked={units === 'METRIC'}
                        onChange={() => updateUnits('METRIC')}
                      />
                      Metric
                    </label>
                    <label>
                      <input 
                        type="radio"
                        name="units"
                        value="IMPERIAL"
                        checked={units === 'IMPERIAL'}
                        onChange={() => updateUnits('IMPERIAL')}
                      />
                      Imperial
                    </label>
                  </div>
                </div>
                
                <div className="parameter-control">
                  <label htmlFor="hr-interval">Heart Rate Monitoring Interval ({hrInterval} min)</label>
                  <input 
                    id="hr-interval"
                    type="range" 
                    min="1"
                    max="60"
                    className="slider"
                    value={hrInterval} 
                    onChange={(e) => setHrInterval(parseInt(e.target.value))}
                  />
                  <button onClick={updateHrInterval}>Set Interval</button>
                </div>
              </div>
            </div>
          );
          
        case 'sensors':
          return (
            <div className="tab-content">
              <h3>Sensor Data</h3>
              <div className="command-group">
                <div className="button-group">
                  <button onClick={getHeartRate} className="command-btn">Get Heart Rate</button>
                  <button onClick={getSpO2} className="command-btn">Get SpO2</button>
                  <button onClick={getAccelerometer} className="command-btn">Get Accelerometer</button>
                  <button onClick={getTemperature} className="command-btn">Get Temperature</button>
                </div>
                
                <div className="sensor-display">
                  {sensorData.heartRate && (
                    <div className="sensor-item">
                      <span>Heart Rate:</span> {sensorData.heartRate}
                    </div>
                  )}
                  {sensorData.spo2 && (
                    <div className="sensor-item">
                      <span>SpO2:</span> {sensorData.spo2}
                    </div>
                  )}
                  {sensorData.accel && (
                    <div className="sensor-item">
                      <span>Accelerometer:</span> {sensorData.accel}
                    </div>
                  )}
                  {sensorData.temp && (
                    <div className="sensor-item">
                      <span>Temperature:</span> {sensorData.temp}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="charts-section">
                <div className="chart-container">
                  <h3>Heart Rate Trends</h3>
                  <Line data={heartrateData} />
                </div>
              </div>
            </div>
          );
          
        case 'time':
          return (
            <div className="tab-content">
              <h3>Time Settings</h3>
              <div className="command-group">
                <button onClick={getCurrentTime} className="command-btn">Get Current Time</button>
                
                <div className="parameter-control">
                  <label htmlFor="time-input">Set Time</label>
                  <input 
                    id="time-input"
                    type="time" 
                    step="1"
                    className="control-input"
                    value={timeValue} 
                    onChange={(e) => setTimeValue(e.target.value)}
                  />
                  <button onClick={setTimeOnWatch}>Set Time</button>
                </div>
                
                <div className="parameter-control">
                  <label htmlFor="date-input">Set Date</label>
                  <input 
                    id="date-input"
                    type="date" 
                    className="control-input"
                    value={dateValue} 
                    onChange={(e) => setDateValue(e.target.value)}
                  />
                  <button onClick={setDateOnWatch}>Set Date</button>
                </div>
              </div>
            </div>
          );
          
        case 'notifications':
          return (
            <div className="tab-content">
              <h3>Notifications</h3>
              <div className="command-group">
                <div className="parameter-control">
                  <label htmlFor="notification-text">Text Message</label>
                  <input 
                    id="notification-text"
                    type="text" 
                    className="control-input"
                    placeholder="Enter notification text" 
                    value={notificationText} 
                    onChange={(e) => setNotificationText(e.target.value)}
                  />
                  <button onClick={sendTextNotification}>Send Text Notification</button>
                </div>
                
                <div className="parameter-control">
                  <label htmlFor="caller-name">Caller Name</label>
                  <input 
                    id="caller-name"
                    type="text" 
                    className="control-input"
                    placeholder="Enter caller name" 
                    value={callerName} 
                    onChange={(e) => setCallerName(e.target.value)}
                  />
                  <button onClick={sendCallNotification}>Send Call Notification</button>
                </div>
                
                <button onClick={clearNotifications} className="command-btn">Clear All Notifications</button>
              </div>
            </div>
          );
          
        case 'data':
          return renderDataTab();
          
        case 'log':
          return (
            <div className="tab-content">
              <h3>Communication Log</h3>
              <div className="incoming-data">
                <pre>{receivedData}</pre>
                <button 
                  onClick={() => setReceivedData('')}
                  className="command-btn"
                >
                  Clear Log
                </button>
              </div>
            </div>
          );
          
        default:
          return null;
      }
    };

    return (
      <>
        <div className="dashboard-nav">
          <button 
            className={activeTab === 'system' ? 'active' : ''} 
            onClick={() => setActiveTab('system')}
          >
            System
          </button>
          <button 
            className={activeTab === 'screen' ? 'active' : ''} 
            onClick={() => setActiveTab('screen')}
          >
            Screen
          </button>
          <button 
            className={activeTab === 'apps' ? 'active' : ''} 
            onClick={() => setActiveTab('apps')}
          >
            Apps
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button 
            className={activeTab === 'sensors' ? 'active' : ''} 
            onClick={() => setActiveTab('sensors')}
          >
            Sensors
          </button>
          <button 
            className={activeTab === 'time' ? 'active' : ''} 
            onClick={() => setActiveTab('time')}
          >
            Time
          </button>
          <button 
            className={activeTab === 'notifications' ? 'active' : ''} 
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button 
            className={activeTab === 'data' ? 'active' : ''} 
            onClick={() => setActiveTab('data')}
          >
            Data
          </button>
          <button 
            className={activeTab === 'log' ? 'active' : ''} 
            onClick={() => setActiveTab('log')}
          >
            Log
          </button>
        </div>

        <div className="dashboard-content">
          {renderTabContent()}
        </div>
      </>
    );
  };

  // Update the data tab content with themed charts
  const renderDataTab = () => (
    <div className="tab-content">
      <h3>Sensor Data</h3>
      <div className="data-controls">
        <button 
          onClick={handleResetData}
          className="reset-button"
          disabled={isLoading}
        >
          {isLoading ? 'Resetting...' : 'Reset All Data'}
        </button>
        <button 
          onClick={generateRandomData}
          className="generate-data-button"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Test Data'}
        </button>
      </div>
      <div className="charts-section">
        <div className="chart-container">
          <h4>Heart Rate</h4>
          <div className="chart-wrapper">
            <Line 
              data={heartRateChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Heart Rate Over Time'
                  }
                },
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    beginAtZero: false,
                    title: {
                      display: true,
                      text: 'BPM',
                      color: 'rgba(0, 255, 255, 0.8)',
                      font: {
                        family: "'Rajdhani', 'Orbitron', 'Share Tech Mono', monospace"
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="chart-container">
          <h4>Steps</h4>
          <div className="chart-wrapper">
            <Line 
              data={stepsChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Steps Over Time'
                  }
                },
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Steps',
                      color: 'rgba(0, 255, 255, 0.8)',
                      font: {
                        family: "'Rajdhani', 'Orbitron', 'Share Tech Mono', monospace"
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="chart-container">
          <h4>SpO2</h4>
          <div className="chart-wrapper">
            <Line 
              data={spo2ChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'SpO2 Over Time'
                  }
                },
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    beginAtZero: false,
                    min: 90,
                    max: 100,
                    title: {
                      display: true,
                      text: '%',
                      color: 'rgba(0, 255, 255, 0.8)',
                      font: {
                        family: "'Rajdhani', 'Orbitron', 'Share Tech Mono', monospace"
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // --------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------
  return (
    <div className="dashboard">
      <Link to="/">
        <button className="back-btn">Back to Home</button>
      </Link>

      <h2>Smartwatch Control Panel</h2>
      
      {/* Control Mode Toggle */}
      <div className="control-mode-toggle">
        <label>
          <input 
            type="checkbox"
            checked={useOldControls}
            onChange={() => setUseOldControls(!useOldControls)}
          />
          Legacy CMD Controls
        </label>
      </div>

      {/* Connection section */}
      <div className="connection-section">
        <button 
          onClick={handleConnect} 
          className={serialPort ? "connected-btn" : ""}
        >
          {serialPort ? "Connected ✓" : "Connect to Smartwatch"}
        </button>
        {serialPort ? (
          <span className="status-indicator connected">Connected</span>
        ) : (
          <span className="status-indicator not-connected">Not Connected</span>
        )}
      </div>

      {/* Conditionally render old or new UI */}
      {useOldControls ? renderOldControlsUI() : renderNewControlsUI()}

      {/* Shared charts (optional) – in old code we had them at the bottom. 
          If you prefer to show them only in old mode, you can conditionally place them. */}
      {useOldControls && (
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
      )}

      {/* Show incoming data/log for old mode, but new mode has its own Log tab. */}
      {useOldControls && (
        <div className="incoming-data">
          <h4>Incoming Data</h4>
          <pre>{receivedData}</pre>
          <button onClick={() => setReceivedData("")}>Clear Log</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;