#!/bin/bash
# shellcheck disable=SC2086
# shellcheck disable=SC2006
set +x
set -e
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=`dirname ${PARENT_SCRIPT_PATH}`
# shellcheck source=./log_start.sh
cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && source "$IONIC_PATH"/scripts/log_start.sh "${BASH_SOURCE[0]}"
# shellcheck source=./no-root.sh
source "$SCRIPT_FOLDER"/no-root.sh
sudo chown -R $USER ~/.nvm
command -v nvm >/dev/null 2>&1 || {
    echo >&2 "nvm is required, but it's not installed.  Trying to install it now...";
    sudo chown -R "$USER" ~/.nvm || true
    sudo apt install -y curl
    curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash;
}
echo "Loading nvm command for shell access..."
# shellcheck disable=SC2155
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
# shellcheck disable=SC1090
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
set +x
echo "nvm install $1..."
nvm install $1
echo "nvm use $1..."
nvm use $1
set -x
node -v
# shellcheck source=./log_start.sh
source "$IONIC_PATH"/scripts/log_end.sh "${BASH_SOURCE[0]}"
