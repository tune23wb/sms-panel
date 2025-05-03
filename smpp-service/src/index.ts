import express, { Request, Response } from 'express';
import { Client, PDU } from 'smpp';
import { config } from 'dotenv';
import { createServer } from 'http';

// Add type definitions for SMPP
declare module 'smpp' {
  export class Client {
    constructor(options: any);
    connect(): void;
    close(): void;
    bind_transceiver(params: any, callback: (pdu: PDU) => void): void;
    submit_sm(params: any, callback: (pdu: PDU) => void): void;
    on(event: string, callback: (data: any) => void): void;
  }

  export interface PDU {
    command_status: number;
    message_id?: string;
  }
}

config();

const app = express();
const port = process.env.PORT || 3001;

// SMPP Configuration
const smppConfig = {
  host: process.env.SMPP_HOST || 'smpp.quantumhub.mx',
  port: parseInt(process.env.SMPP_PORT || '2775'),
  systemId: process.env.SMPP_SYSTEM_ID || 'quantumhub',
  password: process.env.SMPP_PASSWORD || 'QuantumHub2024',
  sourceAddr: process.env.SMPP_SOURCE_ADDR || '82833'
};

// Create SMPP client
const client = new Client({
  host: smppConfig.host,
  port: smppConfig.port,
  auto_enquire_link_period: 10000, // Send enquire_link every 10 seconds
  reconnect: true, // Enable automatic reconnection
  reconnect_delay: 5000, // Wait 5 seconds before reconnecting
  debug: true // Enable debug logging
});

// Connection state tracking
let isConnected = false;
let reconnectAttempts = 0;

// Add message queue
const messageQueue: Array<{ destination: string; message: string; source_addr: string }> = [];

// Connection event handlers
client.on('connect', () => {
  console.log('Connected to SMPP server');
  isConnected = true;
  reconnectAttempts = 0;
  
  // Bind to the SMPP server
  client.bind_transceiver({
    system_id: smppConfig.systemId,
    password: smppConfig.password
  }, (pdu) => {
    if (pdu.command_status === 0) {
      console.log('Successfully bound to SMPP server');
      // Process message queue on successful bind
      while (messageQueue.length > 0) {
        const msg = messageQueue.shift();
        if (msg) {
          client.submit_sm({
            source_addr: msg.source_addr,
            destination_addr: msg.destination,
            short_message: msg.message,
            registered_delivery: 1
          }, (pdu) => {
            if (pdu.command_status === 0) {
              console.log('Queued message sent successfully:', pdu.message_id);
            } else {
              console.error('Failed to send queued message:', pdu.command_status);
            }
          });
        }
      }
    } else {
      console.error('Failed to bind to SMPP server:', pdu.command_status);
      client.close();
    }
  });
});

client.on('close', () => {
  console.log('Connection to SMPP server closed');
  isConnected = false;
  reconnectAttempts++;
  console.log(`Attempting to reconnect (${reconnectAttempts})...`);
  setTimeout(() => {
    client.connect();
  }, 5000);
});

client.on('error', (error) => {
  console.error('SMPP Error:', error);
});

// Message delivery report handler
client.on('deliver_sm', (pdu) => {
  console.log('Message delivery report:', pdu);
});

// Express middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: isConnected ? 'connected' : 'disconnected',
    reconnectAttempts,
    smppConfig: {
      host: smppConfig.host,
      port: smppConfig.port,
      systemId: smppConfig.systemId,
      sourceAddr: smppConfig.sourceAddr
    }
  });
});

// Send SMS endpoint
app.post('/send', async (req: Request, res: Response) => {
  const { destination, message, source_addr = smppConfig.sourceAddr } = req.body;

  if (!destination || !message) {
    return res.status(400).json({
      success: false,
      error: 'Destination and message are required'
    });
  }

  if (!isConnected) {
    // Queue the message if not connected
    messageQueue.push({ destination, message, source_addr });
    return res.status(202).json({
      success: true,
      message: 'Message queued for sending when connection is restored'
    });
  }

  try {
    const pdu = await new Promise((resolve, reject) => {
      client.submit_sm({
        source_addr: source_addr,
        destination_addr: destination,
        short_message: message,
        registered_delivery: 1
      }, (pdu) => {
        if (pdu.command_status === 0) {
          resolve(pdu);
        } else {
          reject(new Error(`SMPP error: ${pdu.command_status}`));
        }
      });
    });

    console.log('Message sent successfully:', {
      messageId: pdu.message_id,
      destination,
      sourceAddr: source_addr
    });

    res.json({
      success: true,
      messageId: pdu.message_id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start the server
const server = createServer(app);

server.listen(port, () => {
  console.log(`SMPP service listening on port ${port}`);
  // Connect to SMPP server
  client.connect();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  client.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 