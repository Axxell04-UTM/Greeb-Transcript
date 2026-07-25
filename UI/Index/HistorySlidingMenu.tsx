import { SlidingBottomMenu } from "@/components/SlidingBottomMenu";
import { ChatLogHistory } from "@/interface/result_message";
import ChatLogHistoryService from "@/services/ChatLogHistoryService";
import { Share, Trash2 } from "@tamagui/lucide-icons";
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

import { File, Paths } from "expo-file-system/next";

import * as FileSystem from "expo-file-system";

import * as Sharing from "expo-sharing";

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
  refreshChatLogHistoryList: () => void;
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
    refreshChatLogHistoryList,
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

    async function handleShare(clh: ChatLogHistory) {
      const uriChatLog = Paths.join(
        chatLogHistoryServiceRef.current.pathToSave,
        `${clh.createdAt}.json`,
      );
      const fileTxt = await proccessFile(clh);
      Sharing.shareAsync(fileTxt.uri, {
        dialogTitle: `ChatLog ${clh.roomName} | ${new Date(clh.createdAt).toLocaleString()}`,
        mimeType: "text/plain",
        // mimeType: "text/plain; charset=utf-8",
      });
    }

    async function handleDownload(clh: ChatLogHistory) {
      const permiss =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
          "Download",
        );

      if (!permiss.granted) {
        console.log("Permisos no concedidos");
        return;
      }

      const fileName = `${clh.roomName} | ${new Date(clh.createdAt).toLocaleString()}`;
      const fileTxt = proccessFile(clh);

      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permiss.directoryUri,
        fileName,
        "text/plain",
      );

      await FileSystem.writeAsStringAsync(fileUri, fileTxt.text(), {
        encoding: FileSystem.EncodingType.UTF8,
      });
      console.log(`${fileName} guardado en ${fileUri}`);
      ToastAndroid.show(
        `${fileName} guardado en el dispositivo`,
        ToastAndroid.SHORT,
      );
    }

    function proccessFile(clh: ChatLogHistory) {
      const fileTxt = new File(
        Paths.join(
          Paths.cache,
          `${clh.roomName}_${clh.alias}_${clh.createdAt}.txt`,
        ),
      );
      let content = `Fecha: ${new Date(clh.createdAt).toLocaleString()} \nSala: ${clh.roomName} | Alias: ${clh.alias}\n`;
      for (const cl of clh.chatLogs) {
        if (cl.type === "package") {
          content = content.concat(
            `${new Date(cl.createdAt).toLocaleTimeString()} - ${cl.owner}: `,
          );
          for (const msg of cl.messages) {
            content = content.concat(`${msg.content} `);
          }
          content = content.concat("\n");
        }
      }
      fileTxt.write(content);
      return fileTxt;
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
                        <Text style={{ fontFamily: "DMSans_600SemiBold" }}>
                          {clh.roomName}
                        </Text>
                        <Separator vertical />
                        <Text style={{ fontFamily: "DMSans_600SemiBold" }}>
                          {clh.alias}
                        </Text>
                      </XStack>
                      <Text
                        color={"$color06"}
                        style={{ fontFamily: "DMSans_300Light_Italic" }}
                      >
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
                        <Button
                          px={"$2"}
                          icon={<Share size={"$2"} />}
                          onPress={() => handleShare(clh)}
                        />
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
