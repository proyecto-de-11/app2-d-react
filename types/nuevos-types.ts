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




// 2. Definición del objeto Chat
export interface Chat {
  id: number;
  participantes: Participante[];
  grupoId: number;
  estado: boolean;
}

// 3. Definición de los datos principales (el nuevo miembro agregado)
export interface DatosNuevoMiembro {
  id: number;
  chat: Chat;
  usuarioId: number;
  activo: boolean;
}

// 4. La respuesta completa de la API
export interface RespuestaAgregarMiembro {
  ok: boolean;
  message: string;
  data: DatosNuevoMiembro;
}