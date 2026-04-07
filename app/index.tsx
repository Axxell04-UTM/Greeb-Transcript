import { Menu, Mic, MicOff, SendHorizontal } from "@tamagui/lucide-icons";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Paragraph,
  ScrollView,
  Separator,
  TextArea,
  XStack,
  YStack,
} from "tamagui";

import { backManager } from "@/components/back_manager/backManager";
import { ChatLogCard } from "@/components/ChatLogCard";
import {
  AlertMessage,
  ChatLogHistory,
  ChatLogs,
  ChatLogType,
  PackageResultsMessages,
  ResultMessage,
} from "@/interface/result_message";
import WebSocketService from "@/services/WebSocketService";
import { PrimarySlidingMenu } from "@/UI/Index/PrimarySlidingMenu";
import { QRSlidingMenu } from "@/UI/Index/QRSlidingMenu";
import { ScanSlidingMenu } from "@/UI/Index/ScanSlidingMenu";
import { useRouter } from "expo-router";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
} from "react-native";

import ChatLogHistoryService from "@/services/ChatLogHistoryService";
import { ChatLogHistoryBar } from "@/UI/Index/ChatLogHistoryBar";

export default function Index() {
  const [micOn, setMicOn] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [listTranscript, setListTranscript] = useState<string[]>([]);
  const [listMessageTranscript, setListMessageTranscript] = useState<
    ResultMessage[]
  >([]);

  // User
  const [userID, setUserID] = useState("");

  const [countRec, setCountRec] = useState(0);

  // Sliding Menus
  const [primarySlidingMenuIsVisible, setPrimarySlidingMenuIsVisible] =
    useState(false);
  const [QRSlidingMenuIsVisible, setQRSlidingMenuIsVisible] = useState(false);
  const [scanSlidingMenuIsVisible, setScanSlidingMenuIsVisible] =
    useState(false);

  // Ajustes
  const [autoScroll, setAutoScroll] = useState(true);

  // Keyboard
  const [keyboardVerticalOffset, setKeyboardVerticalOffset] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  // WebSocket
  const [roomName, setRoomName] = useState("");
  const roomNameRef = useRef(roomName);
  const [roomPass, setRoomPass] = useState("");
  const [alias, setAlias] = useState("");
  const aliasRef = useRef(alias);
  const [wsURL, setWsURL] = useState(
    `${process.env.EXPO_PUBLIC_API_URL}/rooms/`,
  );
  const [roomNameQR, setRoomNameQR] = useState<any>();

  const [wsConnected, setWsConnected] = useState(false);

  // Services
  const [wsService, setWsService] = useState(WebSocketService.getInstance());
  // const [ chatLogHistoryService, setChatLogHistoryService ] = useState(ChatLogHistoryService.getInstance());
  const chatLogHistoryServiceRef = useRef(ChatLogHistoryService.getInstance());

  const [scanResult, setScanResult] = useState("");

  const [inputText, setInputText] = useState("");

  // Enrutador
  const router = useRouter();

  // ChatLogHistory
  const [chatLogHistoryList, setChatLogHistoryList] = useState<
    ChatLogHistory[]
  >([]);
  const [chatLogHistorySelected, setChatLogHistorySelected] =
    useState<ChatLogHistory | null>(null);
  const lastChatLogIndexed = useRef<ChatLogType>(null);
  const lastConnectionRoomDate = useRef<Date>(null);

  const [chatLogs, setChatLogs] = useState<ChatLogs>([]);
  const chatLogsRef = useRef(chatLogs);

  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => {
    if (micOn) {
      recStart();
    }
  });
  useSpeechRecognitionEvent("result", (e) => {
    setTranscript(e.results[0]?.transcript);
    if (e.isFinal) {
      setListTranscript([...listTranscript, e.results[0]?.transcript]);
      wsService.sendMessage({
        type: "message",
        text: e.results[0]?.transcript,
      });
    }
  });
  useSpeechRecognitionEvent("error", (e) => {
    if (micOn) {
      recStart();
    }
  });

  // Funciones
  function openMic() {
    setMicOn(true);
    handleStart();
    setRecognizing(true);
  }

  function closeMic() {
    setMicOn(false);
    ExpoSpeechRecognitionModule.stop();
    setRecognizing(false);
  }

  function recStart() {
    ExpoSpeechRecognitionModule.start({
      lang: "es-CO",
      interimResults: true,
      continuous: false,
    });
  }

  async function handleStart() {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.log("Permissions not granted", result);
      return;
    }
    recStart();
  }

  async function handleSendInputText() {
    wsService.sendMessage({
      type: "message",
      text: inputText.trim(),
    });
    setInputText("");
  }

  // function goToSettings() {
  //   router.push("/settings");
  // }

  function connectWs(action: "create" | "join") {
    if (!wsURL) {
      ToastAndroid.show("Se necesita la URL del servidor", ToastAndroid.SHORT);
      return;
    } else if (!roomName) {
      ToastAndroid.show("Nombre de sala necesario", ToastAndroid.SHORT);
      return;
    } else if (!roomPass) {
      ToastAndroid.show("Contraseña de sala necesaria", ToastAndroid.SHORT);
      return;
    } else if (!alias) {
      ToastAndroid.show("Alias necesario", ToastAndroid.SHORT);
      return;
    }

    wsService.connect(wsURL, action, roomPass, alias);
  }

  function disconnectWs() {
    if (!wsURL) {
      return;
    }
    wsService.disconnect();
  }

  // Toggle Functions
  function toggleAutoScroll(value?: boolean) {
    if (value !== undefined) {
      setAutoScroll(value);
    } else {
      setAutoScroll(!autoScroll);
    }
  }

  function togglePrimarySlidingMenuIsVisible(visible?: boolean) {
    if (visible !== undefined) {
      setPrimarySlidingMenuIsVisible(visible);
    } else {
      setPrimarySlidingMenuIsVisible((prev) => !prev);
    }
  }

  function toggleQRSlidingMenuIsVisible(visible?: boolean) {
    if (visible !== undefined) {
      setQRSlidingMenuIsVisible(visible);
    } else {
      setQRSlidingMenuIsVisible((prev) => !prev);
    }
  }

  function toggleScanSlidingMenuIsVisible(visible?: boolean) {
    if (visible !== undefined) {
      setScanSlidingMenuIsVisible(visible);
    } else {
      setScanSlidingMenuIsVisible((prev) => !prev);
    }
  }

  // Actualizando la sala para la conexión WS
  useEffect(() => {
    setWsURL((prevWsURL) => {
      let r = prevWsURL.split("/");
      r[r.length - 1] = encodeURIComponent(roomName);
      return r.join("/");
    });
  }, [roomName]);

  // AutoScroll
  useEffect(() => {
    if (scrollViewRef && autoScroll && wsConnected) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [listMessageTranscript, autoScroll, wsConnected]);

  useEffect(() => {
    if (wsService) {
      // const ws = WebSocketService.getInstance();
      const handleState = (connected: boolean) => {
        setWsConnected(connected);
        if (connected) {
          ToastAndroid.show("Conexión establecida", ToastAndroid.SHORT);
          toggleScanSlidingMenuIsVisible(false);
          togglePrimarySlidingMenuIsVisible(false);
          chatLogHistoryServiceRef.current.createNewChatLogHistory(
            roomNameRef.current,
            aliasRef.current,
            Date.now(),
          );
        } else {
          ToastAndroid.show("Conexión terminada", ToastAndroid.SHORT);
          setChatLogHistoryList(
            chatLogHistoryServiceRef.current.getChatLogHistoryList(),
          );
          // console.log(chatLogsRef.current);
        }
      };

      const handleMessage = (message: ResultMessage) => {
        setListMessageTranscript((prev) => [...prev, message]);
      };

      const handleMessageServer = (reason: string) => {
        ToastAndroid.show(reason, ToastAndroid.SHORT);
      };

      wsService.onState(handleState);
      wsService.onMessage(handleMessage);
      wsService.onMessageServer(handleMessageServer);
      return () => {
        wsService.removeStateListener(handleState);
        wsService.removeMessageListener(handleMessage);
        wsService.removeMessageServerListener(handleMessageServer);
      };
    }
  }, [wsService]);

  // useEffect(() => {
  //   const getData = async (key: string) => {
  //     try {
  //       const value = await AsyncStorage.getItem(key);
  //       return value;
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   };
  //   (async () => {
  //     const id = await getData("user-id");
  //     setUserID(id ?? "XXXX-XXXX");
  //   })();
  // }, []);

  useEffect(() => {
    // console.log("ScanRes: " + scanResult);
    if (scanResult) {
      const results = scanResult.split(";");
      setRoomName(results[0]);
      setRoomPass(results[1]);
    }
  }, [scanResult]);

  useEffect(() => {
    // console.log("Creando KeyboardListeners");
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVerticalOffset(30);
      // console.log("Teclado Arriba");
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVerticalOffset(0);
      // console.log("Teclado Abajo");
    });
    return () => {
      // console.log("Limpiando KeyboardListeners");
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ChatLogs Manipulation

  // const [listPackageMessages, setListPackageMessages] = useState<
  //   PackageResultsMessages[]
  // >([]);

  useEffect(() => {
    aliasRef.current = alias;
    roomNameRef.current = roomName;
  }, [alias, roomName]);

  useEffect(() => {
    let newLogs: ChatLogs = [];
    let pm: PackageResultsMessages | undefined;
    listMessageTranscript
      .filter((msg) => msg.from !== undefined)
      .forEach((msg, index) => {
        if (msg.type === "chat_message") {
          if (!pm) {
            pm = {
              owner: msg.from,
              messages: [msg],
              type: "package",
              createdAt: msg.createdAt,
            };
          } else {
            if (pm.owner === msg.from) {
              // pm.messages = [...pm.messages, msg];
              pm = { ...pm, messages: [...pm.messages, msg] }; // Se conecta con el paquete de mensajes existente
            } else {
              // newLogs.push(pm);
              pm = {
                owner: msg.from,
                messages: [msg],
                type: "package",
                createdAt: msg.createdAt,
              }; // Cambio a otro paquete de mensajes
            }
          }
          if (index < listMessageTranscript.length - 1) {
            // Si el elemento actual no es el último
            if (
              pm.owner !== listMessageTranscript[index + 1].from &&
              listMessageTranscript[index + 1].type === "chat_message"
            ) {
              // Si el dueño del paquete existente es distinto a quién envió el siguiente mensaje
              if (typeof pm !== "undefined") {
                // newLogs.push(pm);
                newLogs = [...newLogs, pm];
                // setChatLogs((prev) => prev.concat(pm as PackageResultsMessages));
              }
            } else if (listMessageTranscript[index + 1].type === "alert") {
              if (typeof pm !== "undefined") {
                newLogs = [...newLogs, pm];
              }
            }
          } else if (index === listMessageTranscript.length - 1) {
            if (typeof pm !== "undefined") {
              // setListPackageMessages((prev) => [
              //   ...prev,
              //   pm as PackageResultsMessages,
              // ]);
              // setChatLogs((prev) => [...prev, pm as PackageResultsMessages]);
              // newLogs.push(pm);
              newLogs = [...newLogs, pm];
              // setChatLogs((prev) => prev.concat(pm as PackageResultsMessages));
            }
          }
        } else {
          let content = "";
          if (msg.content === "joined") {
            if (aliasRef.current === msg.from) {
              content = `Te uniste a la sala ${roomNameRef.current}`;
            } else {
              content = `${msg.from} se unió a la sala ${roomNameRef.current}`;
            }
          } else if (msg.content === "created") {
            content = `Creaste la sala ${roomNameRef.current}`;
          } else if (msg.content === "left") {
            if (aliasRef.current === msg.from) {
              content = `Abandonaste la sala ${roomNameRef.current}`;
            } else {
              content = `${msg.from} abandonó la sala ${roomNameRef.current}`;
            }
          }
          let alert: AlertMessage = {
            type: "alert",
            content: content,
            createdAt: msg.createdAt,
          };
          // setChatLogs((prev) => [...prev, alert]);
          // newLogs.push(alert);
          newLogs = [...newLogs, alert];
          // setChatLogs((prev) => prev.concat(alert));
        }
      });
    // if (pm) {
    //   newLogs = [...newLogs, pm];
    // }
    setChatLogs(newLogs);
  }, [listMessageTranscript]);

  useEffect(() => {
    chatLogsRef.current = chatLogs;
    console.log("<<<<<<<<<<<<<<<<<<<");
    console.log(chatLogs);
    console.log(">>>>>>>>>>>>>>>>>>>");
    if (chatLogs.length) {
      if (lastChatLogIndexed.current !== null) {
        if (lastChatLogIndexed.current === chatLogs[chatLogs.length - 1]) {
          return;
        }
      }
      chatLogHistoryServiceRef.current.saveChatLogHistory(
        chatLogs[chatLogs.length - 1],
      );
      lastChatLogIndexed.current = chatLogs[chatLogs.length - 1];
      // console.log(`ChatLogHistory: `);
      // const resCLH = chatLogHistoryServiceRef.current.getChatLogHistory();
      // console.log("<<<<<<<<<<<<<<<<");
      // console.log(resCLH);
      // if (resCLH) resCLH.chatLogs.forEach((cl) => console.log(cl));
      // console.log(">>>>>>>>>>>>>>>>");
    }
  }, [chatLogs]);

  // Handle Back Press
  useEffect(() => {
    const onBackPress = () => false;
    backManager.add(onBackPress);
    return () => backManager.remove(onBackPress);
  }, [router]);

  // Init History
  useEffect(() => {
    setChatLogHistoryList(
      chatLogHistoryServiceRef.current.getChatLogHistoryList(),
    );
  }, []);

  useEffect(() => {
    if (chatLogHistorySelected) {
      const res = chatLogHistoryServiceRef.current.getChatLogHistory(
        chatLogHistorySelected.createdAt,
      );
      if (res) {
        console.log(res);
        console.log(
          `${res.roomName} | ${new Date(res.createdAt).toLocaleString()}`,
        );
        console.log("[");
        for (const cl of res.chatLogs) {
          console.log(cl);
        }
        console.log("]");
      }
    }
  }, [chatLogHistorySelected]);

  return (
    <>
      <YStack bg={"$background"} flex={1}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={keyboardVerticalOffset}
          style={{ flex: 1 }}
        >
          <YStack
            bg={"$background"}
            flex={1}
            justify="flex-start"
            items="center"
            gap={"$2.5"}
            py={"$5"}
          >
            <XStack px={"$3"} width={"100%"} justify={"space-between"}>
              {/* <Button icon={<UserCircle2 size={30} />} chromeless>
            Invitado
          </Button> */}
              <XStack items={"center"} justify={"flex-start"} gap={10} flex={1}>
                <Paragraph fontSize={20}>Greeb Transcript</Paragraph>
              </XStack>
              <Button
                icon={<Menu size={"$2.5"} />}
                p={5}
                onPress={() => {
                  // setSheetOpen(true)
                  togglePrimarySlidingMenuIsVisible(true);
                }}
                ml={"auto"}
              ></Button>
            </XStack>
            <YStack flex={1} gap={20} items={"center"} width={"100%"} p={10}>
              <YStack
                p={10}
                flex={1}
                bg={"$color02"}
                rounded={"$4"}
                width={"100%"}
              >
                <XStack justify={"flex-start"} mb={"$2"}>
                  <Paragraph color={"$colorHover"}>
                    Sala - {roomName && wsConnected ? roomName : "Local"}
                  </Paragraph>
                  <Separator self={"stretch"} vertical mx={"$3"} />
                  <Paragraph color={"$colorHover"}>
                    Alias - {alias && wsConnected ? alias : "Ninguno"}
                  </Paragraph>
                </XStack>
                <ScrollView overflow="hidden" ref={scrollViewRef}>
                  <YStack
                    gap={"$1.5"}
                    // overflow="hidden"
                    display="flex"
                    // flexDirection="row"
                    // flexWrap="wrap"
                    py={"$2"}
                  >
                    {chatLogHistorySelected
                      ? chatLogHistorySelected.chatLogs.map(
                          (chatLog, index) => (
                            <ChatLogCard
                              chatLog={chatLog}
                              roomName={roomName}
                              alias={alias}
                              key={index}
                              index={index}
                            />
                          ),
                        )
                      : chatLogs.map((chatLog, index) => (
                          <ChatLogCard
                            chatLog={chatLog}
                            roomName={roomName}
                            alias={alias}
                            key={index}
                            index={index}
                          />
                        ))}
                  </YStack>
                </ScrollView>
                <ChatLogHistoryBar
                  chatLogHistoryList={chatLogHistoryList}
                  chatLogHistorySelected={chatLogHistorySelected}
                  setChatLogHistorySelected={setChatLogHistorySelected}
                />
              </YStack>
            </YStack>
            <XStack gap={"$2"} items={"center"} px={"$3"}>
              <Paragraph text={"left"} flex={1}>
                {transcript === "" ? "..." : transcript}
              </Paragraph>
              <Button
                p={10}
                borderWidth={2}
                borderColor={recognizing ? "lime" : "transparent"}
                icon={
                  recognizing ? <Mic size={"$2"} /> : <MicOff size={"$2"} />
                }
                height={"auto"}
                rounded={9999}
                onPress={micOn ? closeMic : openMic}
              />
            </XStack>
            <XStack
              items={"center"}
              justify={"flex-start"}
              px={"$3"}
              gap={"$2"}
            >
              <TextArea
                value={inputText}
                flex={1}
                onChangeText={(text) => setInputText(text)}
                maxH={"$6"}
                p={"$2"}
              />
              <Button
                p={10}
                icon={<SendHorizontal size={"$2"} />}
                onPress={handleSendInputText}
                disabled={inputText.trim() === ""}
                disabledStyle={{ opacity: 0.6 }}
              />
            </XStack>
          </YStack>
        </KeyboardAvoidingView>
      </YStack>

      {/* Sliding Menus */}
      <PrimarySlidingMenu
        isVisible={primarySlidingMenuIsVisible}
        toggleIsVisible={togglePrimarySlidingMenuIsVisible}
        roomName={roomName}
        roomPass={roomPass}
        alias={alias}
        autoScroll={autoScroll}
        connectWs={connectWs}
        wsService={wsService}
        disconnectWs={disconnectWs}
        setRoomName={setRoomName}
        setRoomPass={setRoomPass}
        setAlias={setAlias}
        toggleAutoScroll={toggleAutoScroll}
        wsConnected={wsConnected}
        toggleQRIsVisible={toggleQRSlidingMenuIsVisible}
        toggleScanIsVisible={toggleScanSlidingMenuIsVisible}
      />

      {/* Second Sheet */}
      <QRSlidingMenu
        isVisible={QRSlidingMenuIsVisible}
        toggleIsVisible={toggleQRSlidingMenuIsVisible}
        roomName={roomName}
        roomPass={roomPass}
        setRoomQR={setRoomNameQR}
      />

      <ScanSlidingMenu
        isVisible={scanSlidingMenuIsVisible}
        toggleIsVisible={toggleScanSlidingMenuIsVisible}
        setScanResult={setScanResult}
      />
    </>
  );
}
