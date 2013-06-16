#!/bin/bash
## --------------------------------------------------------------------------------------------------------------------

set -e

## ----------------------------------------------------------------------------
# Set these to your preferred values.

THIS_USER=`id -un`
THIS_GROUP=`id -gn`
THIS_PWD=`pwd`
THIS_NODE=`which node`

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

# set up the server
echo "Setting up various directories ..."
sudo mkdir -p /var/log/cssminifier-com/
sudo chown $THIS_USER:$THIS_GROUP /var/log/cssminifier-com/
echo

# add the upstart scripts
echo "Copying upstart script ..."
m4 \
    -D __USER__=$THIS_USER \
    -D __NODE__=$THIS_NODE \
    -D  __PWD__=$THIS_PWD   \
    -D __NODE__=$THIS_NODE \
    etc/init/cssminifier-com.conf.m4 | sudo tee /etc/init/cssminifier-com.conf
echo

# restart the services, with a sleep in between
echo "Restarting services ..."
sudo service cssminifier-com-1 restart
sleep 10
sudo service cssminifier-com-2 restart
echo

## --------------------------------------------------------------------------------------------------------------------
