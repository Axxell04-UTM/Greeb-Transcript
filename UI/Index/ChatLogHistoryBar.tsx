import { ChatLogHistory } from "@/interface/result_message";
import React from "react";
import { Button, ScrollView, Text, XStack } from "tamagui";

interface ChatLogHistoryBarProps {
  chatLogHistoryList: ChatLogHistory[];
  chatLogHistorySelected: ChatLogHistory | null;
  setChatLogHistorySelected: React.Dispatch<
    React.SetStateAction<ChatLogHistory | null>
  >;
  toggleHistorySlidingMenuIsVisible: (visible?: boolean) => void;
  refreshChatLogHistoryList: () => void;
}

export const ChatLogHistoryBar = React.memo(
  ({
    chatLogHistoryList,
    chatLogHistorySelected,
    setChatLogHistorySelected,
    toggleHistorySlidingMenuIsVisible,
    refreshChatLogHistoryList,
  }: ChatLogHistoryBarProps) => {
    // const dateRef = useRef()
    function handleSelect(clh: ChatLogHistory | null) {
      setChatLogHistorySelected(clh);
      refreshChatLogHistoryList();
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
          <Text style={{ fontFamily: "DMSans_300Light" }}>En vivo</Text>
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
                  <Text style={{ fontFamily: "DMSans_300Light" }}>
                    {`${clh.roomName} | ${new Date(clh.createdAt).toLocaleString()}`}
                  </Text>
                </Button>
              ))}
            <Button bg={"$background0"} px={"$3"} onPress={openHistory}>
              <Text style={{ fontFamily: "DMSans_300Light" }}>Ver más...</Text>
            </Button>
          </XStack>
        </ScrollView>
      </XStack>
    );
  },
);

ChatLogHistoryBar.displayName = "ChatLogHistoryBar";
