#!/bin/bash

PYODIDE_VERSION=$(npm list pyodide --depth=0 | grep pyodide | awk '{print $2}' | sed 's/[^0-9.]//g')
PYODIDE_RELEASE_ARCHIVE_URL="https://github.com/pyodide/pyodide/releases/download/${PYODIDE_VERSION}/pyodide-${PYODIDE_VERSION}.tar.bz2"
echo "Downloading pyodide release from ${PYODIDE_RELEASE_ARCHIVE_URL}"
wget -q --show-progress -O \
  "node_modules/pyodide/pyodide-${PYODIDE_VERSION}.tar.bz2" "${PYODIDE_RELEASE_ARCHIVE_URL}"
echo "Unpacking relevant Python packages into node_modules/pyodide"
tar \
  -xvjf \
  "node_modules/pyodide/pyodide-${PYODIDE_VERSION}.tar.bz2" \
  -C node_modules/pyodide \
  --exclude="*tests*" \
  pyodide/{numpy,scipy,openblas}*
mv node_modules/pyodide/pyodide/* node_modules/pyodide
echo "Cleaning up extraneous files"
rm -rf node_modules/pyodide/pyodide
rm "node_modules/pyodide/pyodide-${PYODIDE_VERSION}.tar.bz2"
