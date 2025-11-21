import { API_BASE_URL } from "@/app/URL";
import { ProfileBasic } from "@/types/ProfileBasic";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";


export async function obtenerPerfilesPublicos(): Promise<ProfileBasic[]> {
  const urlCompleta: string = `${API_BASE_URL}/api/perfiles/publicos`;

  try {
    const token = await AsyncStorage.getItem('userToken');
    // Axios realiza la solicitud GET
    const response = await axios.get<ProfileBasic[]>(urlCompleta,{headers: { Authorization: `Bearer ${token}` },});


    // Retorna los datos que se encuentran en la propiedad 'data' de la respuesta
    return response.data;
    
  } catch (error) {
    // Manejo de errores (por ejemplo, error de red, 404, 500, etc.)
    if (axios.isAxiosError(error)) {
      console.error("Error al obtener perfiles:", error.message);
      // Puedes lanzar el error o retornar un array vacío, según tu lógica de negocio
      throw new Error(`Fallo en la solicitud: ${error.message}`);
    }
    console.error("Error inesperado:", error);
    throw new Error("Ocurrió un error desconocido al obtener los perfiles.");
  }
}