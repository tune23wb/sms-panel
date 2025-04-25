const smpp = require('smpp');
const { smppConfig } = require('./config');

class SMPPService {
  private client: any;
  private connected: boolean = false;
  private connecting: boolean = false;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private cleanupTimeout: NodeJS.Timeout | null = null;
  private socketClosePromise: Promise<void> | null = null;

  constructor() {
    this.createNewSession();
  }

  private async createNewSession() {
    // Cleanup existing session if any
    if (this.client) {
      await this.cleanup();
    }

    // Add a delay before creating new session
    await new Promise(resolve => setTimeout(resolve, 2000));

    this.client = new smpp.Session({
      host: smppConfig.host,
      port: smppConfig.port,
      auto_reconnect: false,
      debug: true
    });

    this.setupEventHandlers();
  }

  private async waitForSocketClose(socket: any): Promise<void> {
    return new Promise((resolve) => {
      if (!socket || !socket.writable && !socket.readable) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        console.log('Socket close timeout, forcing destruction');
        socket.destroy();
        resolve();
      }, 5000);

      socket.once('close', () => {
        clearTimeout(timeout);
        resolve();
      });

      socket.destroy();
    });
  }

  private async cleanup() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout);
      this.cleanupTimeout = null;
    }
    
    if (this.client) {
      const client = this.client;
      this.client = null;
      
      try {
        if (client.socket) {
          console.log('Cleaning up socket...');
          await this.waitForSocketClose(client.socket);
          console.log('Socket cleanup complete');
        }
        client.removeAllListeners();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
    
    this.connected = false;
    this.connecting = false;

    // Add a delay after cleanup to ensure all resources are released
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('Connected to SMPP server');
      this.connected = true;
      this.connecting = false;
    });

    this.client.on('close', () => {
      console.log('Connection to SMPP server closed');
      this.cleanup();
    });

    this.client.on('error', (error: any) => {
      console.error('SMPP error:', error);
      this.cleanup();
    });

    this.client.on('pdu', (pdu: any) => {
      console.log('Received PDU:', pdu);
    });
  }

  async connect() {
    try {
      // If already connecting, wait
      if (this.connecting) {
        console.log('Connection attempt already in progress, waiting...');
        return false;
      }

      // If already connected, disconnect first
      if (this.connected) {
        await this.disconnect();
      }

      // Ensure cleanup is complete before creating new session
      await this.cleanup();

      // Create fresh session
      await this.createNewSession();
      this.connecting = true;

      console.log(`Attempting to connect to SMPP server at ${smppConfig.host}:${smppConfig.port}`);
      
      // Connect with timeout
      await new Promise((resolve, reject) => {
        const connectOptions = {
          host: smppConfig.host,
          port: smppConfig.port,
          timeout: 10000
        };
        
        console.log('Connection options:', connectOptions);
        
        this.connectionTimeout = setTimeout(() => {
          if (this.client && this.client.socket) {
            console.log('Connection timeout, destroying socket...');
            this.client.socket.destroy();
          }
          reject(new Error('Connection timeout'));
        }, 10000);

        this.client.connect(connectOptions, (err: any) => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }

          if (err) {
            console.error('Connection error:', err);
            this.cleanup();
            reject(err);
          } else {
            console.log('TCP connection established');
            resolve(true);
          }
        });
      });

      // Add a delay before binding
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Bind to the server
      console.log('Attempting to bind to SMPP server...');
      await new Promise((resolve, reject) => {
        const bindOptions = {
          system_id: smppConfig.systemId,
          password: smppConfig.password,
          system_type: smppConfig.systemType,
          interface_version: smppConfig.interfaceVersion
        };
        
        console.log('Bind options:', bindOptions);
        
        this.client.bind_transceiver(bindOptions, (err: any) => {
          if (err) {
            console.error('Bind error:', err);
            this.cleanup();
            reject(err);
          } else {
            console.log('Successfully bound to SMPP server');
            resolve(true);
          }
        });
      });

      return true;
    } catch (error) {
      console.error('Failed to connect to SMPP server:', error);
      await this.cleanup();
      return false;
    }
  }

  async disconnect() {
    if (this.connected) {
      try {
        await this.client.unbind();
      } catch (error) {
        console.error('Error during unbind:', error);
      }
      await this.cleanup();
    }
  }

  async sendMessage(phoneNumber: string, message: string) {
    if (!this.connected) {
      throw new Error('Not connected to SMPP server');
    }

    try {
      const result = await this.client.submit({
        sourceAddr: smppConfig.sourceAddr,
        sourceAddrTon: smppConfig.sourceAddrTon,
        sourceAddrNpi: smppConfig.sourceAddrNpi,
        destAddr: phoneNumber,
        destAddrTon: smppConfig.destAddrTon,
        destAddrNpi: smppConfig.destAddrNpi,
        shortMessage: message,
        registeredDelivery: smppConfig.registeredDelivery,
        dataCoding: smppConfig.dataCoding,
      });

      console.log('Message sent successfully:', {
        messageId: result.messageId,
        phoneNumber,
        messageLength: message.length,
      });

      return result;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const smppService = new SMPPService();

export { smppService }; 