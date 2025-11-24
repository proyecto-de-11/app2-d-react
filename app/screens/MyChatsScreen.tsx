import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { messagingService } from '../../services/messagingService';
import { ChatWithUserData } from '../../types/messaging-types';

export default function MyChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatWithUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadChats();
    }
  }, [userId]);

  const loadUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(parseInt(storedUserId, 10));
      }
    } catch (error) {
      console.error('Error al obtener userId:', error);
    }
  };

  const loadChats = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await messagingService.getUserChats(userId);

      // Obtener datos de cada participante
      const chatsWithUserData: (ChatWithUserData | null)[] = await Promise.all(
        response.chats.map(async (chat) => {
          try {
            const userProfile = await messagingService.getPublicProfile(
              chat.otherParticipant.usuarioId
            );
            return {
              chatId: chat.chatId,
              usuarioId: userProfile.usuarioId,
              nombreCompleto: userProfile.nombreCompleto,
              fotoPerfil: userProfile.fotoPerfil,
              biografia: userProfile.biografia,
            };
          } catch (error) {
            console.error('Error al obtener perfil del usuario:', error);
            return null;
          }
        })
      );

      // Filtrar chats que no pudieron cargar usando type guard
      const validChats = chatsWithUserData.filter((chat): chat is ChatWithUserData => chat !== null);
      setChats(validChats);
    } catch (error) {
      console.error('Error al cargar chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (chat: ChatWithUserData) => {
    router.push({
      pathname: '/screens/ChatScreen',
      params: {
        chatId: chat.chatId.toString(),
        otherUserId: chat.usuarioId.toString(),
        otherUserName: chat.nombreCompleto,
        otherUserPhoto: chat.fotoPerfil || 'https://via.placeholder.com/40',
      },
    });
  };

  const renderChat = ({ item }: { item: ChatWithUserData }) => (
    <TouchableOpacity style={styles.chatCard} onPress={() => handleChatPress(item)}>
      <Image
        source={{ uri: item.fotoPerfil || 'https://via.placeholder.com/60' }}
        style={styles.chatImage}
      />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.nombreCompleto}</Text>
        <Text style={styles.chatBio} numberOfLines={1}>
          {item.biografia}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0084ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.chatId.toString()}
        contentContainerStyle={chats.length === 0 ? styles.centerContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes conversaciones activas</Text>
            <Text style={styles.emptySubtext}>
              Ve a la pestaña Perfiles para iniciar una conversación
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  chatImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  chatBio: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
