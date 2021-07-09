#!/bin/bash
set +x
set -e
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=$(dirname "${PARENT_SCRIPT_PATH}")
# shellcheck source=./log_start.sh
cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && source "$IONIC_PATH"/scripts/log_start.sh "${BASH_SOURCE[0]}"
set -x
npm run types
npm run test:mocha
# shellcheck source=./log_end.sh
source "$IONIC_PATH"/scripts/log_end.sh "${BASH_SOURCE[0]}"
