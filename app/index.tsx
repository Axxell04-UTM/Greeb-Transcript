import { MaterialIcons } from "@expo/vector-icons";
import { ChevronDown, CircleCheck, CircleX, LogIn, Menu, UserCircle2 } from "@tamagui/lucide-icons";
import { useEffect, useRef, useState } from "react";
import { Button, Input, Paragraph, ScrollView, Sheet, Switch, XStack, YStack } from "tamagui";

import WebSocketService from "@/services/WebSocketService";
import { useRouter } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { ToastAndroid } from "react-native";

export default function Index() {
  const [ micOn, setMicOn ] = useState(false);
  const [ recognizing, setRecognizing ] = useState(false);
  const [ transcript, setTranscript ] = useState("");
  const [ listTranscript, setListTranscript ] = useState<string[]>([]);
  const [ countRec, setCountRec ] = useState(0);
  
  // Sidebar
  const [ sheetOpen, setSheetOpen ] = useState(false);
  const [ position, setPosition ] = useState(0);
  
  // Ajustes
  const [ autoScroll, setAutoScroll ] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);
  // WebSocket
  const [ wsURL, setWsURL ] = useState("https://eb126a895bf2.ngrok-free.app/ws")
  const [ wsService, setWsService ] = useState(WebSocketService.getInstance());
  const [ wsConnected, setWsConnected ] = useState(false);

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
        type: "message",
        content: e.results[0]?.transcript
      });
    }
  });
  useSpeechRecognitionEvent("error", (e) => {
    // console.log("Error code: ", e.error, "Error message:", e.message);
    if (micOn) {
      recStart();
    }
  })
  
  // Funciones
  function openMic () {
    setMicOn(true);
    handleStart();
    setRecognizing(true);
  }
  
  function closeMic () {
    setMicOn(false);
    ExpoSpeechRecognitionModule.stop();
    setRecognizing(false);
  }

  function recStart () {
    ExpoSpeechRecognitionModule.start({
      lang: "es-CO",
      interimResults: true,
      continuous: false,   
    })
  }

  async function handleStart () {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.log("Permissions not granted", result);
      return;
    }
    recStart();
  }

  function toggleAutoScroll (value?: boolean) {
    if (value !== undefined) {
      setAutoScroll(value);
    } else {
      setAutoScroll(!autoScroll);
    }
  }

  function goToSettings () {
    router.push("/settings");
  }

  function connectWs () {
    if (!wsURL) { return };
    wsService.connect(wsURL, "Axxell04");
  }

  function disconnectWs () {
    if (!wsURL) { return };
    wsService.disconnect();
  }

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
      wsService.onState(handleState);
      return () => {
        wsService.removeStateListener(handleState);
      }
    }
  }, [wsService])

  return (
    <>
    <YStack bg={"$background"} flex={1} justify="center" items="center">
      <XStack p={10} width={"100%"} justify={"space-between"}>
        <Button
          icon={<UserCircle2 size={30} />}
          chromeless
        >
          Invitado
        </Button>
        <Button 
          icon={<Menu size={30} />}
          p={5}
          onPress={() => setSheetOpen(true)}
        >
        </Button>
      </XStack>
      <YStack items={"center"} gap={10}>
        <Paragraph fontSize={20}>
          Greeb Transcript
        </Paragraph>
      </YStack>
      <YStack gap={20} items={"center"}>
        <Paragraph color={"$colorHover"}>
          Resultados
        </Paragraph>
        <Paragraph text={"center"}>
          {transcript === "" ? "..." : transcript}
        </Paragraph>
      </YStack>
      <YStack flex={1} gap={20} items={"center"} width={"100%"} p={20}>
        <Paragraph color={"$colorHover"}>
          Lista de Resultados
        </Paragraph>
        <YStack p={10} flex={1} bg={"$borderColorHover"} rounded={"$4"} width={"100%"}>
          <ScrollView overflow="hidden" ref={scrollViewRef}>
            <YStack gap={10} overflow="hidden" display="flex" flexDirection="row" flexWrap="wrap">
              {listTranscript.map((t, index) => 
                <Paragraph display="block" key={index} bg={"$background"} px={6} rounded={"$2"}>{t}</Paragraph>
              )}
            </YStack>
          </ScrollView>
        </YStack>
      </YStack>
      <YStack items={"center"} p={30} gap={10}>
        <Button p={10}
          borderWidth={2}
          borderColor={recognizing ? "lime" : "transparent"}
          icon={recognizing 
            ? <MaterialIcons name="mic" size={50} />
            : <MaterialIcons name="mic-off" size={50} />
          }
          height={"auto"}
          rounded={9999}
          onPress={micOn ? closeMic : openMic}
        >

        </Button>
        <Button p={10}
          borderWidth={2}
          icon={<MaterialIcons name="settings" size={30} />}
          height={"auto"}
          rounded={9999}
          onPress={goToSettings}
          opacity={.8}
        >

        </Button>
      </YStack>
    </YStack>
    <Sheet 
      forceRemoveScrollEnabled
      dismissOnSnapToBottom
      open={sheetOpen}
      onOpenChange={setSheetOpen}
      modal={false}
      snapPoints={[80]}
      position={position}
      onPositionChange={setPosition}
          
    >
          <Sheet.Overlay 
            animation={"lazy"}
            bg={"$shadow4"}
          />
          <Sheet.Handle />
          <Sheet.Frame 
            bg={"$background"}
            p={30}
            rounded={"$8"}
            gap={30}
          >
            <XStack items={"center"} gap={10}>
              <UserCircle2 size={30} />
              <Paragraph fontSize={18}>
                Invitado
              </Paragraph>
            </XStack>
            <YStack gap={10} borderWidth={1} borderColor={"$borderColorHover"} p={10} rounded={"$4"}>
              <Paragraph color={"$color08"}>
                Ajustes
              </Paragraph>
              <XStack gap={20} items={"center"}>
                <Paragraph>
                  Auto-Scroll
                </Paragraph>
                <Switch 
                  bg={autoScroll ? "$colorFocus" : "$background"} 
                  checked={autoScroll} 
                  onCheckedChange={(c) => toggleAutoScroll(c)}
                >
                  <Switch.Thumb animation={"quicker"} />
                </Switch>
              </XStack>
              <YStack gap={20}>
                <XStack items={"center"} gap={5}>
                  <Paragraph self={"flex-start"}>
                    WebSocket
                  </Paragraph>
                  {wsConnected 
                  ? <CircleCheck size={20} />
                  : <CircleX size={20} />
                  }
                </XStack>
                <Input placeholder="URL Server" value={wsURL} />
                <Button
                  onPress={wsConnected ? disconnectWs : connectWs}
                >
                  {wsConnected 
                  ? "Desconectar"
                  : "Conectar"
                  }
                </Button>
              </YStack>
            </YStack>
            <YStack gap={10} borderWidth={1} borderColor={"$borderColorHover"} p={10} rounded={"$4"}>
              <Paragraph color={"$color08"}>
                Social
              </Paragraph>
              <YStack p={5} gap={10}>           
                <XStack gap={15} items={"center"}>
                  <Paragraph>
                    ID:
                  </Paragraph>
                  <Paragraph>
                    XHFK3-2LKF4-F9S89
                  </Paragraph>
                  <Button
                    icon={<ChevronDown size={25} />}
                    chromeless
                    ml={"auto"}
                    color={"$color10"}
                  >
                    Ver QR
                  </Button>
                </XStack>
                <Button>
                  Conectar
                </Button>
              </YStack>
            </YStack>
            <Button mt={"auto"}
              icon={<LogIn size={25} />}
              self={"center"}
              variant="outlined"
              color={"$color10"}
            >
              Iniciar sesión
            </Button>
          </Sheet.Frame>
    </Sheet>
    </>
  );
}
