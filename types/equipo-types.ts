// Tipos para el sistema de equipos

export interface Equipo {
    id: number;
    nombre: string;
    creadoPor: number;
    tipoDeporteId: number;
    descripcion: string;
    logo: string;
    colorPrincipal: string;
    colorSecundario: string;
    ciudad: string;
    nivel: string | null;
    maxMiembros: number;
    requiereAprobacion: boolean;
    calificacionPromedio: number;
    totalCalificaciones: number;
    estaActivo: boolean;
    fechaCreacion: string;
    fechaActualizacion: string;
}

export interface SortInfo {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
}

export interface PageableInfo {
    pageNumber: number;
    pageSize: number;
    sort: SortInfo;
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

export interface EquiposPaginados {
    content: Equipo[];
    pageable: PageableInfo;
    totalElements: number;
    totalPages: number;
    last: boolean;
    numberOfElements: number;
    size: number;
    number: number;
    sort: SortInfo;
    first: boolean;
    empty: boolean;
}

export interface EquiposParams {
    page?: number;
    size?: number;
    sort?: string[];
}

/**
 * DTO para crear un nuevo equipo
 */
export interface CrearEquipoDTO {
    nombre: string;
    creadoPor: number;
    tipoDeporteId: number;
    descripcion: string;
    logo?: string;
    colorPrincipal: string;
    colorSecundario: string;
    ciudad: string;
    nivel?: string;
    maxMiembros: number;
    requiereAprobacion: boolean;
    estaActivo?: boolean;
}

export interface CrearMiembroDTO {
    equipoId: number;
    usuarioId: number;
    rol: string;
    numeroCamiseta: number;
    posicion: string;
    estado: string;
}
