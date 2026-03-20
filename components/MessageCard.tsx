import { ResultMessage } from "@/interface/result_message";
import React, { useState } from "react";
import { Paragraph, Text, XStack } from "tamagui";

interface MessageCardProps {
  message: ResultMessage;
  prevMessage?: ResultMessage;
  roomName: string;
  alias: string;
  index?: number;
}

export const MessageCard = React.memo(
  ({ message, prevMessage, roomName, alias, index }: MessageCardProps) => {
    console.log(`Message Content: ${message.content}`);
    if (message.type === "alert") {
      let alert = "";
      if (message.content === "joined") {
        if (alias === message.from) {
          alert = `** Te uniste a la sala ${roomName} **`;
        } else {
          alert = `** ${message.from} se unió a la sala ${roomName} **`;
        }
      } else if (message.content === "created") {
        alert = `** Creaste la sala ${roomName} **`;
      } else if (message.content === "left") {
        if (alias === message.from) {
          alert = `** Abandonaste la sala ${roomName} **`;
        } else {
          alert = `** ${message.from} abandonó la sala ${roomName} **`;
        }
      }
      message._mask_content = alert;
    } else {
      message._mask_content = message.content;
    }

    const [showFrom, setShowFrom] = useState(
      prevMessage === undefined ||
        prevMessage.type === "alert" ||
        prevMessage?.from !== message.from,
    );

    console.log(prevMessage);

    return message._mask_content.includes("**") ? (
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
        {message._mask_content.replaceAll("*", "")}
      </Paragraph>
    ) : (
      <XStack gap={"$2"}>
        {showFrom ? (
          <Text
            // t={"$-4.5"}
            // shrink={1}
            // numberOfLines={1}
            // ellipsizeMode="tail"
            // width={"$20"}
            // width={"100%"}
            px={"$2"}
            py={"$1"}
            bg={"$color"}
            color={"$background"}
            rounded={"$2"}
          >
            {message.from}:
          </Text>
        ) : (
          <></>
        )}
        <Paragraph
          display="block"
          key={index}
          bg={"$background"}
          px={"$2"}
          rounded={"$2"}
          height={"min-content"}
          self={"flex-start"}
        >
          {message._mask_content}
        </Paragraph>
      </XStack>
    );
  },
);

MessageCard.displayName = "MessageCard";
