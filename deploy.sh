#!/bin/bash
## --------------------------------------------------------------------------------------------------------------------

# install any required packages
npm install

# set up Nginx
sudo cp etc/nginx/sites-available/cssminifier-com /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/cssminifier-com /etc/nginx/sites-enabled/
sudo service nginx reload

# set up the servers
sudo mkdir -p /var/log/cssminifier-com/
sudo chown ubuntu:ubuntu /var/log/cssminifier-com/

# add the upstart scripts
sudo cp etc/init/cssminifier-com-1.conf /etc/init/
sudo cp etc/init/cssminifier-com-2.conf /etc/init/

# restart the services, with a sleep in between
sudo service cssminifier-com-web-1 restart
sleep 10
sudo service cssminifier-com-web-2 restart

## --------------------------------------------------------------------------------------------------------------------
