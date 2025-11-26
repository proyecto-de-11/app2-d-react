// Tipos para el sistema de miembros de equipos

export interface Miembro {
    id: number;
    equipoId: number;
    usuarioId: number;
    rol: string;
    numeroCamiseta: number;
    posicion: string;
    estado: string;
    fechaUnion: string;
    equipo: {
        id: number;
        nombre: string;
        logo: string;
        ciudad: string;
    };
}

export interface MiembrosPaginados {
    content: Miembro[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            unsorted: boolean;
            sorted: boolean;
            empty: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    numberOfElements: number;
    size: number;
    number: number;
    sort: {
        unsorted: boolean;
        sorted: boolean;
        empty: boolean;
    };
    first: boolean;
    empty: boolean;
}

export interface MiembrosParams {
    page?: number;
    size?: number;
    sort?: string[];
}
