#!/bin/bash
set +x
set -e
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export NC='\033[0m' # No Color

PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=$(dirname "${PARENT_SCRIPT_PATH}")
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER"
cd "${SCRIPT_FOLDER}"
cd ..
# shellcheck source=./log_start.sh
export IONIC_PATH="$PWD" && source "$IONIC_PATH"/scripts/log_start.sh

#cd ..
#mkdir qm-ionic-intermediates
#cd qm-ionic-intermediates
#export INTERMEDIATE_PATH="$PWD"
export INTERMEDIATE_PATH="$IONIC_PATH"
echo "INTERMEDIATE_PATH is $INTERMEDIATE_PATH"
if [ -z "$DROPBOX_PATH" ]
    then
        echo -e "${RED}ERROR: DROPBOX_PATH does not exist for build_all_apps.sh! Quitting! "
        exit 1
fi

if [ -z "$QM_DOCKER_PATH" ]
    then
        echo -e "${RED}ERROR: QM_DOCKER_PATH does not exist for build_all_apps.sh! Quitting! "
        exit 1
fi

export APP_PRIVATE_CONFIG_PATH="${QM_DOCKER_PATH}/configs/ionic/private_configs"
export BUILD_PATH="${IONIC_PATH}/build"
export LANG=en_US.UTF-8
export ENCRYPTION_SECRET=${ENCRYPTION_SECRET}

### ANDROID CRAP ###
export ANDROID_KEYSTORE_PATH="$QM_DOCKER_PATH/configs/android/quantimodo.keystore"

### IOS CRAP ###
export TEAM_ID="YD2FK7S2S5"
export DEVELOPER_NAME="iPhone Distribution=Mike Sinn (YD2FK7S2S5)"
export PROFILE_NAME="match_AppStore_comquantimodomoodimodoapp"
export PROFILE_UUID="cd6448f6-e30d-4d74-8413-58f96a770671"
export DELIVER_USER="ios@quantimodo.com"
export FASTLANE_USER="ios@quantimodo.com"
export FASTLANE_PASSWORD=${FASTLANE_PASSWORD}
export DELIVER_PASSWORD=${DELIVER_PASSWORD}
export DELIVER_WHAT_TO_TEST="Test the basics of the app and see if something breaks!"
export KEY_PASSWORD=${KEY_PASSWORD}

if [ -z "$ANDROID_HOME" ]
  then
    export ANDROID_HOME="/Users/Shared/Jenkins/Library/Android/sdk"
  # echo -e "${RED} Android home doesn't exist. On OSX, you can set it like this: http://stackoverflow.com/questions/19986214/setting-android-home-enviromental-variable-on-mac-os-x "
  # exit
fi
echo "ANDROID_HOME is $ANDROID_HOME"

if [ -z "$ANDROID_BUILD_TOOLS" ]
  then
    export ANDROID_BUILD_TOOLS="${ANDROID_HOME}/build-tools/23.0.3"
  # echo -e "${RED} Android home doesn't exist. On OSX, you can set it like this: http://stackoverflow.com/questions/19986214/setting-android-home-enviromental-variable-on-mac-os-x "
  # exit
fi
echo "ANDROID_BUILD_TOOLS is $ANDROID_BUILD_TOOLS"

if [ -z "$ANDROID_KEYSTORE_PASSWORD" ]
  then
      echo -e "${RED}ERROR: ANDROID_KEYSTORE_PASSWORD does not exist for build_all_apps.sh! Quitting! "
      exit 1
fi

echo "Using node 4.4.4 because 6 seems to break stuff: https://github.com/steelbrain/exec/issues/13"
source /home/ubuntu/.nvm/nvm.sh
nvm install 4.4.4
nvm use 4.4.4

sudo mkdir ${DROPBOX_PATH}
sudo mkdir /home/ubuntu/Dropbox/QuantiModo
sudo mkdir /home/ubuntu/Dropbox/QuantiModo/apps
sudo mkdir /var/lib/jenkins/.android
sudo usermod -a -G ubuntu jenkins

sudo chmod -R 777 ${DROPBOX_PATH}
sudo chmod -R 777 ${INTERMEDIATE_PATH}
sudo chmod -R 777 ${IONIC_PATH}
sudo chmod -R 777 /home/ubuntu/Dropbox/QuantiModo
sudo chmod -R 777 /usr/lib/node_modules
sudo chmod -R 777 /usr/local/lib
sudo chmod -R 777 /var/lib/jenkins/.android
sudo chmod 777 -R $PWD
sudo ln -s /usr/bin/nodejs /usr/bin/node

keytool -exportcert -list -v \
-alias androiddebugkey -keystore ${ANDROID_DEBUG_KEYSTORE_PATH}

