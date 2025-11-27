// Tipos para el sistema de mensajería

export interface Usuario {
  usuarioId: number;
  nombreCompleto: string;
  fotoPerfil: string;
  biografia: string;
}

export interface Chat {
  id: number;
  grupoId: null | number;
  estado: boolean;
  participantes?: Participante[];
}

export interface Participante {
  id: number;
  usuarioId: number;
  activo: boolean;
}

export interface Mensaje {
  id: number;
  usuarioId: number;
  mensaje: string;
}

export interface ChatWithUserData {
  chatId: number;
  usuarioId: number;
  nombreCompleto: string;
  fotoPerfil: string;
  biografia: string;
}

export interface ChatModalProps {
  visible: boolean;
  chatId: number | null;
  otherUserId: number;
  otherUserName: string;
  otherUserPhoto: string;
  onClose: () => void;
}

export interface ApiResponse<T> {
  ok: boolean;
  estatus: number;
  message: string;
  data?: T;
}

export interface VerifyChatResponse {
  ok: boolean;
  estatus: number;
  message: string;
  chat?: Chat;
  chatId?: number | null;
}

export interface CreateChatResponse {
  ok: boolean;
  estatus: number;
  message: string;
  chat: Chat;
}

export interface GetChatsResponse {
  ok: boolean;
  estatus: number;
  message: string;
  chats: {
    chatId: number;
    otherParticipant: {
      usuarioId: number;
    };
  }[];
}

export interface GetMessagesResponse {
  messages: Mensaje[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface chatGrupo {
  id:number
  chatId:number
  nombre:string
  descripcion:string

}