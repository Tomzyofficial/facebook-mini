import { verifySession } from "@/app/_lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await verifySession();
  if (!session || !session.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }
  return NextResponse.json({ authenticated: true, userId: session.userId });
}
