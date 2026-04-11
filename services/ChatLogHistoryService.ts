import {
  ChatLogHistory,
  ChatLogs,
  ChatLogType,
} from "@/interface/result_message";
import { Directory, File, Paths } from "expo-file-system/next";

export default class ChatLogHistoryService {
  private static instance: ChatLogHistoryService;
  // private pathToSave = Paths.join(Paths.document, "chat_log_history");
  private pathToSave = Paths.join(Paths.cache, "chat_log_history");
  private currentChatLogPath = "";

  constructor() {
    try {
      const dir = new Directory(this.pathToSave);
      if (!dir.exists) {
        dir.create();
      }
    } catch (e) {
      console.log("Constructor error: " + e);
    }
  }

  createNewChatLogHistory(roomName: string, alias: string, createdAt: number) {
    try {
      const chatLogName = `${createdAt}.json`;
      const clPath = Paths.join(this.pathToSave, chatLogName);
      const file = new File(clPath);
      if (!file.exists) file.create();
      const chatLogHistory: ChatLogHistory = {
        roomName,
        alias,
        createdAt,
        chatLogs: [],
      };
      file.write(JSON.stringify(chatLogHistory));
      this.currentChatLogPath = clPath;
      this.readDir(this.pathToSave);
    } catch (e) {
      console.error(e);
    }
  }

  saveChatLogHistory(chatLog: ChatLogType) {
    try {
      const file = new File(this.currentChatLogPath);
      let chatLogs: ChatLogs = [];
      let chatLogHistory: ChatLogHistory | undefined;
      if (file.exists) {
        const chatLogHistoryTxt = file.text();
        chatLogHistory = JSON.parse(chatLogHistoryTxt);
        if (!this.isChatLogHistory(chatLogHistory)) {
          console.error("Chat Log History en formato incorrecto");
          return;
        }
        chatLogs = chatLogHistory.chatLogs;
      } else {
        console.error("Chat Log History no existe");
        return;
      }
      if (
        chatLogs.length &&
        chatLogs[chatLogs.length - 1].createdAt === chatLog.createdAt
      ) {
        chatLogs[chatLogs.length - 1] = chatLog;
      } else {
        chatLogs.push(chatLog);
      }
      if (typeof chatLogHistory !== "undefined") {
        chatLogHistory = { ...chatLogHistory, chatLogs: chatLogs };
        file.write(JSON.stringify(chatLogHistory));
        // console.log("File:");
        // file.text();
      }
    } catch (e) {
      console.log(e);
    }
  }

  getChatLogHistory(createdAt: number) {
    try {
      const file = new File(Paths.join(this.pathToSave, `${createdAt}.json`));
      let chatLogHistory: ChatLogHistory | undefined;
      if (file.exists) {
        const chatLogHistoryTxt = file.text();
        chatLogHistory = JSON.parse(chatLogHistoryTxt);
        if (!this.isChatLogHistory(chatLogHistory)) {
          console.error("Chat Log History en formato incorrecto");
          return;
        }
      }
      return chatLogHistory;
    } catch (e) {
      console.log(e);
    }
  }

  getChatLogHistoryList() {
    try {
      const dir = new Directory(this.pathToSave);
      let list: ChatLogHistory[] = [];
      if (dir.exists) {
        const content = dir.list();
        content.forEach((item) => {
          if (item.name.includes(".json")) {
            const file = item as File;
            const clh: ChatLogHistory = JSON.parse(file.text());
            if (this.isChatLogHistory(clh)) list.push(clh);
          }
        });
      }
      return list;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  deleteChatLogHistory(createdAt: number) {
    try {
      const file = new File(Paths.join(this.pathToSave, `${createdAt}.json`));
      if (!file) {
        console.error("ChatLog no encontrado");
        return null;
      }
      file.delete();
      return this.getChatLogHistoryList();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  readDir(path: string) {
    try {
      const dir = new Directory(path);
      if (!dir.exists) {
        console.log(`El directorio "${path}" no existe`);
        return;
      }
      const content = dir.list();
      if (content.length) {
        console.log("Dir: ");
        content.forEach((item) => console.log(item.name));
      }
    } catch (e) {
      console.error(e);
    }
  }

  isChatLogHistory(obj: any): obj is ChatLogHistory {
    return (
      obj &&
      typeof obj === "object" &&
      typeof obj.roomName === "string" &&
      typeof obj.alias === "string" &&
      typeof obj.createdAt === "number" &&
      Array.isArray(obj.chatLogs)
    );
  }

  static getInstance(): ChatLogHistoryService {
    if (!ChatLogHistoryService.instance) {
      ChatLogHistoryService.instance = new ChatLogHistoryService();
    }
    return ChatLogHistoryService.instance;
  }
}
