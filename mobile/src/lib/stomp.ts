import { Client, type IMessage } from "@stomp/stompjs";

import { WS_BASE_URL, getAuthToken } from "@/api/client";
import type { MessageDto } from "@/api/types";

let client: Client | null = null;
let refCount = 0;

function wsUrl(): string {
  return `${WS_BASE_URL.replace(/^http/, "ws")}/ws`;
}

/**
 * Opens a single shared STOMP connection for the app's lifetime and invokes
 * `onMessage` for every message delivered to this user's queue. Returns a
 * teardown function; the underlying connection is only closed once every
 * caller has torn down (ref-counted, since multiple screens may subscribe).
 */
export async function subscribeToMessages(onMessage: (message: MessageDto) => void): Promise<() => void> {
  const token = await getAuthToken();
  if (!token) return () => {};

  refCount += 1;

  if (!client) {
    client = new Client({
      brokerURL: wsUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      onStompError: () => {},
      onWebSocketError: () => {},
    });
    client.activate();
  }

  const handler = (frame: IMessage) => {
    try {
      onMessage(JSON.parse(frame.body) as MessageDto);
    } catch {
      // ignore malformed frames
    }
  };

  let subscription: ReturnType<Client["subscribe"]> | null = null;
  const trySubscribe = () => {
    if (client?.connected) {
      subscription = client.subscribe("/user/queue/messages", handler);
    }
  };

  if (client.connected) {
    trySubscribe();
  } else {
    client.onConnect = trySubscribe;
  }

  return () => {
    subscription?.unsubscribe();
    refCount -= 1;
    if (refCount <= 0 && client) {
      client.deactivate();
      client = null;
      refCount = 0;
    }
  };
}
