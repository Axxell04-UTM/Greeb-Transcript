import { AlertMessage, ChatLogType } from "@/interface/result_message";
import React, { useRef } from "react";
import { Paragraph, Text, XStack } from "tamagui";

interface ChatLogProps {
  chatLog: ChatLogType;
  roomName: string;
  alias: string;
  index?: number;
}

export const ChatLogCard = React.memo(
  ({ chatLog, roomName, alias, index }: ChatLogProps) => {
    const totalMessagesRef = useRef("");

    if (chatLog.type === "package") {
      totalMessagesRef.current = chatLog.messages
        .reduce(
          (totalMessage, currentMessage) =>
            (totalMessage ? `${totalMessage} ` : ``) + currentMessage.content,
          "",
        )
        .trim();
    }

    return chatLog.type === "alert" ? (
      <Paragraph
        display="block"
        key={index}
        bg={"$background"}
        px={6}
        rounded={"$2"}
        color={"$color10"}
        text={"center"}
        width={"100%"}
        my={"$3"}
      >
        {(chatLog as AlertMessage).content}
      </Paragraph>
    ) : (
      <XStack gap={"$2"}>
        <Text
          display="block"
          key={index}
          bg={"$background"}
          px={"$2"}
          rounded={"$2"}
          height={"min-content"}
          self={"flex-start"}
        >
          <Text
            fontWeight={"bold"}
            color={"$green11"}
          >{`${chatLog.owner}: `}</Text>
          {totalMessagesRef.current}
        </Text>
      </XStack>
    );
  },
);

ChatLogCard.displayName = "ChatLogCard";
