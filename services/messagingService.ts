import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  CreateChatResponse,
  GetChatsResponse,
  GetMessagesResponse,
  Usuario,
  VerifyChatResponse,
} from '../types/messaging-types';
import { RespuestaChats } from '@/types/nuevos-types';

const MESSAGING_API = 'https://apimensajeria.onrender.com/api';
const AUTH_API = 'https://apiautentificacion.onrender.com/api';

export const messagingService = {
  // Obtener todos los perfiles públicos
  async getPublicProfiles(): Promise<Usuario[]> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${AUTH_API}/perfiles/publicos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener perfiles públicos:', error);
      throw error;
    }
  },

  // Obtener perfil de un usuario específico
  async getPublicProfile(usuarioId: number): Promise<Usuario> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');
      console.log(`📡 Petición getPublicProfile para usuarioId: ${usuarioId}, token: ${token ? 'existe' : 'NO existe'}`);
      
      const response = await axios.get(`${AUTH_API}/perfiles/publicos/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log(`✅ Perfil recibido para usuarioId ${usuarioId}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error en getPublicProfile para usuarioId ${usuarioId}:`);
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message || error.message);
      console.error('   Full error:', error.response?.data);
      throw error;
    }
  },

  // Verificar si existe un chat o crearlo con mensaje inicial
  async verifyOrCreateChat(
    userId1: number,
    userId2: number,
    mensajeInicial?: string
  ): Promise<VerifyChatResponse | CreateChatResponse> {
    try {
      const payload: any = {
        userId1,
        userId2,
      };

      if (mensajeInicial) {
        payload.mensajeInicial = mensajeInicial;
      }

      const response = await axios.post(`${MESSAGING_API}/chats`, payload);
      return response.data;
    } catch (error: any) {
      // La API devuelve 404 cuando no existe el chat
      if (error.response && error.response.status === 404) {
        return error.response.data;
      }
      console.error('Error al verificar/crear chat:', error);
      throw error;
    }
  },

  // Obtener chats del usuario
  async getUserChats(userId: number): Promise<GetChatsResponse> {
    console.log('usario nnumero :',userId)
    try {
      const response = await axios.get(`${MESSAGING_API}/chats/usuario/${userId}`);
      console.log('Chats del usuario:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener chats del usuario:', error);
      throw error;
    }
  },

  // Obtener mensajes de un chat
  async getChatMessages(chatId: number): Promise<GetMessagesResponse> {
    try {
      const response = await axios.get(`${MESSAGING_API}/chats/${chatId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      throw error;
    }
  },

  async getGroupChats(equipos: number[]): Promise<{chatId:number,grupoId:number}[]> {
    const resultado = equipos.join(',');
    console.log('buscando los chat de estos equipos')
    console.log(resultado)
    try {
      const response = await axios.get<RespuestaChats>(`${MESSAGING_API}/chats/groups/${resultado}`);

      if (response.data.filtrochat.length === 0) {
        return [];

      }
      
      const result = response.data.filtrochat.map((chat) => {
        return {
          chatId: chat.id,
          grupoId: chat.grupoId,
        }
      });
      console.log('extraendo los chat de la pai con equipos')
      
      return result
    } catch (error) {
      console.error('Error al obtener chats grupales:', error);
      throw error;
    }
  },
};
