#!/bin/bash
## ----------------------------------------------------------------------------

# stopping the service
echo "Stopping services ..."
sudo service cssminifier-com stop
echo

# remove upstart script
echo "Removing upstart script ..."
sudo rm -f /etc/init/cssminifier-com.conf
echo

# remove log dirs
echo "Removing log dirs ..."
sudo rm -rf /var/log/cssminifier-com/
echo

# remove proximity conf
echo "Removing proximity config ..."
sudo rm /etc/proximity.d/cssminifier-com
echo

# finally, remove itself
rm -rf /home/chilts/src/appsattic-cssminifier-com

## ----------------------------------------------------------------------------
