import type { MiembrosPaginados, MiembrosParams } from '@/types/miembro-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL para miembros
const MIEMBROS_BASE_URL = 'https://apiequiposyjugadores.onrender.com';

/**
 * Obtiene los miembros de un equipo con paginación
 * @param equipoId - ID del equipo
 * @param params - Parámetros de paginación (page, size, sort)
 * @returns Promise con la respuesta paginada de miembros
 */
export async function obtenerMiembrosEquipo(
    equipoId: number,
    params: MiembrosParams = { page: 0, size: 20, sort: ['id'] }
): Promise<MiembrosPaginados> {
    const { page = 0, size = 20, sort = ['id'] } = params;

    // Construir query params
    const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    // Agregar sort params (pueden ser múltiples)
    sort.forEach(s => queryParams.append('sort', s));

    const urlCompleta = `${MIEMBROS_BASE_URL}/api/miembros/equipo/${equipoId}?${queryParams.toString()}`;

    console.log('👥 Obteniendo miembros del equipo:', equipoId);

    try {
        const token = await AsyncStorage.getItem('userToken');

        const response = await axios.get<MiembrosPaginados>(urlCompleta, {
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                accept: '*/*'
            },
        });

        console.log('✅ Miembros obtenidos:', response.data.totalElements, 'miembros');
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("❌ Error al obtener miembros:", {
                status: error.response?.status,
                message: error.message
            });
            throw new Error(`Fallo al obtener miembros: ${error.message}`);
        }
        console.error("❌ Error inesperado:", error);
        throw new Error("Ocurrió un error desconocido al obtener los miembros.");
    }
}

/**
 * Elimina un miembro del equipo
 * @param miembroId - ID del miembro a eliminar
 * @returns Promise<void>
 */
export async function eliminarMiembro(miembroId: number): Promise<void> {
    const urlCompleta = `${MIEMBROS_BASE_URL}/api/miembros/${miembroId}`;

    console.log('🗑️ Eliminando miembro:', miembroId);

    try {
        const token = await AsyncStorage.getItem('userToken');

        await axios.delete(urlCompleta, {
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                accept: '*/*'
            },
        });

        console.log('✅ Miembro eliminado exitosamente');

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("❌ Error al eliminar miembro:", {
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });
            throw new Error(error.response?.data || `Fallo al eliminar miembro: ${error.message}`);
        }
        console.error("❌ Error inesperado:", error);
        throw new Error("Ocurrió un error desconocido al eliminar el miembro.");
    }
}
