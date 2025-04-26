#!/usr/bin/env python3
import logging
import sys
import time
import json
import argparse
from datetime import datetime
from typing import Optional, Tuple

import smpplib.gsm
import smpplib.client
import smpplib.consts

# Set up logging
logging.basicConfig(level=logging.DEBUG)

class SMPPService:
    def __init__(self, host: str, port: int, username: str, password: str):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.client = None
        self.message_status = "PENDING"

    def connect(self) -> bool:
        """Establish connection to SMPP server"""
        try:
            self.client = smpplib.client.Client(self.host, self.port)
            self.client.set_message_sent_handler(self.handle_message_sent)
            self.client.set_message_received_handler(self.handle_message_received)
            self.client.connect()
            self.client.bind_transceiver(system_id=self.username, password=self.password)
            logging.info("SMPP connection established successfully")
            return True
        except Exception as e:
            logging.error(f"Failed to connect to SMPP server: {e}")
            return False

    def handle_message_sent(self, pdu):
        """Handle message sent confirmation"""
        logging.info(f"Message sent PDU: {pdu}")
        if pdu.command == "submit_sm_resp":
            logging.info(f"Message submitted successfully with ID: {pdu.message_id}")
            self.message_status = "SENT"
            print(json.dumps({"status": "SENT", "message_id": str(pdu.message_id)}))

    def handle_message_received(self, pdu):
        """Handle incoming messages and delivery receipts"""
        logging.info(f"Message received PDU: {pdu}")
        if pdu.command == "deliver_sm":
            # Check if this is a delivery receipt
            if hasattr(pdu, 'receipted_message_id'):
                logging.info(f"Delivery receipt received for message {pdu.receipted_message_id}")
                self.message_status = "DELIVERED"
                print(json.dumps({
                    "status": "DELIVERED",
                    "message_id": str(pdu.receipted_message_id)
                }))

    def send_message(self, 
                    destination: str, 
                    message: str, 
                    source_addr: str = "TestSMPP",
                    registered_delivery: bool = True) -> Tuple[bool, str]:
        """
        Send an SMS message through SMPP connection
        
        Args:
            destination: Destination phone number
            message: Message content
            source_addr: Sender ID
            registered_delivery: Whether to request delivery receipt
            
        Returns:
            Tuple of (success: bool, error_message: str)
        """
        if not self.client:
            return False, json.dumps({"status": "FAILED", "error": "Not connected to SMPP server"})

        try:
            # Encode the message
            parts, encoding_flag, msg_type_flag = smpplib.gsm.make_parts(message)
            
            for part in parts:
                pdu = self.client.send_message(
                    source_addr_ton=smpplib.consts.SMPP_TON_NWSPEC,
                    source_addr_npi=smpplib.consts.SMPP_NPI_ISDN,
                    source_addr=source_addr,
                    dest_addr_ton=smpplib.consts.SMPP_TON_INTL,
                    dest_addr_npi=smpplib.consts.SMPP_NPI_ISDN,
                    destination_addr=destination,
                    data_coding=encoding_flag,
                    esm_class=msg_type_flag,
                    short_message=part,
                    registered_delivery=registered_delivery,
                )
                logging.debug(f"Sent PDU: {pdu}")
                
                # Wait for delivery receipt if requested
                if registered_delivery:
                    time.sleep(2)  # Give some time for the receipt to arrive
                    self.client.listen(1)  # Listen for 1 second for any incoming PDUs
            
            # Return final status
            return True, json.dumps({
                "status": self.message_status,
                "message": "Message processed successfully"
            })
        except Exception as e:
            error_msg = f"Failed to send message: {e}"
            logging.error(error_msg)
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
                logging.info("SMPP connection closed successfully")
            except Exception as e:
                logging.error(f"Error while disconnecting: {e}")

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Send SMS via SMPP')
    parser.add_argument('--destination', required=True, help='Destination phone number')
    parser.add_argument('--message', required=True, help='Message content')
    parser.add_argument('--source', default='TestSMPP', help='Sender ID')
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
            sys.exit(0 if success else 1)
    finally:
        # Always disconnect
        smpp_service.disconnect()

if __name__ == "__main__":
    main() 