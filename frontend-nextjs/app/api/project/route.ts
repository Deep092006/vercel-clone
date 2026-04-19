import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
import { fetchGitHubUser } from "@/lib/github";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:9000";

export async function POST(request: Request) {
  const token = cookies().get("github_access_token")?.value;
  if (!token) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = await request.text();
  let payload: {
    gitURL?: string;
    slug?: string;
    repoFullName?: string;
  };

  try {
    payload = JSON.parse(body);
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { gitURL, slug, repoFullName } = payload;
  if (!gitURL) {
    return NextResponse.json(
      { status: "error", error: "gitURL is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${INTERNAL_API_URL}/project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gitURL, slug }),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      return NextResponse.json(responseBody, { status: response.status });
    }

    const user = await fetchGitHubUser(token);
    const db = await getDb();

    await db.collection("deployments").insertOne({
      ownerLogin: user.login,
      repoUrl: gitURL,
      repoFullName: repoFullName || null,
      projectSlug: responseBody?.data?.projectSlug,
      previewUrl: responseBody?.data?.url,
      status: "queued",
      createdAt: new Date(),
    });

    return NextResponse.json(responseBody, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: "Failed to start deployment" },
      { status: 502 }
    );
  }
}
