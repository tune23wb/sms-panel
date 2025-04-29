#!/usr/bin/env python3
from flask import Flask, request, jsonify
import os
from smpp_service import SMPPService
import logging

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('smpp_service.log')
    ]
)

app = Flask(__name__)
logger = logging.getLogger('SMPPHTTPService')

# Initialize SMPP service
smpp_service = SMPPService(
    host=os.getenv('SMPP_HOST', '114.199.74.35'),
    port=int(os.getenv('SMPP_PORT', '2775')),
    username=os.getenv('SMPP_SYSTEM_ID', 'XQB0213MKT'),
    password=os.getenv('SMPP_PASSWORD', 'fS5cgh26')
)

@app.route('/send', methods=['POST'])
def send_message():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        destination = data.get('destination')
        message = data.get('message')
        source_addr = data.get('source_addr', '45578')
        
        if not destination or not message:
            return jsonify({'error': 'Destination and message are required'}), 400
            
        # Connect to SMPP server if not connected
        if not smpp_service.client:
            if not smpp_service.connect():
                return jsonify({'error': 'Failed to connect to SMPP server'}), 500
            smpp_service.start_listener()
            
        # Send message
        success, result = smpp_service.send_message(
            destination=destination,
            message=message,
            source_addr=source_addr
        )
        
        if success:
            return jsonify({
                'success': True,
                'message_id': smpp_service.message_id,
                'status': 'SENT'
            })
        else:
            return jsonify({
                'success': False,
                'error': result
            }), 500
            
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3001))
    app.run(host='0.0.0.0', port=port) 