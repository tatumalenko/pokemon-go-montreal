#!/bin/bash
npm install
sudo cp slowpoke.service /etc/systemd/system/
sudo systemctl enable /etc/systemd/system/slowpoke.service
sudo systemctl enable slowpoke.service
sudo systemctl restart slowpoke.service