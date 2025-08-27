import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Button, Paragraph, ScrollView, YStack } from "tamagui";

import { useRouter } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

export default function Index() {
  const [ micOn, setMicOn ] = useState(false);
  const [ recognizing, setRecognizing ] = useState(false);
  const [ transcript, setTranscript ] = useState("");
  const [ listTranscript, setListTranscript ] = useState<string[]>([]);
  const [ countRec, setCountRec ] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);

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

  function goToSettings () {
    router.push("/settings");
  }

  useEffect(() => {
    if (scrollViewRef) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [listTranscript]);

  return (
    <YStack bg={"$background"} flex={1} justify="center" items="center" p={30}>
      <YStack items={"center"} gap={10}>
        <Paragraph fontSize={20}>
          Greeb Translate
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
      <YStack flex={1} gap={20} items={"center"} width={"100%"}>
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
      <YStack items={"center"} pt={30} gap={10}>
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
  );
}
