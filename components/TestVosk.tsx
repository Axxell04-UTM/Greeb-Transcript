import React, { useEffect, useState } from "react";
import * as vosk from "react-native-vosk";
import { Button, Text, XStack, YStack } from "tamagui";

export const TestVosk = React.memo(() => {
  const [ready, setReady] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [result, setResult] = useState<string | undefined>();

  const load = () => {
    vosk
      .loadModel("vosk-model-small-es-0.42")
      .then(() => setReady(true))
      .catch((e) => console.error("1.." + e));
  };

  const record = () => {
    vosk
      .start()
      .then(() => {
        console.log("Starting recognition...");
        setRecognizing(true);
      })
      .catch((e) => console.error("2.." + e));
  };

  const recordGrammar = () => {
    vosk
      .start({ grammar: ["cool", "application", "[unk]"] })
      .then(() => {
        console.log("Start recognition with grammar...");
        setRecognizing(true);
      })
      .catch((e) => console.error("3.." + e));
  };

  const recordTimeout = () => {
    vosk
      .start({ timeout: 5000 })
      .then(() => {
        console.log("Starting recognition with timeout...");
        setRecognizing(true);
      })
      .catch((e) => console.error("4.." + e));
  };

  const stop = () => {
    vosk.stop();
    console.log("Stoping recognition...");
    setRecognizing(false);
  };

  const unload = () => {
    vosk.unload();
    setReady(false);
    setRecognizing(false);
  };

  function processRes(res: string) {
    const formatedRes: { text: string } = JSON.parse(res);
    return formatedRes.text;
  }

  useEffect(() => {
    console.log("Vosk: ", vosk);
    console.log("Vosk keys: ", Object.keys(vosk));
    console.log("Vosk.onResult: ", vosk.onResult);

    const resultEvent = vosk.onResult((res) => {
      const finalText = processRes(res);
      console.log("An onResult event has been caught: " + finalText);
      setResult(finalText);
    });
    const partialResultEvent = vosk.onPartialResult((res) => {
      // setResult(res);
    });
    const finalResultEvent = vosk.onFinalResult((res) => {
      setResult(processRes(res));
    });
    const errorEvent = vosk.onError((e) => {
      console.error("5.." + e);
    });
    const timeoutEvent = vosk.onTimeout(() => {
      console.log("Recognizer timed out");
      setRecognizing(false);
    });
    return () => {
      resultEvent.remove();
      partialResultEvent.remove();
      finalResultEvent.remove();
      errorEvent.remove();
      timeoutEvent.remove();
    };
  }, []);

  return (
    <YStack gap={"$3"} justify={"flex-start"} items={"center"}>
      <XStack>
        <Button onPress={ready ? unload : load}>
          {ready ? "Unload model" : "Load model"}
        </Button>
      </XStack>
      {!recognizing && (
        <XStack>
          <Button onPress={record} disabled={!ready}>
            Record
          </Button>
          <Button onPress={recordGrammar} disabled={!ready}>
            Record with grammar
          </Button>
          <Button onPress={recordTimeout} disabled={!ready}>
            Record with timeout
          </Button>
        </XStack>
      )}
      {recognizing && <Button onPress={stop}>Stop</Button>}
      <Text>{result ? result : "..."}</Text>
    </YStack>
  );
});

TestVosk.displayName = "TestVosk";
