#!/usr/bin/env bash
echo "************************"
echo "Generating documentation"
echo "************************"
# ./node_modules/.bin/jsdoc --readme ./README.md -c ./scripts/conf.json -d docs

# ./node_modules/typedoc/bin/typedoc --out docs/ ./

echo "************************"
echo "Documentation generated, see " "file://"$(pwd)"/docs/index.html"
echo "************************"