ionic info
sudo usermod -a -G ubuntu jenkins

mkdir "$ANDROID_HOME/licenses" || true
echo -e "\n8933bad161af4178b1185d1a37fbf41ea5269c55" > "$ANDROID_SDK/licenses/android-sdk-license"
echo -e "\n84831b9409646a918e30573bab4c9c91346d8abd" > "$ANDROID_SDK/licenses/android-sdk-preview-license"



#echo "Copying everything from ${IONIC_PATH} to $INTERMEDIATE_PATH"
#rsync -a --exclude=build/ --exclude=.git/ ${IONIC_PATH}/* ${INTERMEDIATE_PATH}
cd ${INTERMEDIATE_PATH}

rm -rf plugins
echo "NPM INSTALL"
npm install && gulp configureApp
gulp prepareRepositoryForAndroid

#echo "ionic state reset"
#ionic state reset

echo "cordova plugin rm phonegap-facebook-plugin for $QUANTIMODO_CLIENT_ID Android app..."
cordova plugin rm phonegap-facebook-plugin || true
echo "cordova plugin rm cordova-plugin-facebook4 for $QUANTIMODO_CLIENT_ID Android app..."
cordova plugin rm cordova-plugin-facebook4 || true
echo "rm -rf ../fbplugin for $QUANTIMODO_CLIENT_ID Android app..."
rm -rf ../fbplugin
#echo "gulp addFacebookPlugin for $QUANTIMODO_CLIENT_ID Android app..."
#gulp addFacebookPlugin
echo "cordova plugin add cordova-plugin-facebook4 APP_ID=${FACEBOOK_APP_ID} APP_NAME=${FACEBOOK_APP_NAME} for $QUANTIMODO_CLIENT_ID Android app..."
cordova plugin add cordova-plugin-facebook4@1.7.1 --save --variable APP_ID="${FACEBOOK_APP_ID}" --variable APP_NAME="${FACEBOOK_APP_NAME}"

#echo "gulp addFacebookPlugin for $QUANTIMODO_CLIENT_ID Android app..."
#gulp addGooglePlusPlugin

echo "cordova plugin add https://github.com/mikepsinn/cordova-plugin-googleplus.git --variable REVERSED_CLIENT_ID=${REVERSED_CLIENT_ID} for $QUANTIMODO_CLIENT_ID Android app..."
cordova plugin add https://github.com/mikepsinn/cordova-plugin-googleplus.git --variable REVERSED_CLIENT_ID=${REVERSED_CLIENT_ID}

#echo "cordova plugin add cordova-fabric-plugin --variable FABRIC_API_KEY=${FABRIC_API_KEY} --variable FABRIC_API_SECRET=${FABRIC_API_SECRET} for $QUANTIMODO_CLIENT_ID Android app..."
#cordova plugin add cordova-fabric-plugin --variable FABRIC_API_KEY=${FABRIC_API_KEY} --variable FABRIC_API_SECRET=${FABRIC_API_SECRET}

echo "cordova plugin add cordova-fabric-plugin -–variable FABRIC_API_KEY=${FABRIC_API_KEY} –-variable FABRIC_API_SECRET=${FABRIC_API_SECRET} for $QUANTIMODO_CLIENT_ID Android app..."
cordova plugin add cordova-fabric-plugin -–variable FABRIC_API_KEY=${FABRIC_API_KEY} –-variable FABRIC_API_SECRET=${FABRIC_API_SECRET}

source ${IONIC_PATH}/scripts/build_scripts/push_plugin_install.sh

echo "ionic browser add crosswalk@12.41.296.5"
# ionic browser add crosswalk@12.41.296.5  # Pre Ionic CLI 2
ionic plugin add cordova-plugin-crosswalk-webview --save

if [ -f ${INTERMEDIATE_PATH}/www/lib/angular/angular.js ];
then
   echo echo "Dependencies installed via bower"
else
   echo "ERROR: Dependencies not installed! Build FAILED"
   exit 1
fi

#source ${IONIC_PATH}/scripts/build_scripts/00_install_dependencies.sh

export APPLE_ID="1115037060"
export APP_IDENTIFIER="com.quantimodo.quantimodo"
export APP_DISPLAY_NAME="QuantiModo"
export QUANTIMODO_CLIENT_ID=quantimodo
export APP_DESCRIPTION=Perfect your life
echo "Cannot use exclamation point in app description"
export IONIC_APP_ID="42fe48d4"


