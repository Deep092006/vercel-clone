const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const Minio = require('minio')
const mime = require('mime-types')
const Redis = require('ioredis')
const { loadConfig } = require('./config')

let config
try {
    config = loadConfig()
} catch (error) {
    console.error(error.message)
    process.exit(1)
}

const publisher = new Redis(config.redisUrl)

const minioClient = new Minio.Client({
    endPoint: config.s3.endpoint,
    port: config.s3.port,
    useSSL: config.s3.useSSL,
    accessKey: config.s3.accessKeyId,
    secretKey: config.s3.secretAccessKey
})

const PROJECT_ID = config.projectId


function publishLog(log) {
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log }))
}

function bucketExists(bucketName) {
    return new Promise((resolve, reject) => {
        minioClient.bucketExists(bucketName, (error, exists) => {
            if (error) return reject(error)
            resolve(exists)
        })
    })
}

function makeBucket(bucketName, region) {
    return new Promise((resolve, reject) => {
        minioClient.makeBucket(bucketName, region, error => {
            if (error) return reject(error)
            resolve()
        })
    })
}

function putObject(bucketName, objectName, stream, metaData) {
    return new Promise((resolve, reject) => {
        minioClient.putObject(bucketName, objectName, stream, undefined, metaData, error => {
            if (error) return reject(error)
            resolve()
        })
    })
}

async function ensureBucket() {
    const exists = await bucketExists(config.s3.bucket)
    if (!exists) {
        publishLog(`Creating bucket ${config.s3.bucket}`)
        await makeBucket(config.s3.bucket, config.s3.region)
    }
}

async function init() {
    console.log('Executing script.js')
    publishLog('Build Started...')
    const outDirPath = process.env.OUTPUT_DIR || path.join(__dirname, 'output')

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data', function (data) {
        console.log(data.toString())
        publishLog(data.toString())
    })

    p.stderr.on('data', function (data) {
        console.log('Error', data.toString())
        publishLog(`error: ${data.toString()}`)
    })

    p.on('close', async function (code) {
        if (code !== 0) {
            publishLog(`error: build failed with exit code ${code}`)
            return
        }

        console.log('Build Complete')
        publishLog(`Build Complete`)
        const distFolderPath = path.join(outDirPath, 'dist')
        if (!fs.existsSync(distFolderPath)) {
            publishLog('error: dist directory not found')
            return
        }
        const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true })

        publishLog(`Starting to upload`)
        await ensureBucket()
        for (const file of distFolderContents) {
            const filePath = path.join(distFolderPath, file)
            if (fs.lstatSync(filePath).isDirectory()) continue;

            console.log('uploading', filePath)
            publishLog(`uploading ${file}`)

            const contentType = mime.lookup(filePath) || 'application/octet-stream'
            await putObject(
                config.s3.bucket,
                `__outputs/${PROJECT_ID}/${file}`,
                fs.createReadStream(filePath),
                { 'Content-Type': contentType }
            )
            publishLog(`uploaded ${file}`)
            console.log('uploaded', filePath)
        }
        publishLog(`Done`)
        console.log('Done...')
    })
}

init()
