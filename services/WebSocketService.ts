import {
  WSConnectionMessage,
  WsMessageIn,
  WsMessageOut,
  WsMessageServer,
} from "@/interface/ws_message";
import { EventEmitter } from "expo";

type WebSocketEvents = {
  wsState: (connected: boolean) => void;
  wsMessageTranscript: (message: string) => void;
  wsMessageServer: (resason: string) => void;
};

const myEmitter = new EventEmitter<WebSocketEvents>();

export default class WebSocketService {
  private static instance: WebSocketService;
  connection: WebSocket | null = null;
  constructor() {}

  connect(
    url: string,
    action: "create" | "join",
    password: string,
    alias: string,
  ) {
    if (!this.connection) {
      this.connection = new WebSocket(url);
    } else {
      this.connection.close(1012, "Reconectando");
      this.connection = new WebSocket(url);
    }

    this.connection.onmessage = (e) => {
      console.log(JSON.parse(e.data));
      console.log("Message: ", JSON.parse(e.data));
      const data = JSON.parse(e.data);
      if (data.content) {
        const wsMessage: WsMessageIn = data;
        console.log("wsMessage: ", wsMessage.content);
        myEmitter.emit("wsMessageTranscript", wsMessage.content);
      } else {
        const wsMessageServer: WsMessageServer = data;
        console.log("wsMessageServer: ", wsMessageServer);
        if (wsMessageServer.type === "success") {
          myEmitter.emit("wsState", true);
          if (this.connection) {
            this.connection.onclose = (e) => {
              // console.log("Close: ", e);
              myEmitter.emit("wsState", false);
            };
          }
          return;
        }

        let reason = "A ocurrido un error";
        if (wsMessageServer.code === "room_not_created") {
          reason = "La sala no existe";
        } else if (wsMessageServer.code === "room_exists") {
          reason = "La sala ya existe";
        } else if (wsMessageServer.code === "invalid_password") {
          reason = "Contraseña incorrecta";
        } else if (wsMessageServer.code === "auth_required") {
          reason = "Se requiere autenticación";
        }
        myEmitter.emit("wsMessageServer", reason);
      }
    };

    this.connection.onopen = (e) => {
      // myEmitter.emit("wsState", true);
      // console.log("Open: ", e);
      this.sendMessage({ action: action, password: password, alias: alias });
    };
    // this.connection.onclose = (e) => {
    //   // console.log("Close: ", e);
    //   myEmitter.emit("wsState", false);
    // };
  }

  disconnect() {
    if (
      !this.connection ||
      this.connection.readyState !== this.connection.OPEN
    ) {
      return;
    }
    this.connection.close(1000, "Desconexión voluntaria");
    this.connection.onclose = null;
    this.connection = null;
    myEmitter.emit("wsState", false);

    console.log("Desconexión voluntaria");
  }

  async sendMessage(message: WsMessageOut | WSConnectionMessage) {
    if (
      !this.connection ||
      this.connection.readyState !== this.connection.OPEN
    ) {
      // ToastAndroid.show("No hay conexión WS establecida", ToastAndroid.SHORT);
      console.log("No hay conexión WS establecida");
      return;
    }
    this.connection.send(JSON.stringify(message));
  }

  onState(callback: (connected: boolean) => void) {
    myEmitter.addListener("wsState", callback);
  }

  onMessage(callback: (message: string) => void) {
    myEmitter.addListener("wsMessageTranscript", callback);
  }

  onMessageServer(callback: (reason: string) => void) {
    myEmitter.addListener("wsMessageServer", callback);
  }

  removeStateListener(callback: (connected: boolean) => void) {
    myEmitter.removeListener("wsState", callback);
  }

  removeMessageListener(callback: (message: string) => void) {
    myEmitter.removeListener("wsMessageTranscript", callback);
  }

  removeMessageServerListener(callback: (reason: string) => void) {
    myEmitter.removeListener("wsMessageServer", callback);
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
}

// Código	Significado
// 1000	Cierre normal (Normal Closure)
// 1001	El endpoint va a irse (Going Away)
// 1002	Error de protocolo (Protocol Error)
// 1003	Tipo de datos no soportado (Unsupported Data)
// 1005	Sin código de estado (No Status Received)
// 1006	Abnormal Closure (no enviado en la red)
// 1007	Datos inconsistentes (Invalid frame payload data)
// 1008	Violación de política (Policy Violation)
// 1009	Mensaje demasiado grande (Message Too Big)
// 1010	Extensión requerida (Missing Extension)
// 1011	Error inesperado del servidor (Internal Error)
// 1012	Servicio reiniciado (Service Restart)
// 1013	Servicio temporalmente no disponible (Try Again Later)
// 1015	Error de TLS/SSL (TLS Handshake Failure)
