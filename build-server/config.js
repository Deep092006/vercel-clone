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
  const projectId = requiredEnv(env, 'PROJECT_ID')
  const redisUrl = requiredEnv(env, 'REDIS_URL')

  const bucket = requiredEnv(env, 'S3_BUCKET')
  const endpoint = requiredEnv(env, 'S3_ENDPOINT')
  const port = parseNumber(env, 'S3_PORT', 9000)
  const useSSL = parseBoolean(env, 'S3_USE_SSL', false)

  const accessKeyId = requiredEnv(env, 'S3_ACCESS_KEY_ID')
  const secretAccessKey = requiredEnv(env, 'S3_SECRET_ACCESS_KEY')
  const region = env.S3_REGION || 'us-east-1'

  return {
    projectId,
    redisUrl,
    s3: {
      bucket,
      endpoint,
      port,
      useSSL,
      accessKeyId,
      secretAccessKey,
      region
    }
  }
}

module.exports = { loadConfig }
