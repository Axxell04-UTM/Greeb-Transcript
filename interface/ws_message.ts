export interface WSConnectionMessage {
  action: "create" | "join";
  password: string;
  alias: string;
}

export interface WsMessageIn {
  type: "message";
  from: string;
  content: string;
}

export interface WsMessageOut {
  text: string;
}

export interface WsMessageServer {
  code: string;
  message: string;
  type: "error" | "success";
  alias?: string;
}
