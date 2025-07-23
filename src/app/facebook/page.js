"use server";
import { UserProfile } from "@/components/user-profile";
import { verifySession } from "@/app/_lib/session";

import { redirect } from "next/navigation";
import { pool } from "@/app/_lib/db";

export default async function CheckSession() {
  const session = await verifySession();

  if (!session) {
    redirect("/");
  }

  // Fetch the user that's loggedIn from db that matches the query
  const query = "SELECT * FROM users WHERE id = ? AND fname IS NOT NULL AND gender IS NOT NULL AND lname IS NOT NULL";
  const [rows] = await pool.query(query, [session.userId]);
  const gender = rows[0];
  const fname = rows[0];
  const lname = rows[0];

  return (
    <>
      {/* Receive UserProfile function and assign props to the appropriate variables */}
      <UserProfile gender={gender} fname={fname} lname={lname} />
    </>
  );
}
