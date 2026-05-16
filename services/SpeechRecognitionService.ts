import { EventEmitter } from "expo";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import * as vosk from "react-native-vosk";

type Callback = (text: string) => void;

type SpeechRecognitionEvents = {
  onResult: (res: string) => void;
  onPartialResult: (res: string) => void;
  onFinalResult: (res: string) => void;
  onChangeModel: (model: "expo" | "vosk") => void;
};

const myEmitter = new EventEmitter<SpeechRecognitionEvents>();

export default class SpeechRecognitionService {
  private static instance: SpeechRecognitionService;
  usedModel: "expo" | "vosk" = "vosk";
  voskModelReady = false;
  voskModelRecognizing = false;
  expoModelRecognizing = false;
  micOn = false;
  subscriptions: any[] = [];

  result = "";
  partialResult = "";

  constructor() {
    this.voskModelLoad();
  }

  init() {
    if (!this.voskModelReady) {
      this.voskModelLoad();
    }
    // Expo
    const resultEventExpo = ExpoSpeechRecognitionModule.addListener(
      "result",
      (e) => {
        const finalText = e.results[0]?.transcript;
        if (e.isFinal) {
          this.result = finalText;
          myEmitter.emit("onResult", finalText);
        }
      },
    );

    const endEventExpo = ExpoSpeechRecognitionModule.addListener("end", () => {
      if (this.micOn) {
        this.expoRecord();
      }
    });

    const errorEventExpo = ExpoSpeechRecognitionModule.addListener(
      "error",
      () => {
        if (this.micOn) {
          this.expoRecord();
        }
      },
    );

    // Vosk
    const resultEventVosk = vosk.onResult((res) => {
      const finalText = this.processRes(res);
      console.log("An onResult event has been caught: " + finalText);
      this.result = finalText;
      myEmitter.emit("onResult", finalText);
    });

    const partialResultEventVosk = vosk.onPartialResult((res) => {
      // setResult(res);
      const partialText = this.processRes(res);
      this.partialResult = partialText;
      myEmitter.emit("onPartialResult", partialText);
    });

    const finalResultEventVosk = vosk.onFinalResult((res) => {
      const finalText = this.processRes(res);
      this.result = finalText;
    });

    const errorEventVosk = vosk.onError((e) => {
      console.error("5.." + e);
    });

    const timeoutEventVosk = vosk.onTimeout(() => {
      console.log("Recognizer timed out");
      this.voskModelRecognizing = false;
    });

    this.subscriptions = [
      resultEventVosk,
      partialResultEventVosk,
      finalResultEventVosk,
      errorEventVosk,
      timeoutEventVosk,
      resultEventExpo,
      endEventExpo,
      errorEventExpo,
    ];
  }

  dispose() {
    for (const sub of this.subscriptions) {
      sub?.remove?.();
    }
    this.subscriptions = [];
    this.voskModelUnload();
  }

  private voskModelLoad() {
    vosk
      .loadModel("vosk-model-small-es-0.42")
      .then(() => (this.voskModelReady = true))
      .catch((e) => console.error(e));
  }

  private voskModelUnload() {
    vosk.unload();
    this.voskModelReady = false;
    this.voskModelRecognizing = false;
  }

  processRes(res: string) {
    const formatedRes: { text: string } = JSON.parse(res);
    return formatedRes.text;
  }

  async expoRecord() {
    const permissRes =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permissRes.granted) {
      console.log("Permissions not granted", permissRes);
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: "es-CO",
      interimResults: true,
      continuous: false,
    });
  }

  voskRecord() {
    vosk
      .start()
      .then(() => {
        console.log("Start recognition...");
        this.voskModelRecognizing = true;
      })
      .catch((e) => console.error(e));
  }

  voskRecordGrammar() {
    vosk
      .start({ grammar: ["hola", "pokemon", "amigos", "[unk]"] })
      .then(() => {
        console.log("Start recognition with grammar...");
        this.voskModelRecognizing = true;
      })
      .catch((e) => console.error(e));
  }

  voskRecordTimeout() {
    vosk
      .start({ timeout: 5000 })
      .then(() => {
        console.log("Start recognition with timeout...");
        this.voskModelRecognizing = true;
      })
      .catch((e) => console.error(e));
  }

  voskRecordStop() {
    vosk.stop();
    console.log("Stoping recognition...");
    this.voskModelRecognizing = false;
  }

  changeUsedModel(model: "expo" | "vosk") {
    this.usedModel = model;
  }

  // Emitter

  onResult(callback: (res: string) => void) {
    myEmitter.addListener("onResult", callback);
  }

  onPartialResult(callback: (res: string) => void) {
    myEmitter.addListener("onPartialResult", callback);
  }

  onFinalResult(callback: (res: string) => void) {
    myEmitter.addListener("onFinalResult", callback);
  }

  onChangeModel(callback: (model: "expo" | "vosk") => void) {
    myEmitter.addListener("onChangeModel", callback);
  }

  removeResultListener(callback: (text: string) => void) {
    myEmitter.removeListener("onResult", callback);
  }

  removePartialResultListener(callback: (text: string) => void) {
    myEmitter.removeListener("onPartialResult", callback);
  }

  removeFinalResultListener(callback: (text: string) => void) {
    myEmitter.removeListener("onFinalResult", callback);
  }

  removeChangeModel(callback: (model: "expo" | "vosk") => void) {
    myEmitter.removeListener("onChangeModel", callback);
  }

  static getInstance(): SpeechRecognitionService {
    if (!SpeechRecognitionService.instance) {
      SpeechRecognitionService.instance = new SpeechRecognitionService();
    }
    return SpeechRecognitionService.instance;
  }
}
