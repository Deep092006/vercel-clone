import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { status: "error", error: "Missing GITHUB_CLIENT_ID" },
      { status: 400 }
    );
  }

  const redirectUri =
    process.env.GITHUB_REDIRECT_URI ||
    new URL("/api/auth/github/callback", request.url).toString();

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "repo");

  return NextResponse.redirect(authUrl.toString());
}
