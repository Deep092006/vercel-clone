"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github } from "lucide-react";
import { Fira_Code } from "next/font/google";
import axios from "axios";
import Link from "next/link";

const firaCode = Fira_Code({ subsets: ["latin"] });

const getBaseOrigin = () => {
  if (typeof window === "undefined") return "http://localhost";
  return `${window.location.protocol}//${window.location.hostname}`;
};

export default function Home() {
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

  const logContainerRef = useRef<HTMLElement>(null);
  const pendingPreviewURLRef = useRef<string | undefined>();
  const logCursorRef = useRef(0);

  useEffect(() => {
    pendingPreviewURLRef.current = pendingPreviewURL;
  }, [pendingPreviewURL]);

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
          console.log(`Subscribing to logs:${projectSlug}`);
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
  }, [projectId, repoURL, socket]);

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
      console.log(`[Incomming Socket Message]:`, typeof message, message);
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
    <main className="flex justify-center items-center h-[100vh]">
      <div className="w-[600px]">
        <div className="flex justify-end gap-2 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/github">Repos</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">GitHub Login</Link>
          </Button>
        </div>
        <span className="flex justify-start items-center gap-2">
          <Github className="text-5xl" />
          <Input
            disabled={loading}
            value={repoURL}
            onChange={(e) => setURL(e.target.value)}
            type="url"
            placeholder="Github URL"
          />
        </span>
        <Button
          onClick={handleClickDeploy}
          disabled={!isValidURL[0] || loading}
          className="w-full mt-3"
        >
          {loading ? "In Progress" : "Deploy"}
        </Button>
        {deployStatus && (
          <p className="mt-2 text-sm text-slate-200">Status: {deployStatus}</p>
        )}
        {deployPreviewURL && (
          <div className="mt-2 bg-slate-900 py-4 px-2 rounded-lg">
            <p>
              Preview URL{" "}
              <a
                target="_blank"
                className="text-sky-400 bg-sky-950 px-3 py-2 rounded-lg"
                href={deployPreviewURL}
              >
                {deployPreviewURL}
              </a>
            </p>
          </div>
        )}
        {logs.length > 0 && (
          <div
            className={`${firaCode.className} text-sm text-green-500 logs-container mt-5 border-green-500 border-2 rounded-lg p-4 h-[300px] overflow-y-auto`}
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
    </main>
  );
}
