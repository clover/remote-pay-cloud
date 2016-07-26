#!/usr/bin/env bash
echo '* NPM Post version script that replaces version information'
echo '* in library files, and in documentation.'
echo '* This script will run after the the version of the library is changed via'
echo '* the "npm version *" command is run against this repo in preparation to publish the'
echo '* module to npm.'
echo "-  Replacing versioning information on files.  Version is now" $1
echo "--   Replacing versioning information on Clover.js..."
sed -i -e 's/CLOVER_CLOUD_SDK_VERSION.*\"/CLOVER_CLOUD_SDK_VERSION = \"'$1'\"/g' Clover.js
echo "--   Replacing versioning information on CloverConnectorImpl.js..."
sed -i -e 's/CLOVER_CLOUD_SDK_VERSION.*\"/CLOVER_CLOUD_SDK_VERSION = \"'$1'\"/g' CloverConnectorImpl.js
echo "--   Replacing versioning information on README.md..."
sed -i -e 's/Current version.*$/Current version: '$1'/g' README.md
echo "- Committing changes to versions..."
git add -A && git commit -m "$1"
