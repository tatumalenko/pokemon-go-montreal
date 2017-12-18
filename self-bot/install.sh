#!/bin/bash
npm install
sudo cp self.service /etc/systemd/system/
sudo systemctl enable /etc/systemd/system/self.service
sudo systemctl enable self.service
sudo systemctl restart self.service