import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
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
import { Usuario } from '../../types/messaging-types';

export default function PublicProfilesScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUserId();
    loadProfiles();
  }, []);

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

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await messagingService.getPublicProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessagePress = (profile: Usuario) => {
    console.log('Navigating to chat with:', profile.nombreCompleto);
    
    if (!userId) {
      alert('Error: No se encontró el ID de usuario. Por favor, configura tu userId primero.');
      router.push('/screens/SetUserIdScreen');
      return;
    }

    // Navegar a la pantalla de chat con parámetros
    router.push({
      pathname: '/screens/ChatScreen',
      params: {
        chatId: '',
        otherUserId: profile.usuarioId.toString(),
        otherUserName: profile.nombreCompleto,
        otherUserPhoto: profile.fotoPerfil || 'https://via.placeholder.com/40',
      },
    });
  };

  const renderProfile = ({ item }: { item: Usuario }) => (
    <View style={styles.profileCard}>
      <Image
        source={{ uri: item.fotoPerfil || 'https://via.placeholder.com/60' }}
        style={styles.profileImage}
      />
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{item.nombreCompleto}</Text>
        <Text style={styles.profileBio} numberOfLines={2}>
          {item.biografia}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => handleMessagePress(item)}
      >
        <MessageCircle size={24} color="#0084ff" />
      </TouchableOpacity>
    </View>
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
        data={profiles}
        renderItem={renderProfile}
        keyExtractor={(item) => item.usuarioId.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No hay perfiles disponibles</Text>
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
    padding: 20,
  },
  listContainer: {
    padding: 12,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: '#666',
  },
  messageButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
