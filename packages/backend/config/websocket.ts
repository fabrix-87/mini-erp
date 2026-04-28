// config/websocket.ts
import type { ServerWebSocket } from "bun";
import logger from "./logger-config";

/** Data attached to each WebSocket connection */
export interface WsData {
  userId?: number;
  rooms: Set<string>;
}

/** All active WebSocket connections, grouped by room */
const rooms = new Map<string, Set<ServerWebSocket<WsData>>>();

/**
 * Registers a WebSocket connection into a named room.
 */
export const joinRoom = (ws: ServerWebSocket<WsData>, room: string): void => {
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room)!.add(ws);
  ws.data.rooms.add(room);
  logger.info(`WS ${ws.data.userId ?? "anon"} joined room: ${room}`);
};

/**
 * Removes a WebSocket connection from a named room.
 */
export const leaveRoom = (ws: ServerWebSocket<WsData>, room: string): void => {
  rooms.get(room)?.delete(ws);
  ws.data.rooms.delete(room);
  if (rooms.get(room)?.size === 0) rooms.delete(room);
};

/**
 * Broadcasts a typed event payload to all connections in a room.
 */
export const broadcastToRoom = <T>(room: string, event: string, data: T): void => {
  const connections = rooms.get(room);
  if (!connections?.size) return;
  const message = JSON.stringify({ event, data });
  for (const ws of connections) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
};

/**
 * Removes a WebSocket connection from all its rooms on disconnect.
 */
export const cleanupConnection = (ws: ServerWebSocket<WsData>): void => {
  for (const room of ws.data.rooms) {
    leaveRoom(ws, room);
  }
};

// ============================================================================
// Bun WebSocket handler (passato a Bun.serve)
// ============================================================================

export const websocketHandler = {
  /**
   * Called when a new WebSocket connection is opened.
   */
  open(ws: ServerWebSocket<WsData>): void {
    ws.data.rooms = new Set();
    logger.info(`WS connected: ${ws.remoteAddress}`);
  },

  /**
   * Called when a message is received from the client.
   * Expected format: { event: string, data: unknown }
   */
  message(ws: ServerWebSocket<WsData>, raw: string | Buffer): void {
    try {
      const { event, data } = JSON.parse(raw.toString()) as {
        event: string;
        data: unknown;
      };

      switch (event) {
        case "join-import": {
          const importId = data as string;
          joinRoom(ws, `import-${importId}`);
          break;
        }
        case "leave-import": {
          const importId = data as string;
          leaveRoom(ws, `import-${importId}`);
          break;
        }
        default:
          logger.warn(`WS unknown event: ${event}`);
      }
    } catch {
      ws.send(JSON.stringify({ event: "error", data: "Invalid message format" }));
    }
  },

  /**
   * Called when a WebSocket connection is closed.
   */
  close(ws: ServerWebSocket<WsData>): void {
    cleanupConnection(ws);
    logger.info(`WS disconnected: ${ws.remoteAddress}`);
  },
};