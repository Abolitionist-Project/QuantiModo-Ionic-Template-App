#!/usr/bin/env bash
set +x
set -e
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=$(dirname "${PARENT_SCRIPT_PATH}")
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER"
cd "${SCRIPT_FOLDER}"
cd ..
# shellcheck source=./log_start.sh
export IONIC_PATH="$PWD" && source "$IONIC_PATH"/scripts/log_start.sh "${BASH_SOURCE[0]}"

set -x

sudo bash "${IONIC_PATH}"/scripts/android_sdk_install.sh

sudo curl -sSL https://get.docker.com/ | sh
sudo usermod -aG docker jenkins
echo "You'll probably need to restart to script to run docker without sudo"

sudo bash ${IONIC_PATH}/scripts/node_js_install.sh

sudo ${IONIC_PATH}/scripts/nvm_install.sh

nvm install 4.4.4
nvm use 4.4.4

sudo npm install -g gulp cordova@6.5.0 ionic@2.2.3 bower

sudo chmod -R 777 /usr/local/lib
sudo chmod -R 777 /usr/lib/node_modules

sudo mkdir /home/ubuntu/Dropbox/QuantiModo
sudo mkdir /home/ubuntu/Dropbox/QuantiModo/apps
sudo chmod -R 777 /home/ubuntu/Dropbox/QuantiModo
sudo usermod -a -G ubuntu jenkins

ionic info
sudo chmod 777 -R "$PWD"
sudo chmod -R 770 "${IONIC_PATH}"/scripts

# shellcheck source=./log_start.sh
source "$IONIC_PATH"/scripts/log_end.sh "${BASH_SOURCE[0]}"
