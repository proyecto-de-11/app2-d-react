import type { CrearInvitacionDTO, Invitacion } from '@/types/invitacion-types';
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
