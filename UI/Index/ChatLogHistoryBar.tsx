import { ChatLogHistory } from "@/interface/result_message";
import React from "react";
import { Button, ScrollView, XStack } from "tamagui";

interface ChatLogHistoryBarProps {
  chatLogHistoryList: ChatLogHistory[];
  chatLogHistorySelected: ChatLogHistory | null;
  setChatLogHistorySelected: React.Dispatch<
    React.SetStateAction<ChatLogHistory | null>
  >;
  toggleHistorySlidingMenuIsVisible: (visible?: boolean) => void;
}

export const ChatLogHistoryBar = React.memo(
  ({
    chatLogHistoryList,
    chatLogHistorySelected,
    setChatLogHistorySelected,
    toggleHistorySlidingMenuIsVisible,
  }: ChatLogHistoryBarProps) => {
    // const dateRef = useRef()
    function handleSelect(clh: ChatLogHistory | null) {
      setChatLogHistorySelected(clh);
    }

    function openHistory() {
      toggleHistorySlidingMenuIsVisible(true);
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
              .slice(0, 4)
              .map((clh) => (
                <Button
                  bg={
                    clh.createdAt === chatLogHistorySelected?.createdAt
                      ? "$color02"
                      : "$color4"
                  }
                  px={"$3"}
                  key={clh.createdAt}
                  onPress={() => handleSelect(clh)}
                >
                  {`${clh.roomName} | ${new Date(clh.createdAt).toLocaleString()}`}
                </Button>
              ))}
            <Button bg={"$background0"} px={"$3"} onPress={openHistory}>
              Ver más...
            </Button>
          </XStack>
        </ScrollView>
      </XStack>
    );
  },
);

ChatLogHistoryBar.displayName = "ChatLogHistoryBar";
