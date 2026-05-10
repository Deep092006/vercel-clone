#!/bin/bash
set -euo pipefail

MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://127.0.0.1:9000}"

until mc alias set local "$MINIO_ENDPOINT" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"; do
  echo "waiting for minio..."
  sleep 2
done

mc mb --ignore-existing "local/$S3_BUCKET"
mc anonymous set download "local/$S3_BUCKET"
