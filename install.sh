#!/bin/bash
## --------------------------------------------------------------------------------------------------------------------

set -e

## --------------------------------------------------------------------------------------------------------------------

# install any required packages
echo "Installing new npm packages ..."
npm install
echo

# minimising assets
echo "Minimising assets ..."
curl        \
    -X POST \
    -s      \
    --data-urlencode 'input@public/s/js/ready.js' \
    http://javascript-minifier.com/raw > public/s/js/ready.min.js
curl        \
    -X POST \
    -s      \
    --data-urlencode 'input@public/s/css/style.css' \
    http://cssminifier.com/raw > public/s/css/style.min.css
echo

# set up Proximity
echo "Setting up Proximity ..."
sudo cp etc/proximity.d/cssminifier-com /etc/proximity.d/
echo

# set up the servers
echo "Setting up various directories ..."
sudo mkdir -p /var/log/cssminifier-com/
sudo chown ubuntu:ubuntu /var/log/cssminifier-com/
echo

# add the upstart scripts
echo "Copying upstart scripts ..."
sudo cp etc/init/cssminifier-com-1.conf /etc/init/
sudo cp etc/init/cssminifier-com-2.conf /etc/init/
echo

# restart the services, with a sleep in between
echo "Restarting services ..."
sudo service cssminifier-com-1 restart
sleep 10
sudo service cssminifier-com-2 restart
echo

## --------------------------------------------------------------------------------------------------------------------
