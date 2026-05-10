# DeployKit (Vercel Clone)

> Self-hosted Vercel-like platform that builds GitHub repos, stores static artifacts in S3-compatible storage, and serves them via a reverse proxy.

## 📋 Table of Contents
- [1. Project Overview](#1-project-overview)
- [2. Tech Stack](#2-tech-stack)
- [3. Features](#3-features)
- [4. Project Structure](#4-project-structure)
- [5. Architecture Overview](#5-architecture-overview)
- [6. Database Design](#6-database-design)
- [7. API Reference](#7-api-reference)
- [8. Setup & Installation](#8-setup--installation)
- [9. Scripts Reference](#9-scripts-reference)
- [10. CI/CD Pipeline](#10-cicd-pipeline)
- [11. Deployment](#11-deployment)
- [12. Known Issues / Limitations](#12-known-issues--limitations)
- [13. Future Improvements](#13-future-improvements)
- [14. Contributing](#14-contributing)
- [15. License](#15-license)

---

## 1. Project Overview
- This project is a Vercel-style deployment platform that accepts a GitHub repository URL, builds the repo in an isolated runner, uploads static artifacts to MinIO (S3-compatible), and serves them via a host-based reverse proxy.
- It is built for developers who want a self-hosted deployment flow similar to Vercel but running on local or private infrastructure.
- Current status: Demo/prototype. Several UI sections use mock data and some backend integrations are partial.

## 2. Tech Stack
| Category | Technology |
| --- | --- |
| Language | JavaScript (Node.js), TypeScript, Shell |
| Frontend Framework | Next.js 14 (App Router) |
| Backend Framework | Express |
| Database | MongoDB |
| Cache / PubSub | Redis (log streaming) |
| Object Storage | MinIO (S3-compatible) |
| Auth | GitHub OAuth (cookie-based token) |
| UI | Tailwind CSS, Radix UI, shadcn UI, lucide-react, framer-motion, recharts |
| DevOps | Docker, Docker Compose, Supervisor |
| Testing | Node.js built-in test runner (`node --test`) |
| Tooling | npm, ESLint, TypeScript, PostCSS, Autoprefixer |

## 3. Features
- GitHub OAuth sign-in with repo scope and cookie-based session.
- GitHub repo browser and deployment creation UI.
- REST API to queue a build and return a project slug + preview URL.
- Build runner that clones a Git repo, runs `npm install` and `npm run build`, and uploads `dist` artifacts to MinIO.
- Reverse proxy that maps `{slug}.localhost:8000` to MinIO objects and serves `index.html` at `/`.
- Deployment metadata stored in MongoDB with status tracking.
- Redis pub/sub log streaming; API server buffers the last 500 log lines in memory.
- Project dashboard with filtering, status pills, and deployment pipeline UI.
- Command palette (Cmd/Ctrl+K) for quick navigation.
- All-in-one Docker image that runs MongoDB, Redis, MinIO, API server, reverse proxy, and frontend in one container.
- Demo-only sections for analytics, billing, domains, settings, and activity.

## 4. Project Structure
```text
.
├── api-server/                 # Express API to queue builds and stream logs
│   ├── index.js                # REST API + Socket.IO + Redis log subscription
│   ├── config.js               # Environment parsing/validation
│   └── Dockerfile              # API server image
├── build-server/               # Build runner for cloning and uploading artifacts
│   ├── main.sh                 # Clone repo and run build script
│   ├── script.js               # Build + MinIO upload + log publish
│   └── Dockerfile              # Build runner image
├── s3-reverse-proxy/           # Host-based reverse proxy for static outputs
│   └── index.js                # Proxy requests to MinIO per subdomain
├── frontend-nextjs/            # Next.js UI + API routes
│   ├── app/                    # App Router pages and API endpoints
│   ├── components/             # App and UI components
│   ├── lib/                    # MongoDB + GitHub helpers
│   ├── public/                 # Frontend assets (SVGs)
│   └── static/                 # Demo video asset
├── single-image/               # Supervisor and init scripts for all-in-one image
├── static/                     # Misc assets (diagram image)
├── docker-compose.yml          # Local multi-container stack
├── Dockerfile.all-in-one       # Single-container stack
├── .env                        # Local env values (contains secrets)
├── README.md                   # Setup and architecture notes
└── report.md                   # Existing report (older)
```

## 5. Architecture Overview
- **Style:** Multi-service architecture with separate API server, build runner, reverse proxy, and frontend UI. Infrastructure services (MongoDB, Redis, MinIO) run alongside.
- **Runtime modes:**
  - Docker Compose (multi-container) with the API server launching build containers via Docker socket.
  - All-in-one container using Supervisor and local build runner mode.
- **Data flow (deployment):**
  1. UI calls Next.js API `POST /api/project` with `gitURL`.
  2. Next API proxies to API server `POST /project`.
  3. API server starts a build runner (Docker container or local process).
  4. Build runner clones repo, runs build, uploads `dist` to MinIO under `__outputs/<PROJECT_ID>`.
  5. Reverse proxy serves `http://<slug>.localhost:8000` from MinIO.
- **Data flow (logs):**
  - Build runner publishes logs to Redis `logs:<PROJECT_ID>`.
  - API server subscribes to Redis, buffers last 500 lines, and exposes `GET /logs/:projectId`.
  - UI attempts to poll `/api/logs/:projectSlug` (see Known Issues).
- **Patterns:** Pub/sub for logs, reverse-proxy pattern for static serving, service-per-component for runtime services.

## 6. Database Design
MongoDB is used with a single `deployments` collection. There is no formal schema or migrations; the structure is implied by inserts/updates.

**Collection: `deployments`**
- **Purpose:** Store deployment metadata and status per user.
- **Key fields:**
  - `_id` (ObjectId)
  - `ownerLogin` (GitHub username)
  - `repoUrl` (Git repository URL)
  - `repoFullName` (owner/name, nullable)
  - `projectSlug` (slug used for subdomain)
  - `previewUrl` (derived preview URL)
  - `status` (`queued`, `building`, `uploading`, `ready`, `failed`)
  - `latestLog` (last known log line)
  - `createdAt`, `updatedAt` (timestamps)
- **Relationships:** None defined.

## 7. API Reference

### API Server (port 9000)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| POST | /project | Queue a build for a Git repo and return `projectSlug` and preview URL | No |
| GET | /logs/:projectId?since= | Fetch buffered logs with cursor-based paging | No |

**Socket.IO (port 9002)**
- Namespace: default
- Emits log messages to channels named `logs:<PROJECT_ID>`

### Next.js API Routes (frontend-nextjs)
**Auth**
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | /api/auth/config | Returns OAuth configuration status and callback URL | No |
| GET | /api/auth/github | Redirects to GitHub OAuth | No |
| GET | /api/auth/github/callback | Exchanges code for token and sets cookie | No |
| GET | /api/auth/status | Returns `{ authenticated: boolean }` | No |
| POST | /api/auth/logout | Clears auth cookie | No |

**GitHub**
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | /api/github/user | Fetches GitHub user profile | Yes |
| GET | /api/github/repos | Fetches GitHub repositories | Yes |

**Deployments**
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| POST | /api/project | Starts a deployment and creates DB record | Yes |
| GET | /api/deployments | Lists deployments for current user | Yes |
| GET | /api/deployments/:id | Fetches a single deployment by id | Yes |

### Reverse Proxy (port 8000)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | /* | Proxies requests to MinIO based on subdomain | No |

## 8. Setup & Installation

### Prerequisites
- Node.js 20.x (used in Dockerfiles and local runtime)
- npm (or yarn)
- Git
- Docker + Docker Compose (for containerized setup)
- MongoDB 7 (if running without Docker)
- Redis 7 (if running without Docker)
- MinIO (S3-compatible) for artifact storage

### Local Development (without Docker)
1. Clone the repo and install dependencies in each service:
   ```bash
   cd api-server && npm install
   cd ../build-server && npm install
   cd ../s3-reverse-proxy && npm install
   cd ../frontend-nextjs && npm install
   ```
2. Start MongoDB, Redis, and MinIO locally.
3. Create a MinIO bucket (default `vercel-clone-outputs`) and allow public download.
4. Create a `.env` file in the repo root with required variables (see table below).
5. Start the API server:
   ```bash
   cd api-server
   node index.js
   ```
6. Start the reverse proxy:
   ```bash
   cd s3-reverse-proxy
   node index.js
   ```
7. Start the frontend:
   ```bash
   cd frontend-nextjs
   npm run dev
   ```
8. For build runner in local mode, set:
   - `BUILD_RUNNER_MODE=local`
   - `BUILD_SERVER_PATH=/path/to/build-server`

### Local Development (with Docker)
1. Build the build-runner image (used by the API to run builds):
   ```bash
   docker compose build build-server
   ```
2. Start the full stack:
   ```bash
   docker compose up --build
   ```

### Environment Variables
| Variable | Description | Example Value | Required |
| --- | --- | --- | --- |
| GITHUB_CLIENT_ID | GitHub OAuth client id | `your_github_client_id` | Yes (auth) |
| GITHUB_CLIENT_SECRET | GitHub OAuth client secret | `your_github_client_secret` | Yes (auth) |
| GITHUB_REDIRECT_URI | OAuth callback URL | `http://localhost:3000/api/auth/github/callback` | No |
| MONGODB_URI | Mongo connection string | `mongodb://mongo:27017/vercel_clone` | Yes (frontend API) |
| MONGODB_DB | Mongo database name | `vercel_clone` | No |
| REDIS_URL | Redis connection string | `redis://redis:6379` | Yes (API/build) |
| S3_BUCKET | Bucket for build artifacts | `vercel-clone-outputs` | Yes |
| S3_ENDPOINT | MinIO host | `minio` | Yes |
| S3_PORT | MinIO port | `9000` | No |
| S3_USE_SSL | Whether to use TLS for S3 | `false` | No |
| S3_ACCESS_KEY_ID | MinIO access key | `minio` | Yes |
| S3_SECRET_ACCESS_KEY | MinIO secret key | `minio123` | Yes |
| S3_REGION | S3 region for bucket | `us-east-1` | No |
| BUILD_RUNNER_MODE | Build runner mode (`docker` or `local`) | `docker` | No |
| BUILD_SERVER_IMAGE | Docker image for build runner | `vercel-clone-build-server:local` | No |
| BUILD_SERVER_PATH | Local path to build-server (local mode) | `/app/build-server` | No |
| DOCKER_SOCKET_PATH | Docker socket path for API server | `/var/run/docker.sock` | No |
| DOCKER_NETWORK | Docker network for build containers | `vercel-clone_default` | No |
| OUTPUTS_BASE_URL | Base URL for proxy to MinIO outputs | `http://minio:9000/vercel-clone-outputs/__outputs` | No |
| INTERNAL_API_URL | API server base URL for Next API | `http://api-server:9000` | No |
| NEXT_PUBLIC_API_URL | Public API base URL | `http://localhost:9000` | No |
| NEXT_PUBLIC_SOCKET_URL | Socket.IO URL | `http://localhost:9002` | No |
| NEXT_PUBLIC_SOCKET_ENABLED | Enable socket streaming in UI | `false` | No |
| MINIO_ROOT_USER | MinIO root user (all-in-one) | `minio` | No |
| MINIO_ROOT_PASSWORD | MinIO root password (all-in-one) | `minio123` | No |
| PROJECT_ID | Build runner project slug (injected by API) | `my-app-abc123` | Yes (build) |
| GIT_REPOSITORY__URL | Git repo URL (injected by API) | `https://github.com/org/repo` | Yes (build) |
| OUTPUT_DIR | Local build output working dir | `/tmp/build-output` | No |

## 9. Scripts Reference
| Script | Command | Description |
| --- | --- | --- |
| api-server:test | `node --test` | Run API server tests |
| build-server:test | `node --test` | Run build server tests |
| s3-reverse-proxy:test | `echo "Error: no test specified" && exit 1` | Placeholder test script |
| frontend-nextjs:dev | `next dev` | Start Next.js dev server |
| frontend-nextjs:build | `next build` | Build Next.js app |
| frontend-nextjs:start | `next start` | Run Next.js production server |
| frontend-nextjs:lint | `next lint` | Lint frontend code |

## 10. CI/CD Pipeline
- No CI/CD workflows were found in `.github/workflows`.

## 11. Deployment
- **Docker Compose (recommended for local/self-hosted):** Runs MongoDB, Redis, MinIO, API server, reverse proxy, and frontend together. The API server uses Docker socket access to run build containers.
- **All-in-one image:** Use Dockerfile.all-in-one to build a single container that runs all services via Supervisor. This runs the build runner in local mode without a Docker socket.
- **Production considerations:**
  - Use external MongoDB/Redis/MinIO services or managed equivalents.
  - Protect the API server endpoints (currently unauthenticated).
  - Use HTTPS for the frontend and reverse proxy.
  - Ensure MinIO bucket policies and credentials are locked down.

## 12. Known Issues / Limitations
- The UI polls `/api/logs/:projectSlug`, but the source route `app/api/logs/[projectId]/route.ts` is missing. Logs will 404 after a fresh build unless the route is restored.
- Build runner expects a `dist` folder and hardcodes `npm install && npm run build`. Frameworks that output `.next` or `build` will fail unless adapted.
- Advanced build settings (build command, output dir, env vars) are collected in the UI but not passed to the build runner logic.
- Log storage is in-memory only on the API server (last 500 lines); logs are lost on restart.
- Several UI sections (analytics, deployments history, env vars, billing, activity, domains, settings) are demo-only and use mock data.
- The repo includes a checked-in `.env` with OAuth values, which is unsafe for real deployments.
- Build artifacts appear in the workspace (`frontend-nextjs/.next`, `tsconfig.tsbuildinfo`), which should be ignored in source control.

## 13. Future Improvements
- Implement the missing Next.js logs API route and wire it to the API server.
- Support configurable build commands, install commands, and output directories.
- Persist logs to MongoDB or object storage for durability.
- Add a build queue and concurrency control for multiple deployments.
- Integrate Socket.IO client in the UI for real-time logs.
- Add real domain management and DNS validation.
- Introduce authentication/authorization for API server endpoints.

## 14. Contributing
- Fork the repository.
- Create a feature branch.
- Commit changes with clear messages.
- Open a pull request with a concise description and screenshots if applicable.

## 15. License
Not specified.
