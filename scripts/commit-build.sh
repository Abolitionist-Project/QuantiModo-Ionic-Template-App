#!/usr/bin/env bash
# shellcheck disable=SC2006
# shellcheck disable=SC2086
set +x
set -e
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=`dirname ${PARENT_SCRIPT_PATH}`
# shellcheck source=./log_start.sh
cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && source "$IONIC_PATH"/scripts/log_start.sh "${BASH_SOURCE[0]}"
BUILD_REPO=$IONIC_PATH/tmp/qm-web-build

git config user.email "m@quantimodo.com"
git config user.name "mikepsinn"

rm -rf $BUILD_REPO || true
set +x && git clone https://${GITHUB_ACCESS_TOKEN}@github.com/mikepsinn/qm-web-build.git $BUILD_REPO || true && set -x
rm -rf $BUILD_REPO/docs/* &> /dev/null
cp -R $IONIC_PATH/src/* $BUILD_REPO/docs
cd $BUILD_REPO
rm $BUILD_REPO/docs/CNAME
git add -A  &> /dev/null
git commit -m "$BUILD_URL $CHANGE_URL"
git push

# shellcheck source=./log_start.sh
source "$IONIC_PATH"/scripts/log_end.sh "${BASH_SOURCE[0]}"
