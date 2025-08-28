import { verifySession } from "@/app/_lib/session";
import pool from "@/app/_lib/db";
import { NextResponse } from "next/server";
import { PusherServer } from "@/app/api/pusher-config";

// This component is the API endpoint that allows sending friend request
export async function POST(req) {
  const pusher = PusherServer();

  const session = await verifySession();
  if (!session.userId || !session.authenticated) return NextResponse.json({ authenticated: false }, { status: 403 });

  // Retrieve the to_user_id query string from the fetch endpoint in Others-profile file
  const { searchParams } = new URL(req.url);
  const to_user_id = searchParams.get("to_user_id");

  if (!to_user_id) {
    return new Response(JSON.stringify({ success: false, message: "Missing user ID" }), { status: 400 });
  }

  const requestQuery = await pool.query("INSERT INTO public.friend_requests (from_user_id, to_user_id, friend_request_status) VALUES ($1, $2, $3) RETURNING *", [session.userId, to_user_id, "PENDING"]);

  if (!requestQuery || requestQuery.rows.length < 1) return NextResponse.json({ success: false, message: "Friend request failed" }, { status: 404 });

  // Retrieve last friend request just created: from_user_id -> sender=session.userId and to_user_id -> receiver=to_user_id (from the query param)
  const retrievedRequest = await pool.query(
    `SELECT fr.from_user_id, fr.to_user_id, u.fname, u.lname FROM public.friend_requests AS fr JOIN public.users AS u ON fr.from_user_id = u.id WHERE fr.from_user_id = $1 AND fr.to_user_id = $2 ORDER BY fr.created_at DESC LIMIT 1`,
    [session.userId, to_user_id]
  );
  // Trigger the pusher socket to send friend request notification to the receiver
  await pusher.trigger(`user-${to_user_id}`, "new-request", retrievedRequest.rows[0]);

  return NextResponse.json({ success: true, message: "Friend request sent" }, { status: 201 });
}

// This component is the API endpoint that allows sender of the friend request to Cancel the friend request
export async function DELETE(req) {
  const pusher = PusherServer();

  const session = await verifySession();
  if (!session.userId || !session.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }

  // Retrieve the to_user_id query string from the fetch endpoint in Others-profile file
  const { searchParams } = new URL(req.url);
  const to_user_id = searchParams.get("to_user_id");

  if (!to_user_id) {
    return NextResponse.json({ success: false, message: "Missing user ID" }, { status: 400 });
  }

  // Delete the friend request from the table. If the sender of the request decide to cancel the req. from_user_id -> sender=session.userId and to_user_id -> receiver=to_user_id (from the query param)
  const { rows } = await pool.query(
    `DELETE FROM public.friend_requests WHERE from_user_id = $1
    AND to_user_id = $2 AND friend_request_status IN ($3, $4) RETURNING to_user_id`,
    [session.userId, to_user_id, "PENDING", "ACCEPTED"]
  );

  if (rows.length > 0) {
    await pusher.trigger(`user-${to_user_id}`, "request-cancelled", {
      to_user_id: Number(to_user_id),
      from_user_id: session.userId,
    });

    return NextResponse.json({ success: true, message: "Friend request cancelled" }, { status: 200 });
  }
}

