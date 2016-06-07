#!/usr/bin/env bash
echo $1
sed -i -e 's/CLOVER_CLOUD_SDK_VERSION.*\"/CLOVER_CLOUD_SDK_VERSION = \"'$1'\"/g' Clover.js
sed -i -e 's/CLOVER_CLOUD_SDK_VERSION.*\"/CLOVER_CLOUD_SDK_VERSION = \"'$1'\"/g' CloverConnectorImpl.js