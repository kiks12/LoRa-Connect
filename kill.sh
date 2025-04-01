#!/bin/bash

echo "Stopping any existing processes..."

fuser -k 3000/tcp
pkill -f "python main.py"

sleep 5

echo "All processess killed."

