#!/bin/bash
## --------------------------------------------------------------------------------------------------------------------

# environment
set -e
. $HOME/.nvm/nvm.sh || true
nvm use v0.6.7

## --------------------------------------------------------------------------------------------------------------------
# functions

function usage() {
    echo "Usage: $0 [action]"
    echo
    echo "actions:"
    echo "    initialise   - initialise this instance"
    echo "    start        - start the server"
    echo "    list         - lists all servers"
    echo "    restart      - restarts all servers"
    echo "    stop         - stops all servers"
}

## --------------------------------------------------------------------------------------------------------------------

# firstly, check there is a command
if [ $# -lt 1 ]; then
    usage
    exit
fi

## --------------------------------------------------------------------------------------------------------------------
# environment variables

NODE_ENV=production
ACTION="$1";
PWD=`pwd`

## --------------------------------------------------------------------------------------------------------------------

# do whichever command we have chosen
case "$ACTION" in
    initialise)
        # install all the npm stuff we need
        npm -d install
        ;;

    list)
        ./node_modules/.bin/forever list
        ;;

    start)
        # check to see if this port is already in use
        if ! lsof -i :3001 > /dev/null; then
            ./node_modules/.bin/forever \
                -a \
                -l $PWD/logs/forever.log \
                -o logs/access.log \
                -e logs/error.log \
                start app.js 3001
        else
            echo "Server on 3001 is already listening"
        fi 

        if ! lsof -i :3002 > /dev/null; then
            ./node_modules/.bin/forever \
                -a \
                -l $PWD/logs/forever.log \
                -o logs/access.log \
                -e logs/error.log \
                start app.js 3002
        else
            echo "Server on 3002 is already listening"
        fi
        ;;

    restart)
        ./node_modules/.bin/forever restart app.js
        ;;

    stop)
        ./node_modules/.bin/forever stop app.js
        ;;

    *)
        echo "Unknown action: $ACTION"
        echo
        usage
        ;;
esac

## --------------------------------------------------------------------------------------------------------------------
