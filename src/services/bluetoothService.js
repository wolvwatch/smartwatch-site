export const connectToSmartwatch = async () => {
  try {

    const port = await navigator.serial.requestPort();
    
    await port.open({ baudRate: 9600 });
    await port.setSignals({ dataTerminalReady: true, requestToSend: true });
    
    console.log("Serial port opened successfully.");
    return port;
  } catch (error) {
    console.error("Failed to open serial port:", error);
    return null;
  }
};


export const sendCommand = async (port, command) => {
    try {
      if (!port || !port.writable) {
        throw new Error("Port is not open or writable.");
      }
  
      const writer = port.writable.getWriter();
  
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