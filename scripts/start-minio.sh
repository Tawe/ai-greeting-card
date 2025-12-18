#!/bin/bash

# Start MinIO server
# This script starts MinIO on localhost:9000 with console on localhost:9001

echo "Starting MinIO server..."
echo "Access Key: minioadmin"
echo "Secret Key: minioadmin"
echo ""
echo "MinIO API: http://localhost:9000"
echo "MinIO Console: http://localhost:9001"
echo ""
echo "Press Ctrl+C to stop MinIO"
echo ""

# Create data directory if it doesn't exist
mkdir -p ~/minio-data

# Start MinIO
minio server ~/minio-data \
  --address ":9000" \
  --console-address ":9001"
