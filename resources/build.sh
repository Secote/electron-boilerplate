#!/bin/bash

docker system prune -f
# Step 1: Build the Python application for fiftyone
echo "Building Python application..."
sudo apt-get install build-essential
sudo npm install -g yarn
cd fiftyone
make python

# Step 2: Build Docker Compose services
echo "Building Docker Compose services..."
cd ..
docker-compose -f docker-compose.build.yml build
# docker-compose -f docker-compose.build.yml build --build-arg AREA=US

echo "Build process completed."
