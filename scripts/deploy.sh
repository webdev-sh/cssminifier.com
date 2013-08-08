#!/bin/bash
## --------------------------------------------------------------------------------------------------------------------

set -e

# install any required packages
echo "Fetching new code ..."
git fetch
git rebase origin/master
echo

# now call install.sh (since it's now been updated)
./scripts/install.sh

## --------------------------------------------------------------------------------------------------------------------
