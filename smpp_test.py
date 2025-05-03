#!/usr/bin/env python3
import logging
import sys
import time
from datetime import datetime

import smpplib.gsm
import smpplib.client
import smpplib.consts

# Set up logging
logging.basicConfig(level=logging.INFO)

# SMPP server settings
SMPP_HOST = "43.249.30.190"
SMPP_PORT = 20002
SMPP_USERNAME = "0159-C0082"
SMPP_PASSWORD = "4DA88FD7"

# Test settings
TEST_SOURCE_ADDR = "TestSMPP"  # This will be displayed as the sender
TEST_DEST_ADDR = "523317953591"  # The test recipient number

def setup_client():
    """Create and configure the SMPP client"""
    client = smpplib.client.Client(SMPP_HOST, SMPP_PORT)
    
    # Optional: Set timeouts if needed
    client.set_message_sent_handler(lambda pdu: logging.info(f"Message sent: {pdu}"))
    client.set_message_received_handler(lambda pdu: logging.info(f"Message received: {pdu}"))
    
    return client

def send_test_message(client):
    """Send a test SMS message through the SMPP connection"""
    if not TEST_DEST_ADDR:
        logging.error("Please set a destination phone number in TEST_DEST_ADDR variable")
        return False
    
    # Encode the message
    parts, encoding_flag, msg_type_flag = smpplib.gsm.make_parts(
        f"SMPP Test Message from {TEST_SOURCE_ADDR} at {datetime.now()}"
    )
    
    logging.info(f"Sending test message to {TEST_DEST_ADDR}")
    
    for part in parts:
        client.send_message(
            source_addr_ton=smpplib.consts.SMPP_TON_ALNUM,
            source_addr_npi=smpplib.consts.SMPP_NPI_ISDN,  # Changed from SMPP_NPI_UNKNOWN to SMPP_NPI_ISDN
            source_addr=TEST_SOURCE_ADDR,
            dest_addr_ton=smpplib.consts.SMPP_TON_INTL,
            dest_addr_npi=smpplib.consts.SMPP_NPI_ISDN,
            destination_addr=TEST_DEST_ADDR,
            data_coding=encoding_flag,
            esm_class=msg_type_flag,
            short_message=part,
            registered_delivery=True,  # Request delivery receipt
        )
    return True

def main():
    """Main function to test SMPP connection"""
    logging.info("Starting SMPP connection test")
    
    client = setup_client()
    
    try:
        # Connect and bind to the SMPP server
        logging.info(f"Connecting to {SMPP_HOST}:{SMPP_PORT}")
        client.connect()
        
        logging.info(f"Binding as transmitter with username: {SMPP_USERNAME}")
        client.bind_transmitter(system_id=SMPP_USERNAME, password=SMPP_PASSWORD)
        
        logging.info("Connection established successfully!")
        
        # Send a test message
        if TEST_DEST_ADDR:
            if send_test_message(client):
                logging.info("Test message sent successfully")
        else:
            logging.info("No destination number provided, skipping test message")
        
        # Listen for any incoming PDUs (like delivery receipts)
        client.listen(0.5)  # Listen for 0.5 seconds
        
        # Keep connection open for a moment
        logging.info("Waiting for server responses...")
        time.sleep(5)
        
    except smpplib.exceptions.ConnectionError as e:
        logging.error(f"Connection error: {e}")
        return False
    except smpplib.exceptions.PDUError as e:
        logging.error(f"PDU error: {e}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return False
    finally:
        # Unbind and disconnect
        logging.info("Unbinding and disconnecting")
        if hasattr(client, 'state') and client.state in ('BOUND_TX', 'BOUND_RX', 'BOUND_TRX'):
            client.unbind()
        client.disconnect()
        logging.info("Test completed")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 