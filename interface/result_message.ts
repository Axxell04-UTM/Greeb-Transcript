export interface ResultMessage {
  type: "alert" | "chat_message";
  content: string;
  from: string;
  createdAt: number;
  _mask_content?: string;
}

export interface PackageResultsMessages {
  owner: string;
  messages: ResultMessage[];
  createdAt: number;
  type: "package";
}

export interface AlertMessage {
  content: string;
  createdAt: number;
  type: "alert";
}

export type ChatLogType = PackageResultsMessages | AlertMessage;

export type ChatLogs = ChatLogType[];

export type ChatLogHistory = {
  roomName: string;
  alias: string;
  createdAt: number;
  chatLogs: ChatLogs;
};
