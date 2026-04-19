const express = require('express')
const { generateSlug } = require('random-word-slugs')
const { Server } = require('socket.io')
const Redis = require('ioredis')
const Docker = require('dockerode')
const { loadConfig } = require('./config')
const cors = require('cors')

const app = express()
const PORT = 9000

let config
try {
    config = loadConfig()
} catch (error) {
    console.error(error.message)
    process.exit(1)
}

const subscriber = new Redis(config.redisUrl)

const io = new Server({
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

io.on('connection', socket => {
    console.log('Socket connected', socket.id)
    socket.on('subscribe', channel => {
        socket.join(channel)
        socket.emit('message', `Joined ${channel}`)
    })
    socket.on('disconnect', reason => {
        console.log('Socket disconnected', socket.id, reason)
    })
})

io.listen(9002, () => console.log('Socket Server 9002'))

const docker = new Docker({ socketPath: config.dockerSocketPath })

app.use(cors())
app.use(express.json())

const logStore = new Map()
const MAX_LOG_LINES = 500

function appendLog(channel, logLine) {
    const logs = logStore.get(channel) || []
    logs.push(logLine)
    if (logs.length > MAX_LOG_LINES) {
        logs.splice(0, logs.length - MAX_LOG_LINES)
    }
    logStore.set(channel, logs)
}

async function runBuildContainer({ gitURL, projectSlug }) {
    const containerName = `build-${projectSlug}-${Date.now()}`
    const envVars = [
        `GIT_REPOSITORY__URL=${gitURL}`,
        `PROJECT_ID=${projectSlug}`,
        `REDIS_URL=${config.redisUrl}`,
        `S3_BUCKET=${config.s3.bucket}`,
        `S3_ENDPOINT=${config.s3.endpoint}`,
        `S3_PORT=${config.s3.port}`,
        `S3_USE_SSL=${config.s3.useSSL}`,
        `S3_ACCESS_KEY_ID=${config.s3.accessKeyId}`,
        `S3_SECRET_ACCESS_KEY=${config.s3.secretAccessKey}`,
        `S3_REGION=${config.s3.region}`
    ]

    const createOptions = {
        Image: config.buildImage,
        name: containerName,
        Env: envVars,
        HostConfig: {
            AutoRemove: true
        }
    }

    if (config.dockerNetwork) {
        createOptions.HostConfig.NetworkMode = config.dockerNetwork
    }

    const container = await docker.createContainer(createOptions)
    await container.start()
}

app.post('/project', async (req, res) => {
    const { gitURL, slug } = req.body
    const projectSlug = slug ? slug : generateSlug()

    if (!gitURL) {
        return res.status(400).json({ status: 'error', error: 'gitURL is required' })
    }

    try {
        await runBuildContainer({ gitURL, projectSlug })
    } catch (error) {
        console.error('Failed to start build container', error)
        return res.status(500).json({ status: 'error', error: 'Failed to start build container' })
    }

    return res.json({ status: 'queued', data: { projectSlug, url: `http://${projectSlug}.localhost:8000` } })

})

app.get('/logs/:projectId', (req, res) => {
    const channel = `logs:${req.params.projectId}`
    const logs = logStore.get(channel) || []
    const since = Number(req.query.since || 0)

    if (!Number.isInteger(since) || since < 0) {
        return res.status(400).json({ status: 'error', error: 'Invalid since cursor' })
    }

    return res.json({ logs: logs.slice(since), next: logs.length })
})

async function initRedisSubscribe() {
    console.log('Subscribed to logs....')
    subscriber.psubscribe('logs:*')
    subscriber.on('pmessage', (pattern, channel, message) => {
        try {
            const parsed = JSON.parse(message)
            if (parsed && parsed.log) {
                appendLog(channel, parsed.log)
            }
        } catch (error) {
            appendLog(channel, message)
        }
        io.to(channel).emit('message', message)
    })
}


initRedisSubscribe()

app.listen(PORT, () => console.log(`API Server Running..${PORT}`))
