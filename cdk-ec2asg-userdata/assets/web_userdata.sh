#!/bin/bash

sudo yum -y update
# Install httpd:
sudo yum -y install httpd
sudo sed -i 's/Listen 80/Listen 3000/' /etc/httpd/conf/httpd.conf
sudo service httpd reload
sudo service httpd start