// This component is the API endpoint that allows receiver to accept friend request
export async function PATCH(req) {
  const pusher = PusherServer();

  const session = await verifySession();
  if (!session.userId || !session.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }

  // Retrieve the from_user_id query string from the fetch endpoint in Notification file
  const { searchParams } = new URL(req.url);
  const from_user_id = searchParams.get("from_user_id");

  if (!from_user_id) {
    return new Response(JSON.stringify({ success: false, message: "Missing user ID" }), { status: 400 });
  }

  // Update the friend request: set ACCEPTED where from_user_id = sender, to_user_id = acceptor
  // When accepting a friend request, session.userId is the receiver (acceptor), and from_user_id (from query param) is the sender.
  // So the UPDATE should match: from_user_id = from_user_id (sender), to_user_id = session.userId (acceptor).
  await pool.query("UPDATE public.friend_requests SET friend_request_status = $1 WHERE from_user_id = $2 AND to_user_id = $3 AND friend_request_status = $4", ["ACCEPTED", from_user_id, session.userId, "PENDING"]);

  // Retrieve the updated friend request. join the users table on fr table to match the fr.to_user_id info
  // from_user_id -> sender=from_user_id (from the query param), to_user_id -> acceptator=session.userId
  const selectQuery = await pool.query(
    "SELECT fr.from_user_id, fr.to_user_id, u.fname, u.lname FROM public.friend_requests AS fr JOIN public.users AS u ON fr.to_user_id = u.id WHERE fr.friend_request_status = $1 AND fr.from_user_id = $2 AND fr.to_user_id = $3 ORDER BY fr.created_at DESC LIMIT 1",
    ["ACCEPTED", from_user_id, session.userId]
  );

  if (!selectQuery || selectQuery.rows.length < 1) {
    return NextResponse.json({ success: false, message: "No accepted request found", result: [] }, { status: 404 });
  } else {
    console.log(`user ${selectQuery.rows[0].fname} accepted the request from ${from_user_id}`);

    // Trigger Pusher
    await pusher.trigger(`user-${session.userId}`, "request-accepted", {
      to_user_id: session.userId,
    });

    return NextResponse.json({ success: true, result: selectQuery.rows }, { status: 200 });
  }
}

// This component is the API endpoint that retrieves all the accepted friend requests
export async function GET(req) {
  const session = await verifySession();
  if (!session.userId || !session.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }

  // Retrieve the from_user_id query string from the fetch endpoint in Notification file
  const { searchParams } = new URL(req.url);
  const from_user_id = searchParams.get("from_user_id");

  // Only allow the current user to fetch their own accepted requests
  if (!from_user_id) {
    return NextResponse.json({ success: false, message: "Invalid or missing user ID" }, { status: 400 });
  }

  // Fetch all accepted requests sent by current user. Join the users table on the fr.to_user_id column. This enables us retrieve the acceptator's info
  const selectQuery = await pool.query(
    "SELECT fr.from_user_id, fr.to_user_id, u.fname, u.lname FROM public.friend_requests AS fr JOIN public.users AS u ON fr.to_user_id = u.id WHERE fr.friend_request_status = $1 AND fr.from_user_id = $2 ORDER BY fr.created_at DESC",
    ["ACCEPTED", session.userId]
  );

  if (!selectQuery || selectQuery.rows.length < 1) {
    return NextResponse.json({ success: false, message: "No accepted requests found", result: [] }, { status: 404 });
  }

  return NextResponse.json({ success: true, result: selectQuery.rows }, { status: 200 });
}

// This component is the API endpoint that allows receiver to decline friend request
export async function PUT(req) {
  const session = await verifySession();
  if (!session.userId || !session.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }

  // Retrieve the from_user_id query string from the fetch endpoint in Notification file
  const { searchParams } = new URL(req.url);
  const from_user_id = searchParams.get("from_user_id");

  if (!from_user_id) {
    return NextResponse.json({ success: false, message: "Missing user ID" }, { status: 400 });
  }

  // Delete the friend request when receiver declines it
  // from_user_id = sender, to_user_id = receiver (session.userId)
  const { rows } = await pool.query(
    `DELETE FROM public.friend_requests WHERE from_user_id = $1
    AND to_user_id = $2 AND friend_request_status = $3 RETURNING from_user_id`,
    [from_user_id, session.userId, "PENDING"]
  );

  if (rows.length > 0) {
    // await pusher.trigger(`user-${from_user_id}`, "request-declined", {
    //   from_user_id: Number(from_user_id),
    //   to_user_id: session.userId,
    // });

    return NextResponse.json({ success: true, message: "Friend request declined" }, { status: 200 });
  } else {
    return NextResponse.json({ success: false, message: "No pending request found to decline" }, { status: 404 });
  }
}
