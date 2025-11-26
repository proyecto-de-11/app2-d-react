import axios from 'axios';

// Base URL para usuarios
const USUARIOS_BASE_URL = 'https://apiautentificacion.onrender.com';

// Token temporal proporcionado
const TEMP_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOSVNUUkFET1IiXSwidXNlcklkIjoxLCJlbWFpbCI6ImZyYW5BZG1pbjFAZ21haWwuY29tIiwic3ViIjoiZnJhbkFkbWluMUBnbWFpbC5jb20iLCJpYXQiOjE3NjQxNjgzNzksImV4cCI6MTc2NDI1NDc3OX0.8a6XrDIcR4pYTjKg1KwWzTv3AFErLuqLjZ8TC5tYXnA";

export interface UsuarioPerfil {
    id: number;
    usuario: {
        id: number;
        email: string;
        estaActivo: boolean;
    };
    nombreCompleto: string;
    telefono: string;
    documentoIdentidad: string;
    fechaNacimiento: string;
    genero: string;
    fotoPerfil: string;
    biografia: string;
    ciudad: string;
    pais: string;
    fechaGuardado: string;
    fechaActualizacion: string;
}

/**
 * Obtiene el perfil de un usuario por su ID de usuario
 * @param usuarioId - ID del usuario
 * @returns Promise con el perfil del usuario
 */
export async function obtenerUsuarioPorId(usuarioId: number): Promise<UsuarioPerfil> {
    const urlCompleta = `${USUARIOS_BASE_URL}/api/perfiles/usuario/${usuarioId}`;

    console.log('👤 Obteniendo perfil del usuario:', usuarioId);

    try {
        const response = await axios.get<UsuarioPerfil>(urlCompleta, {
            headers: {
                Authorization: `Bearer ${TEMP_TOKEN}`,
                accept: '*/*'
            },
        });

        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`❌ Error al obtener perfil usuario ${usuarioId}:`, {
                status: error.response?.status,
                message: error.message
            });
            throw new Error(`Fallo al obtener perfil: ${error.message}`);
        }
        console.error(`❌ Error inesperado al obtener perfil usuario ${usuarioId}:`, error);
        throw new Error("Ocurrió un error desconocido al obtener el perfil.");
    }
}
