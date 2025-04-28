#!/usr/bin/env python3
import logging
from smpp_service import SMPPService
from datetime import datetime
import time
import smpplib.client
import smpplib.consts

# Set up detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def test_sms():
    # SMPP server settings
    SMPP_HOST = "114.199.74.35"
    SMPP_PORT = 2775
    SMPP_USERNAME = "XQB0213MKT"
    SMPP_PASSWORD = "fS5cgh26"

    # Test message details
    TEST_NUMBER = "523317953591"  # Correct format without + prefix
    TEST_MESSAGE = "Hello, this is a test SMS"  # Simple test message
    
    logging.info(f"Connecting to SMPP server at {SMPP_HOST}:{SMPP_PORT}")
    
    # Create service instance
    smpp_service = SMPPService(SMPP_HOST, SMPP_PORT, SMPP_USERNAME, SMPP_PASSWORD)
    
    try:
        # Connect to server
        if smpp_service.connect():
            logging.info("Successfully connected to SMPP server")
            
            # Send message
            logging.info(f"Attempting to send message to {TEST_NUMBER}")
            success, message = smpp_service.send_message(
                destination=TEST_NUMBER,
                message=TEST_MESSAGE,
                source_addr="45578",
                registered_delivery=True  # Enable delivery receipt
            )
            
            if success:
                logging.info(f"Success: {message}")
                logging.info("Waiting for delivery receipt...")
                time.sleep(10)  # Wait for delivery receipt
            else:
                logging.error(f"Failed: {message}")
        else:
            logging.error("Failed to connect to SMPP server")
    except Exception as e:
        logging.error(f"Error during test: {e}")
    finally:
        # Always disconnect
        smpp_service.disconnect()
        logging.info("Test completed")

if __name__ == "__main__":
    test_sms() 