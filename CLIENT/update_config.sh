#!/bin/bash

FILE="/Users/warodriguez/Downloads/WALTER/ETMW-2026/CLIENT/src/app/utils/config.ts"

if [ "$1" == "set-prod" ]; then
    # Replace both "dev = true" and "dev: true" with false
    sed -i '' -e 's/dev = true/dev = false/g' -e 's/dev: true/dev: false/g' "$FILE"
    echo "Set dev: false in $FILE"
elif [ "$1" == "set-dev" ]; then
    # Replace both "dev = false" and "dev: false" with true
    sed -i '' -e 's/dev = false/dev = true/g' -e 's/dev: false/dev: true/g' "$FILE"
    echo "Reverted to dev: true in $FILE"
else
    echo "Usage: ./update_config.sh [set-prod|set-dev]"
fi
