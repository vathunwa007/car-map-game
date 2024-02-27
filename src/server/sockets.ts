/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Peer, { DataConnection } from "peerjs";
// import { code, TranslateCode } from "./code.env";

export function io(uri?: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const peer = new Peer({
      debug: 0,
      secure: true,
    });

    // Listen for the 'open' event, which indicates that the Peer connection is open.
    peer.on("open", (id) => {
      // Once the Peer connection is open, create a data connection.
      const dataConnection = peer.connect("1123123", { reliable: true });
      setTimeout(() => {
        reject("the server took too long to respond");
      }, 5000);
      dataConnection.on("open", () => {
        // Create a new Socket instance with the data connection.
        const sock = new Socket(dataConnection);
        sock.id = id;
        // Resolve the Promise with the Socket object.
        resolve(sock);
      });
      dataConnection.on("error", (r) => {
        reject(r.message);
      });
    });

    peer.on("error", (error) => {
      console.error("PeerJS error:", error);
      // Reject the Promise if there's an error.
      reject(error);
    });
  });
}

// class For Server
export class Socket {
  private client: DataConnection;
  public events: Map<string, (args: any) => void>;
  public id: string;
  constructor(_socket: DataConnection) {
    this.id = "";
    this.client = _socket;
    this.events = new Map();

    this.client.on("data", (data) => {
      try {
        const d = JSON.parse(data as string) as {
          event: string;
          args: any;
        };
        const xhandler = this.events.get(d.event);
        if (xhandler !== undefined) {
          xhandler(d.args);
        }
      } catch {
        /* empty */
      }
    });

    this.client.on("error", (error) => {
      console.error("Data connection error:", error);
    });
    this.client.on("close", () => {
      try {
        const xhandler = this.events.get("disconnect");
        if (xhandler !== undefined) {
          xhandler("");
        }
      } catch {
        /* empty */
      }
    });
  }

  public isOnline() {
    return this.client.peerConnection.iceConnectionState === "disconnected"
      ? false
      : true;
  }
  public on(event_name: string, handler: (args: any) => void): void;
  public on(event_name: "disconnect", handler: () => void): void;

  public on(
    event_name: string | "disconnect",
    handler: (args: any) => void
  ): void {
    this.events.set(event_name, handler);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.client.on("data", () => {});
  }
  public emit(event_name: string, args?: any) {
    this.client.send(
      JSON.stringify({ event: event_name, args: args ?? undefined })
    );
  }
  public disconnect() {
    this.emit("disconnect");
    this.client.close();
  }
}

export class Server {
  private socket: Peer;
  public logs: Array<any[]> = [];
  public code: string;
  public whenCloseF: () => void;
  public emit: (event_name: string, args?: any) => void;
  constructor(
    // idf?: (thisobj: Server) => Promise<() => void> | undefined,
    idf?: (thisobj: Server) => void,
    onf?: (s: Socket, server: Server) => void
  ) {
    let error = true;

    let _code = "";
    let _socket: Peer;

    while (error) {
      try {
        _code = "1123123";
        _socket = new Peer("1123123", {
          debug: 0,
          secure: true,
        });
        error = false;
      } catch {
        error = true;
      }
    }
    this.code = _code;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.socket = _socket;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.whenCloseF = () => {};
    this.socket.on("open", async (id) => {
      const f = await idf?.(this);
      f !== undefined ? (this.whenCloseF = f) : "";
    });
    this.socket.on("error", (r) => {
      console.error(r);
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.emit = () => {};
    this.socket.on("connection", (dataConnection) => {
      dataConnection.on("open", () => {
        const socket = new Socket(dataConnection);
        socket.id = dataConnection.peer;
        onf?.(socket, this);
      });
    });
  }
  public stop() {
    this.socket.destroy();
    this.whenCloseF();
  }
}
