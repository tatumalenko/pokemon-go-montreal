#!/bin/bash
sudo cp go-news-webhook.service /etc/systemd/system/
sudo systemctl enable /etc/systemd/system/go-news-webhook.service
sudo systemctl enable go-news-webhook.service
sudo systemctl restart go-news-webhook.service
