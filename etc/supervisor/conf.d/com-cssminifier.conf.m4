[program:com-cssminifier]
command = sudo -E -u chilts __NODE__ __PWD__/server.js
directory = /home/chilts/src/chilts-cssminifier-com
user = __USER__
autostart = true
autorestart = true
stdout_logfile = /var/log/com-cssminifier/cssminifier-stout.log
stderr_logfile = /var/log/com-cssminifier/cssminifier-sterr.log
environment = NODE_ENV="production"
