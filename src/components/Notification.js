"use client";
import { useCallback, useEffect, useState } from "react";
import { PusherClient } from "@/app/api/pusher-config";

export function Notification() {
  const [validRequest, setValidRequest] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [requestAccepted, setRequestAccepted] = useState([]);
  const [acceptLoading, setacceptLoading] = useState(false);
  const [declineLoading, setDeclineLoading] = useState(false);

  // Fetch session from checkSession API
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/checkSession");
        const data = await res.json();
        if (data.authenticated) {
          setCurrentUserId(data.userId);
        }
      } catch (err) {
        console.error("Failed to load session", err);
        setCurrentUserId(null);
      }
    };
    fetchSession();
  }, []);

  // Fetch all friend requests for a specific user
  const fetchFriendRequests = useCallback(async (toUserId) => {
    if (!toUserId) {
      setValidRequest([]);
      return;
    }

    try {
      const res = await fetch(`/api/friendRequestCheck?to_user_id=${toUserId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setValidRequest([]);
        return;
      }

      setValidRequest(data.result);
    } catch (err) {
      console.error("Error fetching friend requests: ", err);
      setValidRequest([]);
    }
  }, []);

  // Real-time notifications with Pusher for new friend requests
  useEffect(() => {
    if (!currentUserId) return;

    fetchFriendRequests(currentUserId);

    const pusher = PusherClient();
    const channel = pusher.subscribe(`user-${currentUserId}`);

    channel.bind("new-request", (data) => {
      if (data.to_user_id === currentUserId) {
        setValidRequest((prev) => [data, ...prev]);
      }
    });

    // Clean up
    return () => {
      pusher.unsubscribe(`user-${currentUserId}`);
      pusher.disconnect();
    };
  }, [currentUserId, fetchFriendRequests]);

  // Accept friend request
  // Now, we need to PATCH using the *sender's* user id (from_user_id), not the current user id (acceptor).
  // So, handleRequestAccept should take the sender's id as argument.
  const handleRequestAccept = async (fromUserId) => {
    try {
      if (currentUserId && fromUserId) {
        setacceptLoading(true);
        // PATCH to update the friend request status: from_user_id=sender, to_user_id=acceptor (currentUserId)
        const res = await fetch(`/api/friendRequest?from_user_id=${fromUserId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          // Remove the accepted request from the UI
          setValidRequest((prev) => prev.filter((req) => req.from_user_id !== fromUserId));
          setacceptLoading(false);
        }
      }
    } catch (error) {
      console.error("Error occurred while accepting friend request: ", error.message);
      setValidRequest([]);
      setacceptLoading(false);
    }
  };

  // Real time notification update to remove the accepted friend req
  useEffect(() => {
    if (!currentUserId) return;

    const pusher = PusherClient();
    const channel = pusher.subscribe(`user-${currentUserId}`);

    channel.bind("request-accepted", ({ to_user_id }) => {
      // Remove requests where to_user_id matches current user (acceptor)
      setValidRequest((prev) => prev.filter((req) => req.to_user_id !== to_user_id));
    });

    // Clean up
    return () => {
      pusher.unsubscribe(`user-${currentUserId}`);
      pusher.disconnect();
    };
  }, [currentUserId, handleRequestAccept]);

  // This component fetches all the accepted friend request for a specific user
  const getAcceptedFriendReq = useCallback(async (fromUserId) => {
    if (!fromUserId) {
      setRequestAccepted([]);
      return;
    }

    try {
      const res = await fetch(`/api/friendRequest?from_user_id=${fromUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setRequestAccepted([]);
        return;
      }

      setValidRequest((prev) => prev.filter((req) => req.from_user_id !== fromUserId));
      setRequestAccepted(data.result);
    } catch (err) {
      console.error("Error getting accepted friend requests: ", err);
      setRequestAccepted([]);
    }
  }, []);

  // This component invokes the getAcceptedFriendReq fn
  useEffect(() => {
    if (currentUserId) {
      getAcceptedFriendReq(currentUserId);
    }
  }, [getAcceptedFriendReq, currentUserId]);

  // When the req receiver decline friend request remove the notification.
  const handleRequestDecline = async (fromUserId) => {
    try {
      if (fromUserId) {
        setDeclineLoading(true);
        const res = await fetch(`/api/friendRequest?from_user_id=${fromUserId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setValidRequest((prev) => prev.filter((req) => req.from_user_id !== fromUserId));
          setDeclineLoading(false);
        }
      }
    } catch (error) {
      console.error("Error occurred with declining friend request: ", error);
      setDeclineLoading(false);
    }
  };

  // Real time notification when the sender of the requet deletes it
  useEffect(() => {
    if (!currentUserId) return;

    const pusher = PusherClient();
    const channel = pusher.subscribe(`user-${currentUserId}`);

    channel.bind("request-cancelled", ({ from_user_id, to_user_id }) => {
      if (to_user_id !== currentUserId) return;

      // This filter operation handles which notification to return. For example, when user A cancels user B req, user B loses the req sent by user A while other users notification remains untouched.
      setValidRequest((prev) => prev.filter((req) => !(req.from_user_id === from_user_id && req.to_user_id === to_user_id)));
    });

    return () => {
      pusher.unsubscribe(`user-${currentUserId}`);
      pusher.disconnect();
    };
  }, [currentUserId]);

  return (
    <section className="top-0 left-0 fixed overflow-y-auto pb-10 bg-white h-full w-full">
      {Array.isArray(validRequest) && validRequest.length > 0 && (
        <div>
          {validRequest.map((req, idx) => (
            <div key={idx} className="p-2 border-b">
              <p>
                {req.fname && req.fname.charAt(0).toUpperCase() + req.fname.slice(1)} {req.lname && req.lname.charAt(0).toUpperCase() + req.lname.slice(1)} sent you a friend request
              </p>
              <button disabled={acceptLoading} className={`cursor-pointer mr-2 bg-green-500 text-white px-2 py-1 rounded ${acceptLoading ? "opacity-50 cursor-wait" : ""}`} onClick={() => handleRequestAccept(req.from_user_id)}>
                Accept
              </button>
              <button disabled={declineLoading} className={`bg-red-500 text-white px-2 py-1 rounded cursor-pointer ${declineLoading ? "opacity-50 cursor-wait" : ""}`} onClick={() => handleRequestDecline(req.from_user_id)}>
                Decline
              </button>
            </div>
          ))}
        </div>
      )}

      {Array.isArray(requestAccepted) && requestAccepted.length > 0 && (
        <div>
          {requestAccepted.map((req, idx) => (
            <div key={idx} className="p-2 border-b">
              <p>
                {req.fname && req.fname.charAt(0).toUpperCase() + req.fname.slice(1)} {req.lname && req.lname.charAt(0).toUpperCase() + req.lname.slice(1)} accepted your friend request
              </p>
            </div>
          ))}
        </div>
      )}

      {!validRequest?.length && !requestAccepted?.length && <div className="p-2">No notifications</div>}
    </section>
  );
}
