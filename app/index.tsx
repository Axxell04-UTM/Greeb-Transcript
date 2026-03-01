import { Menu, Mic, MicOff, SendHorizontal } from "@tamagui/lucide-icons";
import { useEffect, useRef, useState } from "react";
import { Button, Input, Paragraph, ScrollView, XStack, YStack } from "tamagui";

import { ResultMessage } from "@/interface/result_message";
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

export default function Index() {
  const [micOn, setMicOn] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [listTranscript, setListTranscript] = useState<string[]>([]);
  const [listMessageTranscript, setListMessageTranscript] = useState<string[]>(
    [],
  );

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
  const [roomPass, setRoomPass] = useState("");
  const [alias, setAlias] = useState("");
  const [wsURL, setWsURL] = useState(
    `https://6844-2800-bf0-2805-13c9-983-f658-45d3-82f8.ngrok-free.app/rooms/`,
  );
  const [roomNameQR, setRoomNameQR] = useState<any>();

  const [wsService, setWsService] = useState(WebSocketService.getInstance());
  const [wsConnected, setWsConnected] = useState(false);

  const [scanResult, setScanResult] = useState("");

  const [inputText, setInputText] = useState("");

  // Enrutador
  const router = useRouter();

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
        text: e.results[0]?.transcript,
      });
    }
  });
  useSpeechRecognitionEvent("error", (e) => {
    // console.log("Error code: ", e.error, "Error message:", e.message);
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
      text: inputText,
    });
    setInputText("");
  }

  function goToSettings() {
    router.push("/settings");
  }

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

  useEffect(() => {
    if (scrollViewRef) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [listTranscript]);

  useEffect(() => {
    if (wsService) {
      // const ws = WebSocketService.getInstance();
      const handleState = (connected: boolean) => {
        setWsConnected(connected);
        if (connected) {
          ToastAndroid.show("Conexión establecida", ToastAndroid.SHORT);
        } else {
          ToastAndroid.show("Conexión terminada", ToastAndroid.SHORT);
        }
      };

      const handleMessage = (message: ResultMessage) => {
        if (message.type === "chat_message") {
          setListMessageTranscript((prev) => [...prev, message.content]);
        } else if (message.type === "alert") {
          let alert = "";
          if (message.content === "joined") {
            alert = `** ${message.from} se unió a la sala **`;
          }
          setListMessageTranscript((prev) => [...prev, alert]);
        }
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
    console.log("ScanRes: " + scanResult);
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

  useEffect(() => {
    console.log(keyboardVerticalOffset);
  }, [keyboardVerticalOffset]);

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
              {/* <Paragraph color={"$colorHover"}>Lista de Resultados</Paragraph> */}
              <YStack
                p={10}
                flex={1}
                bg={"$borderColorHover"}
                rounded={"$4"}
                width={"100%"}
              >
                <ScrollView overflow="hidden" ref={scrollViewRef}>
                  <YStack
                    gap={10}
                    overflow="hidden"
                    display="flex"
                    flexDirection="row"
                    flexWrap="wrap"
                  >
                    {listMessageTranscript.map((t, index) =>
                      t.includes("**") ? (
                        <Paragraph
                          display="block"
                          key={index}
                          bg={"$background"}
                          px={6}
                          rounded={"$2"}
                          color={"$color10"}
                          text={"center"}
                          width={"100%"}
                        >
                          {t.replaceAll("*", "")}
                        </Paragraph>
                      ) : (
                        <Paragraph
                          display="block"
                          key={index}
                          bg={"$background"}
                          px={6}
                          rounded={"$2"}
                        >
                          {t}
                        </Paragraph>
                      ),
                    )}
                  </YStack>
                </ScrollView>
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
              <Input
                value={inputText}
                flex={1}
                onChangeText={(text) => setInputText(text)}
              />
              <Button
                p={10}
                icon={<SendHorizontal size={"$2"} />}
                onPress={handleSendInputText}
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
