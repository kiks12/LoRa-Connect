#!/bin/bash

echo "Starting LoRa-Connect Web App..."
cd ./web
npm run start &
sleep 10

echo "Starting Python Script..."
cd ../python-scripts
source venv/bin/activate
python main.py &

echo "All processes started successfully"

