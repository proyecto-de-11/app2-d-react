// Tipos para el sistema de invitaciones

export interface Invitacion {
    id: number;
    usuarioInvitadoId: number;
    usuarioRemitenteId: number;
    usuarioRespondioId: number | null;
    mensaje: string;
    estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
    fechaRespuesta: string | null;
    fechaCreacion: string;
    equipo: {
        id: number;
        nombre: string;
        logo: string;
        ciudad: string;
    };
}

export interface CrearInvitacionDTO {
    equipoId: number;
    usuarioInvitadoId: number;
    usuarioRemitenteId: number;
    mensaje: string;
}
