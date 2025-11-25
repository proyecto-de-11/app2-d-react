import type { CrearEquipoDTO, CrearMiembroDTO, Equipo, EquiposPaginados, EquiposParams } from '@/types/equipo-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL para equipos
const EQUIPOS_BASE_URL = 'https://apiequiposyjugadores.onrender.com';

/**
 * Obtiene los equipos del usuario autenticado con paginación
 * @param usuarioId - ID del usuario autenticado
 * @param params - Parámetros de paginación (page, size, sort)
 * @returns Promise con la respuesta paginada de equipos
 */
export async function obtenerMisEquipos(
    usuarioId: number,
    params: EquiposParams = { page: 0, size: 10, sort: ['id'] }
): Promise<EquiposPaginados> {
    const { page = 0, size = 10, sort = ['id'] } = params;

    // Construir query params
    const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    // Agregar sort params (pueden ser múltiples)
    sort.forEach(s => queryParams.append('sort', s));

    const urlCompleta = `${EQUIPOS_BASE_URL}/api/equipos/mis-equipos/${usuarioId}?${queryParams.toString()}`;

    console.log('📡 Llamando a la API de equipos:', urlCompleta);

    try {
        const token = await AsyncStorage.getItem('userToken');
        console.log('🔑 Token:', token ? 'Existe' : 'No existe');

        const response = await axios.get<EquiposPaginados>(urlCompleta, {
            headers: {
                Authorization: `Bearer ${token}`,
                accept: '*/*'
            },
        });

        console.log('✅ Equipos obtenidos:', response.data.totalElements, 'equipos');
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("❌ Error al obtener equipos:", {
                status: error.response?.status,
                message: error.message
            });
            throw new Error(`Fallo en la solicitud: ${error.message}`);
        }
        console.error("❌ Error inesperado:", error);
        throw new Error("Ocurrió un error desconocido al obtener los equipos.");
    }
}

/**
 * Obtiene el ID del usuario desde AsyncStorage
 * @returns Promise con el ID del usuario o null
 */
export async function obtenerUsuarioId(): Promise<number | null> {
    try {
        const usuarioId = await AsyncStorage.getItem('userId');
        console.log('🔍 Usuario ID:', usuarioId);

        if (usuarioId) {
            const parsedId = parseInt(usuarioId, 10);
            console.log('✅ ID parseado:', parsedId);
            return parsedId;
        }

        console.warn('⚠️ No se encontró userId en AsyncStorage');
        return null;
    } catch (error) {
        console.error("❌ Error al obtener usuario ID:", error);
        return null;
    }
}

/**
 * Crea un nuevo equipo
 * @param equipoData - Datos del equipo a crear
 * @returns Promise con el equipo creado
 */
export async function crearEquipo(equipoData: CrearEquipoDTO): Promise<Equipo> {
    const urlCompleta = `${EQUIPOS_BASE_URL}/api/equipos`;

    console.log('📝 Creando equipo:', equipoData.nombre);

    try {
        const token = await AsyncStorage.getItem('userToken');
        console.log('🔑 Token:', token ? 'Existe' : 'No existe');

        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await axios.post<Equipo>(urlCompleta, equipoData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                accept: '*/*'
            },
        });

        console.log('✅ Equipo creado exitosamente:', response.data.id);
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("❌ Error al crear equipo:", {
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });

            if (error.response?.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            } else if (error.response?.status === 400) {
                throw new Error('Datos inválidos. Verifica la información del equipo.');
            } else if (error.response?.status === 409) {
                throw new Error('Ya existe un equipo con ese nombre.');
            }

            throw new Error(`Error al crear equipo: ${error.message}`);
        }
        console.error("❌ Error inesperado:", error);
        throw new Error("Ocurrió un error desconocido al crear el equipo.");
    }
}

/**
 * Registra un nuevo miembro en un equipo
 * @param miembroData - Datos del miembro a registrar
 * @returns Promise con el miembro registrado
 */
export async function registrarMiembro(miembroData: CrearMiembroDTO): Promise<any> {
    const urlCompleta = `${EQUIPOS_BASE_URL}/api/miembros`;

    console.log('👤 Registrando miembro en equipo:', miembroData.equipoId);

    try {
        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await axios.post(urlCompleta, miembroData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                accept: '*/*',
            },
        });

        console.log('✅ Miembro registrado exitosamente:', response.data.id);
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("❌ Error al registrar miembro:", {
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });

            if (error.response?.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            } else if (error.response?.status === 400) {
                throw new Error('Datos inválidos para registrar el miembro.');
            }

            throw new Error(`Error al registrar miembro: ${error.message}`);
        }
        console.error("❌ Error inesperado al registrar miembro:", error);
        throw new Error("Ocurrió un error desconocido al registrar el miembro.");
    }
}
