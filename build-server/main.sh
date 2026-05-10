#!/bin/bash

export GIT_REPOSITORY__URL="$GIT_REPOSITORY__URL"
OUTPUT_DIR="${OUTPUT_DIR:-/home/app/output}"

rm -rf "$OUTPUT_DIR"
git clone "$GIT_REPOSITORY__URL" "$OUTPUT_DIR"

node script.js
status=$?
rm -rf "$OUTPUT_DIR"
exit $status
