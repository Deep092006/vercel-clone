import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
import { fetchGitHubUser } from "@/lib/github";

export async function GET() {
  const token = cookies().get("github_access_token")?.value;
  if (!token) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 }
    );
  }

  const user = await fetchGitHubUser(token);
  const db = await getDb();
  const deployments = await db
    .collection("deployments")
    .find({ ownerLogin: user.login })
    .sort({ createdAt: -1 })
    .toArray();

  const serialized = deployments.map((deployment) => ({
    ...deployment,
    _id: deployment._id?.toString(),
    createdAt: deployment.createdAt?.toISOString?.() || deployment.createdAt,
  }));

  return NextResponse.json(serialized);
}
