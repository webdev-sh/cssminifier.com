[program:com-cssminifier]
command = sudo -E -u chilts __NODE__ __PWD__/server.js
directory = __PWD__
user = __USER__
autostart = true
autorestart = true
stdout_logfile = /var/log/com-cssminifier/stdout.log
stderr_logfile = /var/log/com-cssminifier/stderr.log
environment = NODE_ENV="production",PATH=__PATH__
