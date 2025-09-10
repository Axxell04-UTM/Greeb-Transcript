type TypeOfMessage = "set_user" | "message"

export interface WsMessage {
    type: TypeOfMessage
    content: string
}