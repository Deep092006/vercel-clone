#!/bin/bash
set -euo pipefail

mkdir -p /data/mongo /data/minio /var/log/supervisor

export MINIO_ROOT_USER="${MINIO_ROOT_USER:-minio}"
export MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-minio123}"
export S3_BUCKET="${S3_BUCKET:-vercel-clone-outputs}"

export REDIS_URL="${REDIS_URL:-redis://127.0.0.1:6379}"
export S3_ENDPOINT="${S3_ENDPOINT:-127.0.0.1}"
export S3_PORT="${S3_PORT:-9000}"
export S3_USE_SSL="${S3_USE_SSL:-false}"
export S3_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID:-$MINIO_ROOT_USER}"
export S3_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY:-$MINIO_ROOT_PASSWORD}"
export S3_REGION="${S3_REGION:-us-east-1}"

export BUILD_RUNNER_MODE="${BUILD_RUNNER_MODE:-local}"
export BUILD_SERVER_PATH="${BUILD_SERVER_PATH:-/app/build-server}"

export OUTPUTS_BASE_URL="${OUTPUTS_BASE_URL:-http://127.0.0.1:9000/${S3_BUCKET}/__outputs}"
export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/vercel_clone}"
export MONGODB_DB="${MONGODB_DB:-vercel_clone}"

export INTERNAL_API_URL="${INTERNAL_API_URL:-http://127.0.0.1:9000}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:9000}"
export NEXT_PUBLIC_SOCKET_URL="${NEXT_PUBLIC_SOCKET_URL:-http://localhost:9002}"
export NEXT_PUBLIC_SOCKET_ENABLED="${NEXT_PUBLIC_SOCKET_ENABLED:-false}"
export GITHUB_REDIRECT_URI="${GITHUB_REDIRECT_URI:-http://localhost:3000/api/auth/github/callback}"

exec /usr/bin/supervisord -c /app/single-image/supervisord.conf
