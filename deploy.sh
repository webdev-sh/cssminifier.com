#!/bin/bash
## --------------------------------------------------------------------------------------------------------------------

set -e

# install any required packages
echo "Fetching new code ..."
git fetch
git rebase origin/master
echo

# install any required packages
echo "Installing new npm packages ..."
npm install
echo

# minimising assets
# ToDo: js-min.pl public/s/js/ready.js > public/s/js/ready.min.js
# ToDo: curl -X POST -s --data-urlencode 'input@public/s/css/style.css' http://cssminifier.com/raw > public/s/css/style.min.css

# set up Nginx
echo "Setting up Nginx ..."
sudo cp etc/nginx/sites-available/cssminifier-com /etc/nginx/sites-available/
if [ ! -h /etc/nginx/sites-enabled/cssminifier-com ]; then
    sudo ln -s /etc/nginx/sites-available/cssminifier-com /etc/nginx/sites-enabled/
fi
sudo service nginx reload
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
