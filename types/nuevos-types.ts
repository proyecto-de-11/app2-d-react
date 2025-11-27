// 1. Definimos la estructura de un Participante individual
export interface Participante {
  id: number;
  usuarioId: number;
  activo: boolean;
}

// 2. Definimos la estructura de un Chat individual dentro del array
export interface ChatGrupal {
  id: number;
  participantes: Participante[];
  grupoId: number;
  estado: boolean;
}

// 3. Definimos la respuesta principal de la API
export interface RespuestaChats {
  ok: boolean;
  estatus: number;
  message: string;
  filtrochat: ChatGrupal[];
}