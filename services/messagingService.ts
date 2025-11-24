import axios from 'axios';
import {
    CreateChatResponse,
    GetChatsResponse,
    GetMessagesResponse,
    Usuario,
    VerifyChatResponse,
} from '../types/messaging-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const response = await axios.get(`${AUTH_API}/perfiles/publicos/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
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
    try {
      const response = await axios.get(`${MESSAGING_API}/chats/usuario/${userId}`);
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
};
