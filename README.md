# Smartwatch Control Panel

A modern React-based control panel for interfacing with your custom smartwatch via serial/Bluetooth communication.

## Overview

This web application provides a comprehensive interface to control and monitor your smartwatch. It's organized into functional categories that match the smartwatch's command structure:

1. **System Controls**: Get device info, battery status, and reboot
2. **Screen Controls**: Adjust brightness, change watchfaces, and toggle screen
3. **Apps**: Launch, close, and list available applications
4. **Settings**: Configure timezone, units, and monitoring intervals
5. **Sensors**: Read heart rate, SpO2, accelerometer, and temperature data
6. **Time**: Set time and date on the device
7. **Notifications**: Send text/call notifications and clear existing ones
8. **Data Visualization**: View activity and sleep metrics
9. **Communication Log**: Monitor raw data sent/received

## Command Structure

The control panel uses the following command structure to communicate with the smartwatch:

- **SYS**: System commands
  - `SYS:REBOOT` - Restart the device
  - `SYS:INFO` - Get system information
  - `SYS:BATT` - Get battery level

- **SCR**: Screen commands
  - `SCR:BRIGHT:value` - Set brightness (0-100)
  - `SCR:FACE:id` - Change watchface (0=Digital, 1=Analog)
  - `SCR:ON` / `SCR:OFF` - Turn screen on/off

- **APP**: App management
  - `APP:LAUNCH:id` - Launch app by ID
  - `APP:CLOSE` - Close current app
  - `APP:LIST` - Get list of available apps

- **SET**: Settings
  - `SET:TIMEZONE:value` - Set timezone (UTC offset)
  - `SET:UNITS:METRIC/IMPERIAL` - Set unit system
  - `SET:HR_INTERVAL:value` - Set heart rate monitoring interval

- **SENS**: Sensor controls
  - `SENS:HR` - Get heart rate
  - `SENS:SPO2` - Get blood oxygen level
  - `SENS:ACCEL` - Get accelerometer data
  - `SENS:TEMP` - Get temperature

- **TIME**: Time settings
  - `TIME:SET:hh:mm:ss` - Set time
  - `TIME:DATE:yyyy-mm-dd` - Set date
  - `TIME:GET` - Get current time

- **NOTIF**: Notifications
  - `NOTIF:TEXT:message` - Send text notification
  - `NOTIF:CALL:name` - Send call notification
  - `NOTIF:CLEAR` - Clear all notifications

## Response Format

The smartwatch sends responses in the following formats:

- `OK:message` - Command executed successfully
- `ERROR:message` - Command failed with error
- `DATA:type:value` - Data response (e.g., sensor readings)

## Getting Started

1. Connect your smartwatch to your computer via USB/Bluetooth
2. Launch the web application
3. Click "Connect to Smartwatch" to establish serial connection
4. Use the various tabs to control your device

## Development

This project uses:
- React for the UI
- Chart.js for data visualization
- Web Serial API for device communication

## License

MIT License
