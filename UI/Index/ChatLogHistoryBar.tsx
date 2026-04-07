import { ChatLogHistory } from "@/interface/result_message";
import React from "react";
import { Button, ScrollView, XStack } from "tamagui";

interface ChatLogHistoryBarProps {
  chatLogHistoryList: ChatLogHistory[];
  chatLogHistorySelected: ChatLogHistory | null;
  setChatLogHistorySelected: React.Dispatch<
    React.SetStateAction<ChatLogHistory | null>
  >;
}

export const ChatLogHistoryBar = React.memo(
  ({
    chatLogHistoryList,
    chatLogHistorySelected,
    setChatLogHistorySelected,
  }: ChatLogHistoryBarProps) => {
    // const dateRef = useRef()
    function handleSelect(clh: ChatLogHistory | null) {
      setChatLogHistorySelected(clh);
    }
    return (
      <XStack gap={"$2"}>
        <Button
          bg={"$background08"}
          px={"$3"}
          onPress={() => handleSelect(null)}
        >
          En vivo
        </Button>
        <ScrollView
          horizontal
          rounded={"$5"}
          showsHorizontalScrollIndicator={false}
        >
          <XStack gap={"$1"}>
            {chatLogHistoryList
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((clh) => (
                <Button
                  bg={"$background02"}
                  px={"$3"}
                  key={clh.createdAt}
                  onPress={() => handleSelect(clh)}
                >
                  {`${clh.roomName} | ${new Date(clh.createdAt).toLocaleString()}`}
                </Button>
              ))}
          </XStack>
        </ScrollView>
      </XStack>
    );
  },
);

ChatLogHistoryBar.displayName = "ChatLogHistoryBar";
