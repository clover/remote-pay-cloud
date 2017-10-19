#!/usr/bin/env bash
echo '* NPM Post version script that replaces version information'
echo '* in library files, and in documentation.'
echo '* This script should be run after the the version of the library is changed via'
echo '* the "npm version *" command is run against this repo in preparation to publish the'
echo '* module to npm.'
echo "-  Replacing versioning information on files.  Version is now" $1
echo "--   Replacing versioning information on Version.ts, attempting to change it to '$1'..."
sed -i -e 's/CLOVER_CLOUD_SDK_VERSION.*\"/CLOVER_CLOUD_SDK_VERSION = \"'$1'\"/g' src/com/clover/Version.ts
echo "--   Replacing versioning information on README.md, attempting to change it to '$1'..."
sed -i -e 's/Current version.*$/Current version: '$1'/g' README.md
# Note: The following will only work if you update the docs in github properly.  This can be done by checking out the
# gh-pages branch and adding a directory that corresponds to your version, with the docs for the version.
sed -i -e 's/clover\.github\.io\/remote-pay-cloud\/.*\//clover\.github\.io\/remote-pay-cloud\/'$1'\//g' README.md
echo "- Committing changes to versions..."
exit_string=`git add -A && git commit -m "$1"`
exit_status=$?
if [ ! $exit_status -eq 0 ]; then
    echo "Version Was NOT updated!"
else
    echo "Commit succeeded. Version is '$1'"
fi
echo "The commit attempt returned '$exit_string'"
