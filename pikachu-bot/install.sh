#!/bin/bash
npm install
sudo cp pikachu.service /etc/systemd/system/
sudo systemctl enable /etc/systemd/system/pikachu.service
sudo systemctl enable pikachu.service
sudo systemctl restart pikachu.service