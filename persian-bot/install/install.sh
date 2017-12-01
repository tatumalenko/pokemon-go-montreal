#!/bin/bash
npm install
sudo cp persian.service /etc/systemd/system/
sudo systemctl enable /etc/systemd/system/persian.service
sudo systemctl enable persian.service
sudo systemctl restart persian.service