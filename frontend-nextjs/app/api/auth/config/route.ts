import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri =
    process.env.GITHUB_REDIRECT_URI ||
    new URL("/api/auth/github/callback", request.url).toString();

  return NextResponse.json({
    configured: Boolean(clientId),
    redirectUri,
  });
}
