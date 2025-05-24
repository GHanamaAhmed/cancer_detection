import Pusher from "pusher-js";

// Initialize Pusher
const pusherClient = new Pusher(process.env.PUSHER_KEY!, {
  cluster: process.env.PUSHER_CLUSTER!,
  authEndpoint: "/api/pusher/auth",
});

export { pusherClient };
