import { SlidingBottomMenu } from "@/components/SlidingBottomMenu";
import { ChatLogHistory } from "@/interface/result_message";
import ChatLogHistoryService from "@/services/ChatLogHistoryService";
import { Download, Trash2 } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { ToastAndroid } from "react-native";
import {
  AlertDialog,
  Button,
  Separator,
  SheetScrollView,
  Text,
  Theme,
  XStack,
  YStack,
} from "tamagui";

interface HistorySlidingMenuProps {
  isVisible: boolean;
  toggleIsVisible: (visible?: boolean) => void;
  chatLogHistoryList: ChatLogHistory[];
  chatLogHistorySelected: ChatLogHistory | null;
  setChatLogHistorySelected: React.Dispatch<
    React.SetStateAction<ChatLogHistory | null>
  >;
  setChatLogHistoryList: React.Dispatch<React.SetStateAction<ChatLogHistory[]>>;
  chatLogHistoryServiceRef: React.RefObject<ChatLogHistoryService>;
}

export const HistorySlidingMenu = React.memo(
  ({
    isVisible,
    toggleIsVisible,
    chatLogHistoryList,
    chatLogHistorySelected,
    setChatLogHistorySelected,
    setChatLogHistoryList,
    chatLogHistoryServiceRef,
  }: HistorySlidingMenuProps) => {
    const [slidingMenuPosition, setSlidingMenuPosition] = useState(0);
    function handleSelect(clh: ChatLogHistory | null) {
      setChatLogHistorySelected(clh);
      toggleIsVisible(false);
    }
    function handleDelete(clh: ChatLogHistory) {
      const res = chatLogHistoryServiceRef.current.deleteChatLogHistory(
        clh.createdAt,
      );
      if (!res) {
        ToastAndroid.show(
          "No se pudo eliminar el chat log",
          ToastAndroid.SHORT,
        );
        return;
      }
      setChatLogHistoryList(res);
      ToastAndroid.show("ChatLog eliminado", ToastAndroid.SHORT);
      if (clh.createdAt === chatLogHistorySelected?.createdAt) {
        setChatLogHistorySelected(null);
      }
    }
    if (!isVisible) return null;
    return (
      <SlidingBottomMenu
        title="Historial"
        isVisible={isVisible}
        toggleIsVisible={toggleIsVisible}
        position={slidingMenuPosition}
        setPosition={setSlidingMenuPosition}
        snapPoints={[80]}
      >
        <YStack>
          <SheetScrollView
            //   horizontal
            rounded={"$5"}
            showsVerticalScrollIndicator={false}
            persistentScrollbar={false}
            // persistentScrollbar
          >
            <YStack gap={"$2"}>
              {chatLogHistoryList.map((clh, index) => (
                <Button
                  key={clh.createdAt}
                  px={"$2"}
                  height={"$6"}
                  rounded={"$6"}
                  onPress={() => handleSelect(clh)}
                  bg={
                    clh.createdAt === chatLogHistorySelected?.createdAt
                      ? "$color02"
                      : "$color4"
                  }
                >
                  <XStack
                    //   justify={"flex-end"}
                    //   items={"flex-end"}
                    gap={"$2"}
                    //   bg={"$color02"}
                    //   rounded={"$7"}
                  >
                    <YStack justify={"center"} items={"center"} flex={1}>
                      <XStack gap={"$3"}>
                        <Text>{clh.roomName}</Text>
                        <Separator vertical />
                        <Text>{clh.alias}</Text>
                      </XStack>
                      <Text color={"$color06"}>
                        {new Date(clh.createdAt).toLocaleString()}
                      </Text>
                    </YStack>
                    <XStack gap={"$2"}>
                      <AlertDialog native>
                        <AlertDialog.Trigger asChild>
                          <Button
                            bg={"$color3"}
                            px={"$2"}
                            icon={<Trash2 size={"$2"} />}
                            // onPress={() => handleDelete(clh)}
                          />
                        </AlertDialog.Trigger>
                        <AlertDialog.Portal>
                          <AlertDialog.Overlay
                            key={"overlay"}
                            transition="quick"
                            // opacity={0.1}
                            bg="red"
                            enterStyle={{ opacity: 0 }}
                            exitStyle={{ opacity: 0 }}
                            rounded={"$9"}
                          >
                            <AlertDialog.Content
                              elevate
                              key="content"
                              transition={"quick"}
                              enterStyle={{
                                x: 0,
                                y: -20,
                                opacity: 0,
                                scale: 0.9,
                              }}
                              exitStyle={{
                                x: 0,
                                y: 10,
                                opacity: 0,
                                scale: 0.95,
                              }}
                              x={0}
                              scale={1}
                              opacity={1}
                              y={0}
                              rounded={"$9"}
                            >
                              <YStack gap={"$3"} rounded={"$9"}>
                                <AlertDialog.Title>
                                  Desea eliminar el chat log?
                                </AlertDialog.Title>
                                <AlertDialog.Description>
                                  {`${clh.roomName} - ${clh.alias} | ${new Date(clh.createdAt).toLocaleString()}`}
                                </AlertDialog.Description>
                                <XStack gap={"$3"} justify={"flex-end"}>
                                  <AlertDialog.Cancel asChild>
                                    <Button>Cancel</Button>
                                  </AlertDialog.Cancel>
                                  <AlertDialog.Action
                                    asChild
                                    onPress={() => handleDelete(clh)}
                                    bg={"red"}
                                  >
                                    <Theme name={"accent"}>
                                      <Button>Accept</Button>
                                    </Theme>
                                  </AlertDialog.Action>
                                </XStack>
                              </YStack>
                            </AlertDialog.Content>
                          </AlertDialog.Overlay>
                        </AlertDialog.Portal>
                      </AlertDialog>
                      <Theme name={"accent"}>
                        <Button px={"$2"} icon={<Download size={"$2"} />} />
                      </Theme>
                    </XStack>
                  </XStack>
                </Button>
              ))}
            </YStack>
          </SheetScrollView>
        </YStack>
      </SlidingBottomMenu>
    );
  },
);

HistorySlidingMenu.displayName = "HistorySlidingMenu";
