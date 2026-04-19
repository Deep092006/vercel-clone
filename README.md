# Vercel Clone

YouTube Video Link: https://youtu.be/0A_JpLYG7hM

Whiteboard Diagram: https://app.eraser.io/workspace/0f8XnDF61iGcatypPqIR?origin=share

### Prerequisite

- Node.JS: [Master NodeJS Playlist](https://youtube.com/playlist?list=PLinedj3B30sDby4Al-i13hQJGQoRQDfPo&si=5gaDmQ_mzuBHvAsg)
- Redis: [Redis Crash Course](https://youtu.be/Vx2zPMPvmug?si=Z_XT6BMNgkgwnX49)
- Learn Docker:
  - Part 1: [Docker in One Shot - Part 1](https://youtu.be/31k6AtW-b3Y?si=FIPffAKieiBGgo5c)
  - Part 2: [Docker in One Shot - Part 2](https://youtu.be/xPT8mXa-sJg?si=-6z_HkJZXsvrvSpO)

### Setup Guide

This project contains the following services and folders:

- `api-server`: HTTP API Server for REST API's
- `build-server`: Docker Image code which clones, builds and pushes the build to S3
- `s3-reverse-proxy`: Reverse Proxy the subdomains and domains to s3 bucket static assets
- `frontend-nextjs`: Next.js UI for creating projects and viewing logs
- `static`: Misc static assets

### Ports

| S.No | Service            | PORT    |
| ---- | ------------------ | ------- |
| 1    | `api-server`       | `:9000` |
| 2    | `socket.io-server` | `:9002` |
| 3    | `s3-reverse-proxy` | `:8000` |
| 4    | `frontend-nextjs`  | `:3000` |
| 5    | `minio`            | `:9005` |
| 6    | `minio-console`    | `:9001` |

### Local Docker Compose

Goal: run the full stack locally with open-source services:

- **S3** -> **MinIO**
- **ECS/ECR** -> local Docker runner (via Docker socket)
- **Redis** stays Redis

High-level flow:
1. API receives a repo URL and project slug.
2. API launches a build container locally.
3. Build container uploads static output to MinIO.
4. Reverse proxy serves `{slug}.localhost:8000` from MinIO.

Setup:
1. Build the build-server image (used by the API to run builds):
   - `docker compose build build-server`
2. Start the stack:
   - `docker compose up --build`

Build server env vars (passed by the API):
1. `PROJECT_ID`
2. `GIT_REPOSITORY__URL`
3. `REDIS_URL`
4. `S3_BUCKET`
5. `S3_ENDPOINT` (MinIO hostname, e.g. `minio` or `localhost`)
6. `S3_PORT` (defaults to `9000`)
7. `S3_USE_SSL` (defaults to `false`)
8. `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`
9. `S3_REGION` (defaults to `us-east-1`)

Notes:
- The API requires access to the Docker socket. If your compose project name isn’t `vercel-clone`, set `DOCKER_NETWORK` to match your network (e.g. `yourproject_default`).
- The frontend proxies `/api/project` to `INTERNAL_API_URL` (defaults to `http://api-server:9000` in compose).
- Deploy logs are polled by default. Set `NEXT_PUBLIC_SOCKET_ENABLED=true` if you want to use the socket stream on port `9002`.
- MongoDB is used to store deployments; compose provides it at `mongodb://mongo:27017/vercel_clone`.

### GitHub OAuth

Set these environment variables to enable GitHub login with **repo** scope:
1. `GITHUB_CLIENT_ID`
2. `GITHUB_CLIENT_SECRET`
3. `GITHUB_REDIRECT_URI` (optional, defaults to `http://localhost:3000/api/auth/github/callback`)

Use `/login` to authorize; `/github` and `/repos` redirect to `/projects/new`.

Frontend route flow:
1. `/` - landing page
2. `/login` - GitHub OAuth page
3. `/dashboard` - deployment history + New repo button
4. `/projects/new` - repository selection and deployment creation
5. `/projects/:id` - deployment details with logs and status

### Demo

[Watch The Demo Video](https://imgur.com/I6KgmNR)

### Architecture

![Vercel Clone Architecture](https://i.imgur.com/r7QUXqZ.png)
