export interface ResultMessage {
  type: "alert" | "chat_message";
  content: string;
  from: string;
  _mask_content?: string;
}
