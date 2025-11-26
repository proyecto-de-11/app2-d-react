import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://apiautentificacion.onrender.com/api/tiposdeporte';

export interface TipoDeporte {
    id: number;
    nombre: string;
    descripcion: string;
    icono: string;
    estaActivo: boolean;
}

export const obtenerTipoDeportePorId = async (id: number): Promise<TipoDeporte> => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await axios.get<TipoDeporte>(
            `${API_URL}/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error al obtener tipo de deporte por ID:', error);
        throw error;
    }
};
