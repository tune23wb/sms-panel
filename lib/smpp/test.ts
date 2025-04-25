import { smppService } from './client';

async function testSMPPConnection() {
  try {
    console.log('Starting SMPP connection test...');
    
    // Add a delay before starting to ensure any previous connections are fully closed
    console.log('Waiting 10 seconds before starting...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Connect to SMPP server
    const connected = await smppService.connect();
    
    if (connected) {
      console.log('Successfully connected to SMPP server');
      
      // Add a delay before sending message
      console.log('Waiting 5 seconds before sending message...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Test sending a message
      const phoneNumber = '523317953591';
      const message = 'Test message from SMPP service';
      
      console.log('Sending test message...');
      const result = await smppService.sendMessage(phoneNumber, message);
      console.log('Message sent successfully:', result);
      
      // Add a delay before disconnecting
      console.log('Waiting 5 seconds before disconnecting...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Disconnect
      await smppService.disconnect();
      console.log('Disconnected from SMPP server');
    } else {
      console.error('Failed to connect to SMPP server');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testSMPPConnection(); 