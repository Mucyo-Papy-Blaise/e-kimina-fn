import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    framework: "Next.js 16 App Router",
    runtime: "React 19",
    language: "TypeScript",
    queryLibrary: "@tanstack/react-query",
    generatedAt: new Date().toISOString(),
  });
}
