#!/bin/bash

# Configuration
SERVER="root@64.23.163.161"
REMOTE_DIR="/root/test/smpp/lib/smpp"
LOCAL_DIR="lib/smpp"

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deploying SMPP files to server...${NC}"

# Transfer files
scp -r $LOCAL_DIR/* $SERVER:$REMOTE_DIR/

echo -e "${GREEN}Deployment complete!${NC}" 