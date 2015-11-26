#!/bin/bash
## ----------------------------------------------------------------------------

set -e

## ----------------------------------------------------------------------------
# Set these to your preferred values.

THIS_USER=`id -un`
THIS_GROUP=`id -gn`
THIS_PWD=`pwd`
THIS_NODE=`which node`
THIS_PATH=`dirname $THIS_NODE`

NAME=com-cssminifier
NAKED_DOMAIN=cssminifier.com
PORT=8011

## ----------------------------------------------------------------------------

# install any required packages
echo "Installing new npm packages ..."
npm update --production
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

# set up the server
echo "Setting up various directories ..."
sudo mkdir -p /var/log/$NAME/
sudo chown $THIS_USER:$THIS_GROUP /var/log/$NAME/
sudo mkdir -p /var/lib/$NAME/
sudo chown $THIS_USER:$THIS_GROUP /var/lib/$NAME/
echo

# set up the cron job
echo "Setting up the cron job ..."
sudo cp etc/cron.d/$NAME /etc/cron.d/
echo

# add the supervisor scripts
echo "Copying init script ..."
m4 \
    -D __USER__=$THIS_USER \
    -D  __PWD__=$THIS_PWD  \
    -D __NODE__=$THIS_NODE \
    -D __PATH__=$THIS_PATH \
    etc/init/$NAME.conf.m4 | sudo tee /etc/init/$NAME.conf
echo

# Allow port 8011 from the caddy server:
#
# - from <ip address>
# - to <any> - means to any interface on this machine
# - port <8011> - to port 8011
# - proto <tcp|udp|etc>
#
sudo ufw allow from 10.128.169.61 to 10.128.174.96 port 8011 proto tcp

# restart services
echo "Restarting services ..."
sudo com-cssminifier restart
echo

## --------------------------------------------------------------------------------------------------------------------
