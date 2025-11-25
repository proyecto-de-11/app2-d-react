
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { messagingService } from '../../services/messagingService';
import { ChatWithUserData } from '../../types/messaging-types';

// ======================================================================================
// DESIGN V7 - "Unified Edition"
// Focus: Fuses the advanced structure of V6 with the login screen's color palette.
// Logic remains 100% untouched.
// ======================================================================================

export default function MyChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatWithUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  // --- LOGIC IS UNTOUCHED ---
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
      const chatsWithUserData: ChatWithUserData[] = await Promise.all(
        response.chats.map(async (chat) => {
          try {
            const userProfile = await messagingService.getPublicProfile(chat.otherParticipant.usuarioId);
            return {
              chatId: chat.chatId,
              usuarioId: userProfile.usuarioId,
              nombreCompleto: userProfile.nombreCompleto,
              fotoPerfil: userProfile.fotoPerfil,
              biografia: userProfile.biografia,
            };
          } catch (error: any) {
            return {
              chatId: chat.chatId,
              usuarioId: chat.otherParticipant.usuarioId,
              nombreCompleto: `Usuario ${chat.otherParticipant.usuarioId}`,
              fotoPerfil: 'https://via.placeholder.com/100',
              biografia: 'Sin biografía',
            };
          }
        })
      );
      setChats(chatsWithUserData);
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
  // --- END OF UNTOUCHED LOGIC ---

  const renderChatItem = ({ item }: { item: ChatWithUserData }) => (
    <TouchableOpacity style={styles.chatCard} onPress={() => handleChatPress(item)} activeOpacity={0.8}>
      <LinearGradient colors={['#5D23E4', '#A044FF']} style={styles.avatarRing}>
        <Image source={{ uri: item.fotoPerfil || 'https://via.placeholder.com/60' }} style={styles.avatar} />
      </LinearGradient>

      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.nombreCompleto}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.biografia}</Text>
      </View>
      
      <View style={styles.metaInfo}>
        <Text style={styles.time}>10:45 AM</Text>
        <LinearGradient colors={['#7033FF', '#B34CFF']} style={styles.unreadBadge}>
            <Text style={styles.unreadText}>2</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  const ChatListHeader = () => (
    <View>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/')} style={styles.headerButton}>
              <ChevronLeft size={28} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chats</Text>
            <TouchableOpacity style={styles.headerButton}>
              <Search size={24} color="#1A1A1A" />
            </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
            <View style={styles.searchInner}>
              <Search size={20} color="#8A8A93" style={{marginRight: 10}}/>
              <TextInput placeholder="Buscar en chats..." placeholderTextColor="#8A8A93" style={styles.searchInput}/>
            </View>
        </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#7033FF" /></View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.chatId.toString()}
          ListHeaderComponent={ChatListHeader}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </View>
  );
}

// --- STYLES V7 - Unified Edition ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FF', // From login screen
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7FF',
  },
  listContentContainer: {
    paddingBottom: 30,
  },
  // -- Header --
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: '#F7F7FF', 
  },
  headerTitle: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#1A1A1A', // From login screen
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // -- Search Bar --
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25, 
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#EDEDF1', // From login screen
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  // -- Chat List Item --
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    shadowColor: '#7033FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#FFFFFF', 
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  chatName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#8A8A93', // From login screen
  },
  metaInfo: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 13,
    color: '#8A8A93',
    marginBottom: 8,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
