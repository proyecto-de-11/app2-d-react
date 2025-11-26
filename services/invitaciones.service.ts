import type { CrearInvitacionDTO, Invitacion, ResponderInvitacionDTO } from '@/types/invitacion-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL para invitaciones
const INVITACIONES_BASE_URL = 'https://apiequiposyjugadores.onrender.com';

/**
 * Envía una solicitud para unirse a un equipo
 * @param invitacionData - Datos de la invitación
 * @returns Promise con la invitación creada
 */
export async function enviarSolicitudUnirse(invitacionData: CrearInvitacionDTO): Promise<Invitacion> {
    const urlCompleta = `${INVITACIONES_BASE_URL}/api/invitaciones`;

    console.log('📨 Enviando solicitud para unirse al equipo:', invitacionData.equipoId);

    try {
        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await axios.post<Invitacion>(urlCompleta, invitacionData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                accept: '*/*'
            },
        });

        console.log('✅ Solicitud enviada exitosamente:', response.data.id);
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("❌ Error al enviar solicitud:", {
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });

            if (error.response?.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            } else if (error.response?.status === 400) {
                throw new Error('Datos inválidos. Verifica la información.');
            } else if (error.response?.status === 409) {
                throw new Error('Ya existe una solicitud pendiente para este equipo.');
            }

            throw new Error(`Error al enviar solicitud: ${error.message}`);
        }
        console.error("❌ Error inesperado:", error);
        throw new Error("Ocurrió un error desconocido al enviar la solicitud.");
    }
}

/**
 * Obtiene las invitaciones de un equipo
 * @param equipoId - ID del equipo
 * @param params - Parámetros de paginación (page, size, sort)
 * @returns Promise con las invitaciones paginadas
 */
export async function obtenerInvitacionesEquipo(
    equipoId: number,
    params: { page?: number; size?: number; sort?: string[] } = { page: 0, size: 20, sort: ['id'] }
): Promise<import('@/types/invitacion-types').InvitacionesPaginadas> {
    const { page = 0, size = 20, sort = ['id'] } = params;

    // Construir query params
    const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    // Agregar sort params
    sort.forEach(s => queryParams.append('sort', s));

    const urlCompleta = `${INVITACIONES_BASE_URL}/api/invitaciones/equipo/${equipoId}?${queryParams.toString()}`;

    console.log('📥 Obteniendo invitaciones del equipo:', equipoId);

    try {
        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await axios.get<import('@/types/invitacion-types').InvitacionesPaginadas>(urlCompleta, {
            headers: {
                Authorization: `Bearer ${token}`,
                accept: '*/*'
            },
        });

        console.log('✅ Invitaciones obtenidas:', response.data.totalElements);
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("❌ Error al obtener invitaciones:", {
                status: error.response?.status,
                message: error.message
            });

            if (error.response?.status === 401) {
                throw new Error('No autorizado para ver las invitaciones.');
            } else if (error.response?.status === 403) {
                throw new Error('No tienes permisos para ver las invitaciones de este equipo.');
            }

            throw new Error(`Error al obtener invitaciones: ${error.message}`);
        }
        console.error("❌ Error inesperado:", error);
        throw new Error("Ocurrió un error desconocido al obtener las invitaciones.");
    }
}

/**
 * Responde a una invitación (Aceptar/Rechazar)
 * @param respuestaData - Datos de la respuesta
 * @returns Promise con la invitación actualizada
 */
export async function responderInvitacion(respuestaData: ResponderInvitacionDTO): Promise<Invitacion> {
    const urlCompleta = `${INVITACIONES_BASE_URL}/api/invitaciones/${respuestaData.id}/respuesta`;

    console.log(`📨 Respondiendo invitación ${respuestaData.id} con estado: ${respuestaData.nuevoEstado}`);

    try {
        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await axios.put<Invitacion>(urlCompleta, respuestaData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                accept: '*/*'
            },
        });

        console.log('✅ Invitación respondida exitosamente:', response.data.id);
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("❌ Error al responder invitación:", {
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });

            if (error.response?.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            } else if (error.response?.status === 403) {
                throw new Error('No tienes permisos para responder esta invitación.');
            } else if (error.response?.status === 404) {
                throw new Error('Invitación no encontrada.');
            }

            throw new Error(`Error al responder invitación: ${error.message}`);
        }
        console.error("❌ Error inesperado:", error);
        throw new Error("Ocurrió un error desconocido al responder la invitación.");
    }
}
