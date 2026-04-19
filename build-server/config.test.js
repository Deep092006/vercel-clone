const test = require('node:test')
const assert = require('node:assert/strict')
const { loadConfig } = require('./config')

test('requires core env vars', () => {
  assert.throws(() => loadConfig({}), /PROJECT_ID/)
})

test('requires s3 endpoint', () => {
  assert.throws(
    () =>
      loadConfig({
        PROJECT_ID: 'project-1',
        REDIS_URL: 'redis://localhost:6379',
        S3_BUCKET: 'vercel-clone-outputs'
      }),
    /S3_ENDPOINT/
  )
})

test('rejects partial credentials', () => {
  assert.throws(
    () =>
      loadConfig({
        PROJECT_ID: 'project-1',
        REDIS_URL: 'redis://localhost:6379',
        S3_BUCKET: 'vercel-clone-outputs',
        S3_ENDPOINT: 'minio',
        S3_ACCESS_KEY_ID: 'key-only'
      }),
    /S3_SECRET_ACCESS_KEY/
  )
})

test('requires secret access key', () => {
  assert.throws(
    () =>
      loadConfig({
        PROJECT_ID: 'project-1',
        REDIS_URL: 'redis://localhost:6379',
        S3_BUCKET: 'vercel-clone-outputs',
        S3_ENDPOINT: 'minio',
        S3_SECRET_ACCESS_KEY: 'missing-id'
      }),
    /S3_ACCESS_KEY_ID/
  )
})

test('builds config for MinIO', () => {
  const config = loadConfig({
    PROJECT_ID: 'project-1',
    REDIS_URL: 'redis://localhost:6379',
    S3_BUCKET: 'vercel-clone-outputs',
    S3_ENDPOINT: 'minio',
    S3_ACCESS_KEY_ID: 'minio',
    S3_SECRET_ACCESS_KEY: 'minio-secret',
    S3_PORT: '9000',
    S3_USE_SSL: 'false'
  })

  assert.equal(config.projectId, 'project-1')
  assert.equal(config.redisUrl, 'redis://localhost:6379')
  assert.equal(config.s3.bucket, 'vercel-clone-outputs')
  assert.equal(config.s3.endpoint, 'minio')
  assert.equal(config.s3.port, 9000)
  assert.equal(config.s3.useSSL, false)
})
