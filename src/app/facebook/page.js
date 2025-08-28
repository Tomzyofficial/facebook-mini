"use server";
import { UserProfile } from "@/components/User-profile";
import { verifySession } from "@/app/_lib/session";

import { redirect } from "next/navigation";

export default async function CheckSession() {
  const session = await verifySession();

  if (!session || !session.userId) {
    redirect("/");
  }

  return (
    <>
      {/* Receive UserProfile function and assign props to the appropriate variables */}
      <UserProfile />
    </>
  );
}
