#!/bin/bash
# shellcheck disable=SC2006
# shellcheck disable=SC2086
set +x
set -e
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=`dirname ${PARENT_SCRIPT_PATH}`
# shellcheck source=./log_start.sh
cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && source "$IONIC_PATH"/scripts/log_start.sh "${BASH_SOURCE[0]}"
# shellcheck source=./no-root.sh
source "$SCRIPT_FOLDER"/no-root.sh
# shellcheck source=./nvm.sh
source "$SCRIPT_FOLDER"/nvm.sh 10
set -x && npm install && set +x
if [[ ${NODE_NAME} = "sonicmaster-ubuntu" ]];
    then
        echo "Have to run rebuild node-sass on sonicmaster slave.  TODO: Remove this";
        npm rebuild node-sass;
fi
npm run configure:app
# shellcheck source=./log_start.sh
source "$IONIC_PATH"/scripts/log_end.sh "${BASH_SOURCE[0]}"
