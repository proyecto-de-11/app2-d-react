
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { messagingService } from '../../services/messagingService';
import { Usuario } from '../../types/messaging-types';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function PublicProfilesScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      const data = await messagingService.getPublicProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessagePress = (profile: Usuario) => {
    if (!userId) {
      alert('Error: No se encontró el ID de usuario.');
      return;
    }
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

  const filteredProfiles = useMemo(() => 
    profiles.filter(p => 
        p.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase())
    ), [profiles, searchQuery]);

  const renderProfile = ({ item }: { item: Usuario }) => (
    <View style={styles.profileCard}>
        <Image source={{ uri: item.fotoPerfil || 'https://via.placeholder.com/80' }} style={styles.profileImage} />
        <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{item.nombreCompleto}</Text>
            <Text style={styles.profileBio} numberOfLines={2}>{item.biografia}</Text>
        </View>
        <TouchableOpacity style={styles.messageButton} onPress={() => handleMessagePress(item)}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#7033FF" />
        </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="chevron-left" size={28} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Explorar</Text>
          <View style={{width: 40}}/>
      </View>

      <View style={styles.searchContainer}>
          <Feather name="search" size={22} color="#8A8A93" />
          <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre..."
              placeholderTextColor="#8A8A93"
              value={searchQuery}
              onChangeText={setSearchQuery}
          />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#7033FF" />
            <Text style={styles.loadingText}>Buscando perfiles...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProfiles}
          renderItem={renderProfile}
          keyExtractor={(item) => item.usuarioId.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No se encontraron perfiles</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 35,
  },
  backButton: {
      padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  searchContainer: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 15,
    marginTop: 5,
  },
  searchInput: {
      flex: 1,
      fontSize: 16,
      color: '#1A1A1A',
      marginLeft: 12,
      fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  profileBio: {
    fontSize: 14,
    color: '#8A8A93',
    lineHeight: 20,
  },
  messageButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#F7F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#8A8A93',
  },
});
