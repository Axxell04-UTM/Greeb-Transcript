import { ResultMessage } from "@/interface/result_message";
import {
  WSConnectionMessage,
  WsContentMessageIn,
  WsMessageIn,
  WsMessageOut,
  WsMessageServer,
} from "@/interface/ws_message";
import { EventEmitter } from "expo";

type WebSocketEvents = {
  wsState: (connected: boolean) => void;
  wsMessageResult: (message: ResultMessage) => void;
  wsMessageServer: (reason: string) => void;
};

const myEmitter = new EventEmitter<WebSocketEvents>();

export default class WebSocketService {
  private static instance: WebSocketService;
  connection: WebSocket | null = null;
  loadingConnection = false;
  myAlias: string | null = null;
  constructor() {}

  connect(
    url: string,
    action: "create" | "join",
    password: string,
    alias: string,
  ) {
    this.loadingConnection = true;
    setTimeout(() => {
      this.loadingConnection = false;
    }, 5000);
    if (!this.connection) {
      this.connection = new WebSocket(url);
    } else {
      this.connection.close(1012, "Reconectando");
      this.connection = new WebSocket(url);
    }

    // if (this.connection.readyState < 2) {
    //   return;
    // }

    this.connection.onmessage = (e) => {
      // console.log(JSON.parse(e.data));
      // console.log("Message: ", JSON.parse(e.data));
      const data = JSON.parse(e.data);
      if (data.content) {
        // Es mensaje texto del chat
        const wsMessage: WsMessageIn = data;
        if (wsMessage.content && wsMessage.from) {
          const content: WsContentMessageIn = JSON.parse(wsMessage.content);
          console.log("wsMessage: ", content.text);
          myEmitter.emit("wsMessageResult", {
            from: wsMessage.from,
            content: content.text,
            type: "chat_message",
          });
        }
      } else if (data.type === "pong") {
        // Mantiene la conexión viva
        if (
          this.connection &&
          this.connection?.readyState === this.connection?.OPEN
        ) {
          setTimeout(() => {
            if (
              !this.connection ||
              this.connection?.readyState !== this.connection?.OPEN
            ) {
              return;
            }
            this.sendMessage({ type: "ping" });
            // console.log(`${alias} - Pong`);
          }, 20000);
        }
      } else {
        // Mensajes enviados por el servidor, conexiónes y desconexiónes
        const wsMessageServer: WsMessageServer = data;
        console.log("wsMessageServer: ", wsMessageServer);
        if (wsMessageServer.type === "success") {
          if (
            wsMessageServer.code === "created" ||
            wsMessageServer.code === "joined"
          ) {
            this.loadingConnection = false;
            this.myAlias = alias;
            if (wsMessageServer.alias === alias) {
              myEmitter.emit("wsState", true);
              setTimeout(() => {
                this.sendMessage({ type: "ping" });
              }, 1000);

              if (this.connection) {
                this.initOnClose();
              }
            }
            myEmitter.emit("wsMessageResult", {
              from: wsMessageServer.alias ?? "",
              content: wsMessageServer.code,
              type: "alert",
            });
          } else if (wsMessageServer.code === "left") {
            if (wsMessageServer.alias !== alias) {
              myEmitter.emit("wsMessageResult", {
                from: wsMessageServer.alias ?? "",
                content: wsMessageServer.code,
                type: "alert",
              });
            }
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
        this.loadingConnection = false;
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
    if (!this.connection) {
      return;
    }
    this.loadingConnection = true;
    this.connection.close(1000, "Desconexión voluntaria");

    // myEmitter.emit("wsState", false);

    console.log("Desconexión voluntaria");
    this.loadingConnection = false;
  }

  initOnClose() {
    if (!this.connection) return;
    console.log("OnClose inicializado");
    this.connection.onclose = (e) => {
      console.log("Desconectando: ", e);
      myEmitter.emit("wsState", false);
      myEmitter.emit("wsMessageResult", {
        from: this.myAlias ?? "",
        content: "left",
        type: "alert",
      });
      this.myAlias = null;
    };
  }

  async sendMessage(message: WsMessageOut | WSConnectionMessage) {
    if (
      !this.connection ||
      this.connection.readyState !== this.connection.OPEN
    ) {
      // ToastAndroid.show("No hay conexión WS establecida", ToastAndroid.SHORT);
      // console.log("No hay conexión WS establecida");
      // console.log(
      //   `Conexión: ${this.connection} | Estado de conexión: ${this.connection?.readyState}`,
      // );

      // this.disconnect();
      const content = (message as WsMessageOut).text as string;
      myEmitter.emit("wsMessageResult", {
        from: "Yo",
        content: content,
        type: "chat_message",
      });

      return;
    }
    this.connection.send(JSON.stringify(message));
  }

  onState(callback: (connected: boolean) => void) {
    myEmitter.addListener("wsState", callback);
  }

  onMessage(callback: (message: ResultMessage) => void) {
    myEmitter.addListener("wsMessageResult", callback);
  }

  onMessageServer(callback: (reason: string) => void) {
    myEmitter.addListener("wsMessageServer", callback);
  }

  removeStateListener(callback: (connected: boolean) => void) {
    myEmitter.removeListener("wsState", callback);
  }

  removeMessageListener(callback: (message: ResultMessage) => void) {
    myEmitter.removeListener("wsMessageResult", callback);
  }

  removeMessageServerListener(callback: (reason: string) => void) {
    myEmitter.removeListener("wsMessageServer", callback);
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    // if (WebSocketService.instance.connection?.readyState === 1) {
    //   WebSocketService.instance.connection.close(
    //     1000,
    //     "Desconexión voluntaria",
    //   );
    // }
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
