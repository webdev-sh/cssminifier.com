#!/bin/bash
## ----------------------------------------------------------------------------

set -e

## ----------------------------------------------------------------------------
# Set these to your preferred values.

THIS_USER=`id -un`
THIS_GROUP=`id -gn`
THIS_PWD=`pwd`
THIS_NODE=`which node`

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

# set up Nginx
echo "Setting up Nginx ..."
FILE=/tmp/com-cssminifier
cat /dev/null > $FILE
nginx-generator \
    --name com-cssminifier \
    --domain cssminifier.com \
    --type proxy \
    --var host=localhost \
    --var port=8011 \
    - >> $FILE
nginx-generator \
    --name com-cssminifier-www \
    --domain www.cssminifier.com \
    --type redirect \
    --var to=cssminifier.com \
    - >> $FILE
nginx-generator \
    --name com-cssminifier-ww \
    --domain ww.cssminifier.com \
    --type redirect \
    --var to=cssminifier.com \
    - >> $FILE
nginx-generator \
    --name com-cssminifier-w \
    --domain w.cssminifier.com \
    --type redirect \
    --var to=cssminifier.com \
    - >> $FILE
sudo cp $FILE /etc/nginx/sites-enabled/
echo

# set up the server
echo "Setting up various directories ..."
sudo mkdir -p /var/log/com-cssminifier/
sudo chown $THIS_USER:$THIS_GROUP /var/log/com-cssminifier/
echo

# add the supervisor scripts
echo "Copying supervisor script ..."
m4 \
    -D __USER__=$THIS_USER \
    -D  __PWD__=$THIS_PWD  \
    -D __NODE__=$THIS_NODE \
    etc/supervisor/conf.d/com-cssminifier.conf.m4 | sudo tee /etc/supervisor/conf.d/com-cssminifier.conf
echo

# restart services
echo "Restarting services ..."
sudo supervisorctl reload
sudo service nginx restart
echo

## --------------------------------------------------------------------------------------------------------------------
