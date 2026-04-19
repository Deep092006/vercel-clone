function requiredEnv(env, name) {
  const value = env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function parseBoolean(env, name, defaultValue) {
  const raw = env[name]
  if (raw === undefined || raw === '') return defaultValue
  const normalized = raw.trim().toLowerCase()
  if (['true', '1', 'yes'].includes(normalized)) return true
  if (['false', '0', 'no'].includes(normalized)) return false
  throw new Error(`Invalid boolean for ${name}: ${raw}`)
}

function parseNumber(env, name, defaultValue) {
  const raw = env[name]
  if (raw === undefined || raw === '') return defaultValue
  const value = Number(raw)
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid number for ${name}: ${raw}`)
  }
  return value
}

function loadConfig(env = process.env) {
  const redisUrl = requiredEnv(env, 'REDIS_URL')
  const dockerSocketPath = env.DOCKER_SOCKET_PATH || '/var/run/docker.sock'
  const dockerNetwork = env.DOCKER_NETWORK || undefined
  const buildImage = env.BUILD_SERVER_IMAGE || 'vercel-clone-build-server:local'

  const s3 = {
    bucket: requiredEnv(env, 'S3_BUCKET'),
    endpoint: requiredEnv(env, 'S3_ENDPOINT'),
    port: parseNumber(env, 'S3_PORT', 9000),
    useSSL: parseBoolean(env, 'S3_USE_SSL', false),
    accessKeyId: requiredEnv(env, 'S3_ACCESS_KEY_ID'),
    secretAccessKey: requiredEnv(env, 'S3_SECRET_ACCESS_KEY'),
    region: env.S3_REGION || 'us-east-1'
  }

  return {
    redisUrl,
    dockerSocketPath,
    dockerNetwork,
    buildImage,
    s3
  }
}

module.exports = { loadConfig }
