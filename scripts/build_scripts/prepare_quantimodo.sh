#!/usr/bin/env bash
set +x
set -e
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export NC='\033[0m' # No Color

PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=$(dirname "${PARENT_SCRIPT_PATH}")
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER"
cd "${SCRIPT_FOLDER}"
cd ../..
# shellcheck source=./../log_start.sh
export IONIC_PATH="$PWD" && source "${IONIC_PATH}"/scripts/log_start.sh

echo "IONIC_PATH is $IONIC_PATH"
export INTERMEDIATE_PATH="$IONIC_PATH"
echo "INTERMEDIATE_PATH is $INTERMEDIATE_PATH"

#cd ..
#mkdir intermediates
#cd intermediates
#export INTERMEDIATE_PATH="$PWD"
#echo "INTERMEDIATE_PATH is $INTERMEDIATE_PATH"
#
#cd ..
#rsync -a --delete --exclude=/platforms/ --exclude=/node_modules/  ${IONIC_PATH}/* ${INTERMEDIATE_PATH}

cd ../../..
export QM_DOCKER_PATH="$PWD"
echo "QM_DOCKER_PATH is ${QM_DOCKER_PATH}"

export APP_PRIVATE_CONFIG_PATH="${QM_DOCKER_PATH}/configs/ionic/private_configs"
export BUILD_PATH="${IONIC_PATH}/build"
export LANG=en_US.UTF-8
export ENCRYPTION_SECRET=${ENCRYPTION_SECRET}

### ANDROID CRAP ###
export ANDROID_KEYSTORE_PATH="$QM_DOCKER_PATH/configs/android/quantimodo.keystore"

### IOS CRAP ###
export TEAM_ID="YD2FK7S2S5"
export DEVELOPER_NAME="iPhone Distribution=Mike Sinn (YD2FK7S2S5)"
export DELIVER_USER="ios@quantimodo.com"
export FASTLANE_USER="ios@quantimodo.com"
export FASTLANE_PASSWORD=${FASTLANE_PASSWORD}
export DELIVER_PASSWORD=${DELIVER_PASSWORD}
export DELIVER_WHAT_TO_TEST="Test the basics of the app and see if something breaks!"
export KEY_PASSWORD=${KEY_PASSWORD}

export APPLE_ID="1115037060"
export APP_IDENTIFIER="com.quantimodo.quantimodo"
export APP_DISPLAY_NAME="QuantiModo"
export QUANTIMODO_CLIENT_ID=quantimodo
export APP_DESCRIPTION=Perfect your life
echo "Cannot use exclamation point in app description"

source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
ionic resources ios

# shellcheck source=./../log_end.sh
source "$IONIC_PATH"/scripts/log_end.sh "${BASH_SOURCE[0]}"
