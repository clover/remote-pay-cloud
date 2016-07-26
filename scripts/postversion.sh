#!/usr/bin/env bash
echo $1
sed -i -e 's/CLOVER_CLOUD_SDK_VERSION.*\"/CLOVER_CLOUD_SDK_VERSION = \"'$1'\"/g' Clover.js
sed -i -e 's/CLOVER_CLOUD_SDK_VERSION.*\"/CLOVER_CLOUD_SDK_VERSION = \"'$1'\"/g' CloverConnectorImpl.js
sed -i -e 's/<!--- 48e3d6f7-4171-4cbc-8d5c-152b4a3a67bc --->.*\"/<!--- 48e3d6f7-4171-4cbc-8d5c-152b4a3a67bc --->Current version:  \"'$1'\"/g' README.md

git add -A && git commit -m "$1"