if [ -z ${BUILD_QUANTIMODO} ];
    then
        echo "NOT BUILDING ${APP_DISPLAY_NAME}"
    else
        gulp configureApp
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
        #source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

        # We do this at this higher level so Jenkins can detect the exit code
        if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk ];
        then
           echo echo "${QUANTIMODO_CLIENT_ID} Android app is ready in ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk"
        else
           echo "ERROR: File ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk does not exist. Build FAILED"
           exit 1
        fi
fi

export APPLE_ID="1046797567"
export APP_IDENTIFIER="com.quantimodo.moodimodoapp"
export APP_DISPLAY_NAME="MoodiModo"
export QUANTIMODO_CLIENT_ID=moodimodo
export APP_DESCRIPTION=Track and find out what affects your mood
export IONIC_APP_ID="470c1f1b"

if [ -z ${BUILD_MOODIMODO} ];
    then
        echo "NOT BUILDING ${APP_DISPLAY_NAME}"
    else
        gulp configureApp
        #source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
        #source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

        # We do this at this higher level so Jenkins can detect the exit code
        if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk ];
        then
           echo echo "${QUANTIMODO_CLIENT_ID} Android app is ready in ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk"
        else
           echo "ERROR: File ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk does not exist. Build FAILED"
           exit 1
        fi
fi

export APPLE_ID="102492.2.7"
export APP_IDENTIFIER="com.quantimodo.mindfirst"
export APP_DISPLAY_NAME=MindFirst
echo "Replace doesn't work if there's a space"
export QUANTIMODO_CLIENT_ID=mindfirst
export APP_DESCRIPTION=Empowering a New Approach to Mind Research
export IONIC_APP_ID="6d8e312f"

if [ -z ${BUILD_MINDFIRST} ];
    then
        echo "NOT BUILDING ${APP_DISPLAY_NAME}"
    else
        gulp configureApp
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
        #source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh


        # We do this at this higher level so Jenkins can detect the exit code
        if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk ];
        then
           echo echo "${QUANTIMODO_CLIENT_ID} Android app is ready in ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk"
        else
           echo "ERROR: File ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk does not exist. Build FAILED"
           exit 1
        fi
fi

export APPLE_ID="1115037652"
export APP_IDENTIFIER="com.quantimodo.energymodo"
export APP_DISPLAY_NAME="EnergyModo"
export QUANTIMODO_CLIENT_ID=energymodo
export APP_DESCRIPTION=Track and find out what affects your energy levels
export IONIC_APP_ID="f837bb35"

if [ -z ${BUILD_ENERGYMODO} ];
    then
        echo "NOT BUILDING ${APP_DISPLAY_NAME}"
    else
        gulp configureApp
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
        #source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

        # We do this at this higher level so Jenkins can detect the exit code
        if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk ];
        then
           echo echo "${QUANTIMODO_CLIENT_ID} Android app is ready in ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk"
        else
           echo "ERROR: File ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk does not exist. Build FAILED"
           exit 1
        fi
fi

export APPLE_ID="1115037661"
export APP_IDENTIFIER="com.quantimodo.medimodo"
export APP_DISPLAY_NAME="MediModo"
export QUANTIMODO_CLIENT_ID=medimodo
export APP_DESCRIPTION=Medication Track Learn Connect
export IONIC_APP_ID="e85b92b4"

if [ -z ${BUILD_MEDIMODO} ];
    then
        echo "NOT BUILDING ${APP_DISPLAY_NAME}"
    else
        gulp configureApp
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
        #source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

        # We do this at this higher level so Jenkins can detect the exit code
        if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk ];
        then
           echo echo "${QUANTIMODO_CLIENT_ID} Android app is ready in ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk"
        else
           echo "ERROR: File ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk does not exist. Build FAILED"
           exit 1
        fi
fi

export APPLE_ID="1115037661"
export APP_IDENTIFIER="com.quantimodo.epharmix"
export APP_DISPLAY_NAME="Epharmix"
export QUANTIMODO_CLIENT_ID=epharmix
export APP_DESCRIPTION=Improving Health Outcomes
export IONIC_APP_ID=""

if [ -z ${BUILD_EPHARMIX} ];
    then
        echo "NOT BUILDING ${APP_DISPLAY_NAME}"
    else
        gulp configureApp
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
        #source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

        # We do this at this higher level so Jenkins can detect the exit code
        if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk ];
        then
           echo echo "${QUANTIMODO_CLIENT_ID} Android app is ready in ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk"
        else
           echo "ERROR: File ${DROPBOX_PATH}/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk does not exist. Build FAILED"
           exit 1
        fi
fi

sudo chmod -R 777 ${DROPBOX_PATH}/QuantiModo/apps

# shellcheck source=./log_start.sh
source "$IONIC_PATH"/scripts/log_end.sh "${BASH_SOURCE[0]}"
exit 0
