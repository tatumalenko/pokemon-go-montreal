#!/bin/bash
npm install
sudo cp professor-willow.service /etc/systemd/system/
sudo systemctl enable /etc/systemd/system/professor-willow.service
sudo systemctl enable professor-willow.service
sudo systemctl restart professor-willow.service