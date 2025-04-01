#!/bin/bash

echo "Stopping any existing processes..."

fuser -k 8989/tcp
fuser -k 3000/tcp
pkill -f "python main.py"

sleep 5

echo "Starting Graphhopper..."
cd graphhopper
./server.bash &
sleep 15

echo "Starting LoRa-Connect Web App..."
cd ../web
npm run start &
sleep 10

echo "Starting Python Script..."
cd ../python-scripts
source venv/bin/activate
python main.py &

echo "All processes started successfully"

