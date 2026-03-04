export interface WSConnectionMessage {
  action: "create" | "join";
  password: string;
  alias: string;
}

export interface WsMessageIn {
  type: "message" | "pong";
  from?: string;
  content?: string;
}

export interface WsMessageOut {
  type: "message" | "ping";
  text?: string;
}

export interface WsContentMessageIn {
  type: "message" | "ping";
  text: string;
}

export interface WsMessageServer {
  code: string;
  message: string;
  type: "error" | "success";
  alias?: string;
}
