import Pusher from "pusher";

import Push from "pusher-js";

// This is for server component
export function PusherServer() {
  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  });

  return pusher;
}

// This is for client component
export function PusherClient() {
  const pusher = new Push(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  });

  return pusher;
}
