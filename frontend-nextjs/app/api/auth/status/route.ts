import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("github_access_token");
  return NextResponse.json({ authenticated: Boolean(token) });
}
