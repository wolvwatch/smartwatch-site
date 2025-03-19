// Request the serial port and open it for communication.
// Adjust baudRate according to your HC-05 configuration (typically 9600).
export const connectToSmartwatch = async () => {
  try {
    // Prompt user to select a serial port.
    const port = await navigator.serial.requestPort();
    
    // Open the port with the specified baud rate.
    await port.open({ baudRate: 9600 });
    await port.setSignals({ dataTerminalReady: true, requestToSend: true });
    
    console.log("Serial port opened successfully.");
    return port;
  } catch (error) {
    console.error("Failed to open serial port:", error);
    return null;
  }
};

// In sendCommand
export const sendCommand = async (port, command) => {
    try {
      if (!port || !port.writable) {
        throw new Error("Port is not open or writable.");
      }
  
      const writer = port.writable.getWriter();
  
      // Append a newline so your device can parse commands properly
      const fullCommand = command + "\r\n"; 
      const encoder = new TextEncoder();
      const data = encoder.encode(fullCommand);
  
      await writer.write(data);
      writer.releaseLock();
  
      console.log("Command sent:", fullCommand);
    } catch (error) {
      console.error("Failed to send command:", error);
    }
  };