#!/usr/bin/env bash
set +x
set -e
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=$(dirname "${PARENT_SCRIPT_PATH}")
cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && source "$IONIC_PATH"/scripts/log_start.sh  "${BASH_SOURCE[0]}"
set -x
sudo chown -R "$USER" ~/.nvm || true
sudo apt install -y curl
echo "Installing nvm..."
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash;
# shellcheck source=./nvm_load.sh
source "$IONIC_PATH"/scripts/nvm_load.sh
echo "You'll probably have to restart the script to use nvm"
# shellcheck source=./log_start.sh
source "$IONIC_PATH"/scripts/log_end.sh "${BASH_SOURCE[0]}"
