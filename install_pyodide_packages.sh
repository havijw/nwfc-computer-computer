#!/bin/bash

PYODIDE_VERSION=$(npm list pyodide --depth=0 | grep pyodide | awk '{print $2}' | sed 's/[^0-9.]//g')
PYODIDE_RELEASE_ARCHIVE_URL="https://github.com/pyodide/pyodide/releases/download/${PYODIDE_VERSION}/pyodide-${PYODIDE_VERSION}.tar.bz2"

echo "Downloading pyodide release from ${PYODIDE_RELEASE_ARCHIVE_URL}"
PYODIDE_ARCHIVE_PATH="node_modules/pyodide/pyodide-${PYODIDE_VERSION}.tar.bz2"
wget -q -O $PYODIDE_ARCHIVE_PATH $PYODIDE_RELEASE_ARCHIVE_URL

# We don't need to unpack all the packages, and it's a lot faster not to. But, GNU and BSD tar have
# difference handling of wildcards - GNU tar needs the --wildcards flag to support them, while BSD
# tar will error if it receives the --wildcards flag. GNU tar is used by GitHub actions runners,
# while BSD tar is the default on MacOS, so we need to support both.
# To test this on MacOS before deploying, install gnu-tar with homebrew and replace tar with gtar in
# the next couple lines. Just make sure to change it back before deploying!
echo "Unpacking relevant Python packages into node_modules/pyodide"
if tar --wildcards --help >/dev/null 2>&1; then
  WILDCARD_FLAG=--wildcards
fi
tar -xvjf $PYODIDE_ARCHIVE_PATH -C node_modules/pyodide --exclude="*tests*" \
  $WILDCARD_FLAG pyodide/{numpy,scipy}*
mv node_modules/pyodide/pyodide/* node_modules/pyodide

echo "Cleaning up extraneous files"
rm -rf node_modules/pyodide/pyodide
rm "node_modules/pyodide/pyodide-${PYODIDE_VERSION}.tar.bz2"
