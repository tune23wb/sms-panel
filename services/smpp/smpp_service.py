#!/usr/bin/env python3
import logging
import sys
import time
import json
import argparse
from datetime import datetime
from typing import Optional, Tuple
import re
import threading
import requests

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
        self.message_id = None
        self.destination_number = None
        self.message_parts = 1
        self.logger = logging.getLogger('SMPPService')
        self.delivery_event = threading.Event()
        self.listening = False
        self.listener_thread = None
        self.api_base_url = "http://64.23.163.161:3000/api"  # Use actual server IP instead of localhost
        self.api_headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer smpp_internal_key'  # Internal API key for SMPP service
        }

    def connect(self) -> bool:
        """Establish connection to SMPP server"""
        try:
            self.logger.info(f"Connecting to SMPP server {self.host}:{self.port}")
            self.client = smpplib.client.Client(self.host, self.port)
            
            # Set connection timeout
            self.client.timeout = 30  # Increased timeout

            # Configure event handlers
            self.client.set_message_sent_handler(self.handle_message_sent)
            self.client.set_message_received_handler(self.handle_message_received)
            
            # Connect and bind
            self.client.connect()
            self.logger.info("Connected to SMPP server, binding...")
            
            # Bind as transceiver (to send and receive)
            self.client.bind_transceiver(
                system_id=self.username,
                password=self.password,
                system_type='',
                interface_version=smpplib.consts.SMPP_VERSION_34
            )
            self.logger.info("Successfully bound to SMPP server as transceiver")
            return True
        except Exception as e:
            self.logger.error(f"Failed to connect to SMPP server: {str(e)}")
            return False

    def start_listener(self):
        """Start a background thread to listen for SMPP responses"""
        self.listening = True
        self.listener_thread = threading.Thread(target=self._listener_loop)
        self.listener_thread.daemon = True
        self.listener_thread.start()
        self.logger.info("Started background listener for SMPP responses")

    def _listener_loop(self):
        """Background loop to continuously listen for SMPP responses"""
        while self.listening and self.client:
            try:
                self.client.listen(0.5)
            except Exception as e:
                self.logger.error(f"Error in listener loop: {str(e)}")
                time.sleep(0.1)

    def stop_listener(self):
        """Stop the background listener thread"""
        self.listening = False
        if self.listener_thread:
            self.listener_thread.join(timeout=2)
            self.listener_thread = None
        self.logger.info("Stopped background listener")

    def handle_message_sent(self, pdu):
        """Handle message sent confirmation"""
        self.logger.info(f"Message sent PDU: {pdu}")
        if pdu.command == "submit_sm_resp":
            self.message_id = str(pdu.message_id)
            self.logger.info(f"Message submitted successfully with ID: {self.message_id}")
            self.message_status = "SENT"
            
            # Calculate message cost
            message_cost = self.calculate_message_cost()
            
            # Update balance when message is sent
            success, balance_result = self.update_balance(
                message_id=self.message_id,
                status="SENT",
                phone_number=self.destination_number,
                message_cost=message_cost
            )
            
            result = {
                "status": "SENT",
                "message_id": self.message_id,
                "balance_updated": success,
                "message_cost": message_cost
            }
            if success and "new_balance" in balance_result:
                result["new_balance"] = balance_result["new_balance"]
                
            print(json.dumps(result))
            sys.stdout.flush()

    def extract_message_id_from_pdu(self, pdu):
        """Extract message ID from various PDU formats"""
        message_id = None
        if hasattr(pdu, 'receipted_message_id'):
            message_id = str(pdu.receipted_message_id)
        elif hasattr(pdu, 'short_message'):
            short_message = str(pdu.short_message)
            id_match = re.search(r'id:([^ ]+)', short_message)
            if id_match:
                message_id = id_match.group(1)
        return message_id

    def handle_message_received(self, pdu):
        """Handle incoming messages and delivery receipts"""
        self.logger.info(f"Message received PDU: {pdu}")
        if pdu.command == "deliver_sm":
            # Check if this is a delivery receipt
            if hasattr(pdu, 'receipted_message_id') or (hasattr(pdu, 'short_message') and 'id:' in str(pdu.short_message)):
                # Extract message ID
                message_id = self.extract_message_id_from_pdu(pdu)
                    
                # Look for status in the message
                status = "UNKNOWN"
                if hasattr(pdu, 'short_message'):
                    short_message = str(pdu.short_message)
                    status_match = re.search(r'stat:([^ ]+)', short_message)
                    if status_match:
                        status = status_match.group(1)
                
                # If status indicates delivery, update our status
                if status.upper() in ["DELIVRD", "DELIVERED"]:
                    self.message_status = "DELIVERED"
                
                if message_id and message_id == self.message_id:
                    self.logger.info(f"Delivery receipt received for message {message_id}")
                    self.message_status = "DELIVERED"
                    
                    # Update status without charging again
                    success, balance_result = self.update_balance(
                        message_id=message_id,
                        status="DELIVERED",
                        phone_number=self.destination_number,
                        message_cost=0  # No additional charge, just update status
                    )
                    
                    result = {
                        "status": "DELIVERED",
                        "message_id": message_id,
                        "balance_updated": success
                    }
                    print(json.dumps(result))
                    sys.stdout.flush()
                    self.delivery_event.set()  # Signal that delivery receipt received
                
                # Always acknowledge receipt
                self.client.send_pdu('deliver_sm_resp', sequence=pdu.sequence)

    def update_balance(self, message_id, status, phone_number, message_cost=1.0):
        """
        Update client balance when a message changes status
        """
        try:
            api_url = f"{self.api_base_url}/update-balance"
            self.logger.info(f"Attempting to update balance at: {api_url}")
            self.logger.info(f"Payload: message_id={message_id}, status={status}, cost={message_cost}")
            self.logger.info(f"Using API headers: {self.api_headers}")
            
            # Make an API call to update balance and message status
            response = requests.post(
                api_url,
                headers=self.api_headers,
                json={
                    "message_id": message_id,
                    "status": status,
                    "phone_number": phone_number,
                    "message_cost": message_cost
                },
                timeout=5  # 5 second timeout
            )
            
            self.logger.info(f"API Response Status: {response.status_code}")
            self.logger.info(f"API Response Headers: {response.headers}")
            self.logger.info(f"API Response Body: {response.text}")
            
            if response.ok:
                result = response.json()
                self.logger.info(f"Successfully updated balance for message {message_id} with cost {message_cost}")
                self.logger.info(f"New balance: {result.get('new_balance')}")
                return True, result
            else:
                error_msg = f"Failed to update balance: {response.text}"
                self.logger.error(error_msg)
                return False, {"error": error_msg}
                
        except Exception as e:
            error_msg = f"Error updating balance: {str(e)}"
            self.logger.error(error_msg)
            self.logger.exception("Full error traceback:")
            return False, {"error": error_msg}
    
    def calculate_message_cost(self):
        """
        Calculate message cost based on length and other factors
        """
        try:
            # Get user's pricing tier from the API
            response = requests.get(
                f"{self.api_base_url}/user/pricing-tier",
                headers=self.api_headers,
                timeout=5
            )
            
            if response.ok:
                pricing_data = response.json()
                base_price = pricing_data.get('pricePerSMS', 0.70)  # Default to standard tier price
            else:
                self.logger.error(f"Failed to get pricing tier: {response.text}")
                base_price = 0.70  # Fallback to standard tier price
        except Exception as e:
            self.logger.error(f"Error getting pricing tier: {str(e)}")
            base_price = 0.70  # Fallback to standard tier price
        
        # Add additional charge for long messages
        if self.message_parts > 1:
            return base_price * self.message_parts
        
        return base_price

    def send_message(self, 
                    destination: str, 
                    message: str, 
                    source_addr: str = "82833",
                    registered_delivery: bool = True,
                    wait_for_delivery: bool = True,
                    delivery_timeout: int = 15) -> Tuple[bool, str]:
        """
        Send an SMS message through SMPP connection
        
        Parameters:
        - destination: Destination phone number
        - message: Message content
        - source_addr: Sender ID
        - registered_delivery: Whether to request delivery receipt
        - wait_for_delivery: Whether to wait for delivery confirmation
        - delivery_timeout: How long to wait for delivery in seconds
        """
        if not self.client:
            error_msg = "Not connected to SMPP server"
            self.logger.error(error_msg)
            return False, json.dumps({
                "status": "FAILED",
                "error": error_msg
            })

        try:
            # Reset status for new message
            self.message_status = "PENDING"
            self.message_id = None
            self.delivery_event.clear()
            
            # Start the listener thread if not already running
            if not self.listening:
                self.start_listener()
            
            # Format the destination number
            destination = format_phone_number(destination)
            self.destination_number = destination  # Store for use in handlers
            self.logger.info(f"Sending message to formatted number: {destination}")

            # Encode the message
            parts, encoding_flag, msg_type_flag = smpplib.gsm.make_parts(message)
            self.message_parts = len(parts)  # Store for cost calculation
            
            for part in parts:
                pdu = self.client.send_message(
                    source_addr_ton=smpplib.consts.SMPP_TON_ALNUM,
                    source_addr_npi=smpplib.consts.SMPP_NPI_UNK,
                    source_addr=source_addr,
                    dest_addr_ton=smpplib.consts.SMPP_TON_INTL,
                    dest_addr_npi=smpplib.consts.SMPP_NPI_ISDN,
                    destination_addr=destination,
                    data_coding=encoding_flag,
                    esm_class=msg_type_flag,
                    short_message=part,
                    registered_delivery=1 if registered_delivery else 0,
                )
                self.logger.debug(f"Sent PDU: {pdu}")
            
            # Wait for delivery if requested
            if wait_for_delivery and registered_delivery:
                self.logger.info(f"Waiting up to {delivery_timeout} seconds for delivery confirmation...")
                delivery_received = self.delivery_event.wait(timeout=delivery_timeout)
                
                if not delivery_received:
                    self.logger.warning("Delivery timeout: No delivery receipt received within the timeout period")
            
            # Return final status
            result = {
                "status": self.message_status,
                "message_id": self.message_id,
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
        # Stop the listener thread first
        self.stop_listener()
        
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
    args = parser.parse_args()

    # SMPP server configuration
    SMPP_HOST = "114.199.74.35"
    SMPP_PORT = 2775
    SMPP_USERNAME = "XQB0213MKT"
    SMPP_PASSWORD = "fS5cgh26"
    
    # Create and start SMPP service
    service = SMPPService(SMPP_HOST, SMPP_PORT, SMPP_USERNAME, SMPP_PASSWORD)
    
    if service.connect():
        service.start_listener()
        
        try:
            # Send the message
            success, result = service.send_message(
                destination=args.destination,
                message=args.message
            )
            
            if success:
                print(result)
            else:
                print(f"Failed to send message: {result}")
                sys.exit(1)
                
            # Wait a bit for delivery report
            time.sleep(5)
            
            service.stop_listener()
            service.disconnect()
        except KeyboardInterrupt:
            service.stop_listener()
            service.disconnect()
    else:
        sys.exit(1)

if __name__ == "__main__":
    main() 
