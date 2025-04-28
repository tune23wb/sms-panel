#!/usr/bin/env python3
import logging
import sys
import time
import json
import argparse
from datetime import datetime
from typing import Optional, Tuple
import re

import smpplib.gsm
import smpplib.client
import smpplib.consts

# Set up logging with more details
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('smpp_service.log')
    ]
)

def format_phone_number(phone: str) -> str:
    """Format phone number to international format without + prefix"""
    # Remove any non-digit characters
    phone = re.sub(r'\D', '', phone)
    
    # If number starts with 0, remove it and add country code
    if phone.startswith('0'):
        phone = '52' + phone[1:]
    # If number doesn't start with country code, add it
    elif not phone.startswith('52'):
        phone = '52' + phone
        
    return phone

class SMPPService:
    def __init__(self, host: str, port: int, username: str, password: str):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.client = None
        self.message_status = "PENDING"
        self.logger = logging.getLogger('SMPPService')

    def connect(self) -> bool:
        """Establish connection to SMPP server"""
        try:
            self.logger.info(f"Connecting to SMPP server {self.host}:{self.port}")
            self.client = smpplib.client.Client(self.host, self.port)
            
            # Set connection timeout
            self.client.timeout = 10

            # Configure event handlers
            self.client.set_message_sent_handler(self.handle_message_sent)
            self.client.set_message_received_handler(self.handle_message_received)
            
            # Connect and bind
            self.client.connect()
            self.logger.info("Connected to SMPP server, binding...")
            
            self.client.bind_transceiver(
                system_id=self.username,
                password=self.password,
                system_type='',
                interface_version=0x34
            )
            self.logger.info("Successfully bound to SMPP server")
            return True
        except Exception as e:
            self.logger.error(f"Failed to connect to SMPP server: {str(e)}")
            return False

    def handle_message_sent(self, pdu):
        """Handle message sent confirmation"""
        self.logger.info(f"Message sent PDU: {pdu}")
        if pdu.command == "submit_sm_resp":
            self.logger.info(f"Message submitted successfully with ID: {pdu.message_id}")
            self.message_status = "SENT"
            result = {
                "status": "SENT",
                "message_id": str(pdu.message_id)
            }
            print(json.dumps(result))
            sys.stdout.flush()  # Ensure output is sent immediately

    def handle_message_received(self, pdu):
        """Handle incoming messages and delivery receipts"""
        self.logger.info(f"Message received PDU: {pdu}")
        if pdu.command == "deliver_sm":
            # Check if this is a delivery receipt
            if hasattr(pdu, 'receipted_message_id'):
                self.logger.info(f"Delivery receipt received for message {pdu.receipted_message_id}")
                self.message_status = "DELIVERED"
                result = {
                    "status": "DELIVERED",
                    "message_id": str(pdu.receipted_message_id)
                }
                print(json.dumps(result))
                sys.stdout.flush()  # Ensure output is sent immediately

    def send_message(self, 
                    destination: str, 
                    message: str, 
                    source_addr: str = "45578",
                    registered_delivery: bool = True) -> Tuple[bool, str]:
        """Send an SMS message through SMPP connection"""
        if not self.client:
            error_msg = "Not connected to SMPP server"
            self.logger.error(error_msg)
            return False, json.dumps({
                "status": "FAILED",
                "error": error_msg
            })

        try:
            # Format the destination number
            destination = format_phone_number(destination)
            self.logger.info(f"Sending message to formatted number: {destination}")

            # Encode the message
            parts, encoding_flag, msg_type_flag = smpplib.gsm.make_parts(message)
            
            for part in parts:
                pdu = self.client.send_message(
                    source_addr_ton=smpplib.consts.SMPP_TON_ALPHANUMERIC,
                    source_addr_npi=smpplib.consts.SMPP_NPI_UNKNOWN,
                    source_addr=source_addr,
                    dest_addr_ton=smpplib.consts.SMPP_TON_INTL,
                    dest_addr_npi=smpplib.consts.SMPP_NPI_ISDN,
                    destination_addr=destination,
                    data_coding=encoding_flag,
                    esm_class=msg_type_flag,
                    short_message=part,
                    registered_delivery=1 if registered_delivery else 0,
                    priority_flag=1,  # High priority
                    protocol_id=0,
                    replace_if_present_flag=0,
                    sm_default_msg_id=0,
                    validity_period=None,  # Use default validity period
                )
                self.logger.debug(f"Sent PDU: {pdu}")
                
                # Wait for delivery receipt if requested
                if registered_delivery:
                    self.logger.info("Waiting for delivery receipt...")
                    time.sleep(2)  # Give some time for the receipt to arrive
                    self.client.listen(1)  # Listen for 1 second for any incoming PDUs
            
            # Return final status
            result = {
                "status": self.message_status,
                "message": "Message processed successfully"
            }
            self.logger.info(f"Final message status: {self.message_status}")
            return True, json.dumps(result)
        except Exception as e:
            error_msg = f"Failed to send message: {str(e)}"
            self.logger.error(error_msg)
            return False, json.dumps({
                "status": "FAILED",
                "error": error_msg
            })

    def disconnect(self):
        """Safely disconnect from SMPP server"""
        if self.client:
            try:
                if hasattr(self.client, 'state') and self.client.state in ('BOUND_TX', 'BOUND_RX', 'BOUND_TRX'):
                    self.client.unbind()
                self.client.disconnect()
                self.logger.info("SMPP connection closed successfully")
            except Exception as e:
                self.logger.error(f"Error while disconnecting: {str(e)}")

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Send SMS via SMPP')
    parser.add_argument('--destination', required=True, help='Destination phone number')
    parser.add_argument('--message', required=True, help='Message content')
    parser.add_argument('--source', default='45578', help='Sender ID')
    args = parser.parse_args()

    # SMPP server settings
    SMPP_HOST = "114.199.74.35"
    SMPP_PORT = 2775
    SMPP_USERNAME = "XQB0213MKT"
    SMPP_PASSWORD = "fS5cgh26"

    # Create service instance
    smpp_service = SMPPService(SMPP_HOST, SMPP_PORT, SMPP_USERNAME, SMPP_PASSWORD)
    
    try:
        # Connect to server
        if smpp_service.connect():
            # Send message
            success, message = smpp_service.send_message(
                destination=args.destination,
                message=args.message,
                source_addr=args.source,
                registered_delivery=True  # Always request delivery receipt
            )
            print(message)  # This will be captured by the Node.js process
            sys.stdout.flush()  # Ensure output is sent immediately
            sys.exit(0 if success else 1)
        else:
            print(json.dumps({
                "status": "FAILED",
                "error": "Failed to connect to SMPP server"
            }))
            sys.stdout.flush()
            sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "status": "FAILED",
            "error": str(e)
        }))
        sys.stdout.flush()
        sys.exit(1)
    finally:
        # Always disconnect
        smpp_service.disconnect()

if __name__ == "__main__":
    main() 