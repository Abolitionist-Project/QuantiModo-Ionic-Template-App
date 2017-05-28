#!/bin/bash

if [ -z "$INTERMEDIATE_PATH" ]
    then
      export INTERMEDIATE_PATH="$PWD"
      echo "No INTERMEDIATE_PATH given. Using $INTERMEDIATE_PATH..."
fi

if [ -z "$BUILD_PATH" ]
    then
      export BUILD_PATH="$IONIC_PATH"/build
      echo "No BUILD_PATH given. Using $BUILD_PATH..."
fi

if [ -z "$LOWERCASE_APP_NAME" ]
    then
      echo "ERROR: No LOWERCASE_APP_NAME given!"
      exit 1
fi

rm -rf ${BUILD_PATH}/${LOWERCASE_APP_NAME}

if [ -d "${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME}" ];
    then
        echo "${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME} path exists";
    else
        echo "ERROR: ${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME} path not found!";
        exit 1
fi

if [ -d "${APP_PRIVATE_CONFIG_PATH}" ];
    then
        echo "${APP_PRIVATE_CONFIG_PATH} path exists";
    else
        echo "ERROR: APP_PRIVATE_CONFIG_PATH ${APP_PRIVATE_CONFIG_PATH} path not found!";
        exit 1
fi

if [ ! -f ${APP_PRIVATE_CONFIG_PATH}/${LOWERCASE_APP_NAME}.private_config.json ]; then
    echo "ERROR: ${APP_PRIVATE_CONFIG_PATH}/${LOWERCASE_APP_NAME}.private_config.json file not found!";
    exit 1
fi

echo "Removing left over resources from previous app"
rm -rf ${INTERMEDIATE_PATH}/resources/*

export LC_CTYPE=C
export LANG=C
echo -e "${GREEN}Replacing LOWERCASE_APP_NAME with ${LOWERCASE_APP_NAME}...${NC}"
cp ${INTERMEDIATE_PATH}/config-template.xml ${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME}/config.xml
cd ${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME}

find . -type f -exec sed -i '' -e 's/YourAppDisplayNameHere/'${APP_DISPLAY_NAME}'/g' {} \; >> /dev/null 2>&1
find . -type f -exec sed -i '' -e 's/YourAppIdentifierHere/'${APP_IDENTIFIER}'/g' {} \; >> /dev/null 2>&1

echo "MAKE SURE NOT TO USE QUOTES OR SPECIAL CHARACTERS WITH export APP_DESCRIPTION OR IT WILL NOT REPLACE PROPERLY"
find . -type f -exec sed -i '' -e 's/YourAppDescriptionHere/'${APP_DESCRIPTION}'/g' {} \; >> /dev/null 2>&1

export LANG=en_US.UTF-8

echo -e "${GREEN}Copy ${LOWERCASE_APP_NAME} config and resource files${NC}"
cp -R ${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME}/*  "${INTERMEDIATE_PATH}"
ionic config build

cd "${INTERMEDIATE_PATH}"
#ionic state reset

echo "Copying generated images from ${INTERMEDIATE_PATH}/resources/android to ${INTERMEDIATE_PATH}/www/img/"
cp -R ${INTERMEDIATE_PATH}/resources/android/*  "${INTERMEDIATE_PATH}/www/img/"

echo "Removing ${BUILD_PATH}/${LOWERCASE_APP_NAME}"
rm -rf "${BUILD_PATH}/${LOWERCASE_APP_NAME}"

if [ ! -f ${INTERMEDIATE_PATH}/www/private_configs//${LOWERCASE_APP_NAME}.private_config.json ]; then
    echo -e "${GREEN}Copy ${APP_PRIVATE_CONFIG_PATH}/${LOWERCASE_APP_NAME}.private_config.json private config to ${INTERMEDIATE_PATH}/www/private_configs/${NC}"
    cp "${APP_PRIVATE_CONFIG_PATH}/${LOWERCASE_APP_NAME}.private_config.json" "${INTERMEDIATE_PATH}/www/private_configs/"
fi