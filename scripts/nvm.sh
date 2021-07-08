#!/bin/bash
# shellcheck disable=SC2086
# shellcheck disable=SC2006
set +x
set -e
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=`dirname ${PARENT_SCRIPT_PATH}`
cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD"
# shellcheck source=./no-root.sh
source "$SCRIPT_FOLDER"/no-root.sh
sudo chown -R $USER ~/.nvm
command -v nvm >/dev/null 2>&1 || {
    echo >&2 "nvm is required, but it's not installed.  Trying to install it now...";
    # shellcheck source=./nvm_load.sh
    source "$IONIC_PATH"/scripts/nvm_install.sh
}
# shellcheck source=./nvm_load.sh
source "$IONIC_PATH"/scripts/nvm_load.sh
set +x
echo "nvm install $1..."
nvm install $1
echo "nvm use $1..."
nvm use $1
set -x
node -v
# shellcheck source=./log_start.sh
source "$IONIC_PATH"/scripts/log_end.sh "${BASH_SOURCE[0]}"
