#!/usr/bin/env python3
import requests
import json

def test_sms_api():
    # API endpoint
    url = "http://localhost:3000/api/sms"  # Adjust the port if needed
    
    # Test data
    data = {
        "destination": "523317953591",
        "message": "Test message from API",
        "source_addr": "TestSMPP"
    }
    
    try:
        # Make the POST request
        response = requests.post(url, json=data)
        
        # Print the response
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_sms_api() 