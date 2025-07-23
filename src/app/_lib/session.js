"use server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secureKey = process.env.SESSION_SECRET_KEY;
if (!secureKey) {
  throw new Error("SESSION_SECRET_KEY environment variable is not set. Please add it to your .env file.");
}
const encodedKey = new TextEncoder().encode(secureKey);

/* This function creates a session for the user using the userId and the encoded key */
export async function createSession(userId) {
  const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 day
  const session = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(expiresAt).sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/* This function verifies the session using the encoded key */
export async function verifySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;

  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ["HS256"],
    });
    return { userId: payload.userId, authenticated: true };
  } catch (error) {
    console.error("Session verification failed:", error.message);
    return { userId: null, authenticated: false };
  }
}

/* This function deletes the session */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
