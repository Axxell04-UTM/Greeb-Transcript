export interface ResultMessage {
  type: "alert" | "chat_message";
  content: string;
  from: string;
  _mask_content?: string;
}

export interface PackageResultsMessages {
  owner: string;
  messages: ResultMessage[];
  type: "package";
}

export interface AlertMessage {
  content: string;
  type: "alert";
}

export type ChatLogType = PackageResultsMessages | AlertMessage;

export type ChatLogs = ChatLogType[];
