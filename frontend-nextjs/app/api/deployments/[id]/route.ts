import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
import { fetchGitHubUser } from "@/lib/github";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get("github_access_token")?.value;
    if (!token) {
      return NextResponse.json(
        { status: "error", error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { status: "error", error: "Invalid deployment id" },
        { status: 400 }
      );
    }

    const user = await fetchGitHubUser(token);
    const db = await getDb();
    const deployment = await db.collection("deployments").findOne({
      _id: new ObjectId(params.id),
      ownerLogin: user.login,
    });

    if (!deployment) {
      return NextResponse.json(
        { status: "error", error: "Deployment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...deployment,
      _id: deployment._id.toString(),
      createdAt: deployment.createdAt?.toISOString?.() || deployment.createdAt,
      updatedAt: deployment.updatedAt?.toISOString?.() || deployment.updatedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: "Failed to load deployment" },
      { status: 500 }
    );
  }
}
