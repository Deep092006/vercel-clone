"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github } from "lucide-react";
import { Fira_Code } from "next/font/google";
import axios from "axios";
import { useSearchParams } from "next/navigation";

const firaCode = Fira_Code({ subsets: ["latin"] });

type Repo = {
  id: number;
  full_name: string;
  html_url: string;
  private: boolean;
  description?: string | null;
  language?: string | null;
};

type UserProfile = {
  login: string;
  name?: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
};

const getBaseOrigin = () => {
  if (typeof window === "undefined") return "http://localhost";
  return `${window.location.protocol}//${window.location.hostname}`;
};

export default function ReposPage() {
  const searchParams = useSearchParams();
  const baseOrigin = getBaseOrigin();
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || `${baseOrigin}:9002`;
  const socketEnabled = process.env.NEXT_PUBLIC_SOCKET_ENABLED === "true";
  const socket = useMemo(() => {
    if (!socketEnabled) return null;
    return io(socketUrl, {
      transports: ["websocket", "polling"],
    });
  }, [socketEnabled, socketUrl]);

  const [repoURL, setURL] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [deployStatus, setDeployStatus] = useState<string | undefined>();
  const [pendingPreviewURL, setPendingPreviewURL] = useState<
    string | undefined
  >();
  const [deployPreviewURL, setDeployPreviewURL] = useState<
    string | undefined
  >();
  const [usePolling, setUsePolling] = useState(false);

  const [repos, setRepos] = useState<Repo[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const logContainerRef = useRef<HTMLElement>(null);
  const pendingPreviewURLRef = useRef<string | undefined>();
  const logCursorRef = useRef(0);

  useEffect(() => {
    pendingPreviewURLRef.current = pendingPreviewURL;
  }, [pendingPreviewURL]);

  useEffect(() => {
    const repoParam = searchParams.get("repo");
    if (repoParam && !repoURL) {
      setURL(repoParam);
    }
  }, [repoURL, searchParams]);

  useEffect(() => {
    if (selectedRepo?.html_url) {
      setURL(selectedRepo.html_url);
    }
  }, [selectedRepo]);

  useEffect(() => {
    const load = async () => {
      try {
        const status = await fetch("/api/auth/status").then((res) => res.json());
        const isAuthed = Boolean(status?.authenticated);
        setAuthenticated(isAuthed);
        if (!isAuthed) return;

        const [userRes, repoRes] = await Promise.all([
          fetch("/api/github/user"),
          fetch("/api/github/repos"),
        ]);

        if (!userRes.ok || !repoRes.ok) {
          throw new Error("Failed to load GitHub data");
        }

        const userData = await userRes.json();
        const repoData = await repoRes.json();
        setProfile(userData);
        setRepos(Array.isArray(repoData) ? repoData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    load();
  }, []);

  const filteredRepos = useMemo(() => {
    const value = search.toLowerCase();
    return repos.filter((repo) => repo.full_name.toLowerCase().includes(value));
  }, [repos, search]);

  const isValidURL: [boolean, string | null] = useMemo(() => {
    if (!repoURL || repoURL.trim() === "") return [false, null];
    const regex = new RegExp(
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/
    );
    return [regex.test(repoURL), "Enter valid Github Repository URL"];
  }, [repoURL]);

  const handleClickDeploy = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await axios.post(`/api/project`, {
        gitURL: repoURL,
        slug: projectId,
        repoFullName: selectedRepo?.full_name,
      });

      if (data && data.data) {
        const { projectSlug, url } = data.data;
        setLogs([]);
        setDeployStatus("Queued");
        setPendingPreviewURL(url);
        setDeployPreviewURL(undefined);
        setProjectId(projectSlug);
        logCursorRef.current = 0;

        if (socket) {
          setUsePolling(false);
          socket.emit("subscribe", `logs:${projectSlug}`);
        } else {
          setUsePolling(true);
        }
      }
    } catch (error) {
      console.error("Failed to start deploy", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, repoURL, selectedRepo?.full_name, socket]);

  const processLogLine = useCallback((logLine: string) => {
    const normalized = typeof logLine === "string" ? logLine.trim() : "";

    if (normalized.startsWith("error:")) {
      setDeployStatus("Failed");
    } else if (
      normalized === "Build Started..." ||
      normalized === "Build Started"
    ) {
      setDeployStatus("Building");
    } else if (
      normalized === "Build Complete" ||
      normalized === "Starting to upload"
    ) {
      setDeployStatus("Uploading");
    } else if (normalized === "Done") {
      setDeployStatus("Ready");
      const pendingUrl = pendingPreviewURLRef.current;
      if (pendingUrl) setDeployPreviewURL(pendingUrl);
    }

    setLogs((prev) => [...prev, logLine]);
    logContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSocketIncommingMessage = useCallback(
    (message: string) => {
      const { log } = JSON.parse(message);
      processLogLine(log);
    },
    [processLogLine]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("message", handleSocketIncommingMessage);

    return () => {
      socket.off("message", handleSocketIncommingMessage);
    };
  }, [handleSocketIncommingMessage, socket]);

  useEffect(() => {
    if (!socket) return;
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handleConnect = () => setUsePolling(false);
    const handleConnectError = () => setUsePolling(true);
    const handleDisconnect = () => setUsePolling(true);

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!usePolling || !projectId) return;

    let canceled = false;

    const pollLogs = async () => {
      try {
        const response = await axios.get(
          `/api/logs/${projectId}?since=${logCursorRef.current}`
        );
        const { logs: newLogs, next } = response.data || {};

        if (!canceled && Array.isArray(newLogs) && newLogs.length > 0) {
          newLogs.forEach(processLogLine);
          if (typeof next === "number") {
            logCursorRef.current = next;
          }
        }
      } catch (error) {
        console.error("Failed to poll logs", error);
      }
    };

    pollLogs();
    const interval = setInterval(pollLogs, 2000);

    return () => {
      canceled = true;
      clearInterval(interval);
    };
  }, [processLogLine, projectId, usePolling]);

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="text-2xl" />
            <span className="font-semibold text-lg">Select a repo</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            {authenticated && profile ? (
              <Link href="/dashboard" className="flex items-center gap-2">
                <img
                  src={profile.avatar_url}
                  alt={profile.login}
                  className="h-8 w-8 rounded-full border border-slate-700"
                />
                <span className="text-sm text-slate-200">
                  {profile.name || profile.login}
                </span>
              </Link>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </header>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {authenticated === false && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
            <p className="text-sm text-slate-400">
              Connect GitHub to see your repositories and deploy.
            </p>
            <Button asChild className="mt-4">
              <Link href="/login">Connect GitHub</Link>
            </Button>
          </div>
        )}

        {authenticated && (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <div className="space-y-4">
              {profile && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.avatar_url}
                      alt={profile.login}
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">
                        {profile.name || profile.login}
                      </p>
                      <a
                        href={profile.html_url}
                        target="_blank"
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        @{profile.login}
                      </a>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 space-y-1">
                    <p>{profile.public_repos} public repos</p>
                    <p>{profile.followers} followers</p>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Repositories</h2>
                  <span className="text-xs text-slate-400">
                    {filteredRepos.length} shown
                  </span>
                </div>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search repos"
                />
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className={`w-full text-left border rounded-md px-3 py-2 transition ${
                        selectedRepo?.id === repo.id
                          ? "border-sky-500 bg-slate-900"
                          : "border-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{repo.full_name}</p>
                        {repo.private && (
                          <span className="text-xs text-slate-400">Private</span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-slate-400 mt-1">
                          {repo.description}
                        </p>
                      )}
                    </button>
                  ))}
                  {filteredRepos.length === 0 && (
                    <p className="text-sm text-slate-400">No repositories found.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl">
                <h2 className="text-lg font-semibold mb-4">Deploy a repo</h2>
                <Input
                  disabled={loading}
                  value={repoURL}
                  onChange={(e) => setURL(e.target.value)}
                  type="url"
                  placeholder="https://github.com/owner/repo"
                />
                <Button
                  onClick={handleClickDeploy}
                  disabled={!isValidURL[0] || loading || !authenticated}
                  className="w-full mt-3"
                >
                  {loading ? "In Progress" : "Deploy"}
                </Button>
                {!authenticated && (
                  <p className="text-xs text-slate-400 mt-2">
                    Connect GitHub to deploy.
                  </p>
                )}
                {deployStatus && (
                  <p className="mt-2 text-sm text-slate-200">
                    Status: {deployStatus}
                  </p>
                )}
                {deployPreviewURL && (
                  <div className="mt-3 bg-slate-900/70 py-4 px-3 rounded-lg">
                    <p className="text-sm">
                      Preview URL{" "}
                      <a
                        target="_blank"
                        className="text-sky-400 hover:underline"
                        href={deployPreviewURL}
                      >
                        {deployPreviewURL}
                      </a>
                    </p>
                  </div>
                )}
                {logs.length > 0 && (
                  <div
                    className={`${firaCode.className} text-sm text-green-500 logs-container mt-4 border border-slate-800 rounded-lg p-4 h-[260px] overflow-y-auto`}
                  >
                    <pre className="flex flex-col gap-1">
                      {logs.map((log, i) => (
                        <code
                          ref={logs.length - 1 === i ? logContainerRef : undefined}
                          key={i}
                        >{`> ${log}`}</code>
                      ))}
                    </pre>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
                <h3 className="font-semibold">Env setup</h3>
                <p className="text-sm text-slate-400">
                  Add a <code>.env</code> file in your repo if your app expects
                  variables at build time.
                </p>
                <div className="text-xs bg-slate-900 rounded-md p-3 font-mono text-slate-300">
                  VITE_API_URL=http://localhost:9000
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
