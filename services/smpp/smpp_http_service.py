#!/usr/bin/env python3
from flask import Flask, request, jsonify
import os
from smpp_service import SMPPService
import logging
from logging.handlers import RotatingFileHandler

# Set up logging with rotation
log_file = 'smpp_service.log'
max_bytes = 10 * 1024 * 1024  # 10MB
backup_count = 5

logging.basicConfig(
    level=logging.INFO,  # Changed to INFO for production
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        RotatingFileHandler(log_file, maxBytes=max_bytes, backupCount=backup_count)
    ]
)

app = Flask(__name__)
logger = logging.getLogger('SMPPHTTPService')

# Initialize SMPP service
smpp_service = SMPPService(
    host=os.getenv('SMPP_HOST', '43.249.30.190'),
    port=int(os.getenv('SMPP_PORT', '20002')),
    username=os.getenv('SMPP_SYSTEM_ID', '0159-C0082'),
    password=os.getenv('SMPP_PASSWORD', '4DA88FD7')
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
    # For development only - in production, use gunicorn
    port = int(os.getenv('PORT', 3001))
    app.run(host='127.0.0.1', port=port, debug=False)  # Only bind to localhost in development 