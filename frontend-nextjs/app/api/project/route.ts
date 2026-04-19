import { NextResponse } from "next/server";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:9000";

export async function POST(request: Request) {
  const body = await request.text();

  try {
    const response = await fetch(`${INTERNAL_API_URL}/project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const responseBody = await response.text();
    const contentType =
      response.headers.get("content-type") || "application/json";

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: "Failed to reach API server" },
      { status: 502 }
    );
  }
}
