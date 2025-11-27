import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { messagingService } from '../../services/messagingService';
import { Usuario } from '../../types/messaging-types';
import { ChevronLeft, MessageSquare, Search, Frown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// =====================================================================================
// FIX - PublicProfilesScreen
// - Hides the navigation header during the initial loading state.
// - The <Stack.Screen> component is moved outside the conditional rendering
//   to ensure its options are applied immediately when the component mounts,
//   preventing the header from flashing before the loading state is determined.
// =====================================================================================

export default function PublicProfilesScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchInputRef = useRef<TextInput | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Enfocar el input SOLO cuando el usuario abre la búsqueda
  useEffect(() => {
    if (showSearch && !loading) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!showSearch) {
      searchInputRef.current?.blur();
    }
  }, [showSearch, loading]);

  const loadInitialData = async () => {
    setLoading(true);
    await loadUserId();
    await loadProfiles();
    setLoading(false);
  };

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

  const loadProfiles = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); 
      const data = await messagingService.getPublicProfiles();

      const storedUserId = await AsyncStorage.getItem('userId');

      const nuevaDATA = data.filter(profile => 
        profile.usuarioId.toString() !== storedUserId
      );

      setProfiles(nuevaDATA);
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
    }
  }, []);

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
            <Text style={styles.profileBio} numberOfLines={2}>{item.biografia || 'Sin biografía disponible.'}</Text>
        </View>
        <TouchableOpacity onPress={() => handleMessagePress(item)} activeOpacity={0.8}>
            <LinearGradient 
                colors={['#7033FF', '#B34CFF']} 
                style={styles.messageButton}
                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            >
                <MessageSquare size={22} color="#FFFFFF" />
            </LinearGradient>
        </TouchableOpacity>
    </View>
  );

  const ListHeader = useMemo(() => (
    <View style={styles.headerContainer}>
        {/* This is the custom header that appears only AFTER loading */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <ChevronLeft size={28} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Explorar Perfiles</Text>
            <TouchableOpacity
                onPress={() => setShowSearch(prev => !prev)}
                style={{width: 44, alignItems: 'center', justifyContent: 'center'}}
            >
                <Search size={22} color="#1A1A1A" />
            </TouchableOpacity>
         </View>
        {showSearch && (
          <View style={styles.searchContainer}>
              <View style={styles.searchInner}>
                <Search size={20} color="#8A8A93" style={{marginRight: 10}}/>
                <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder="Buscar por nombre..."
                    placeholderTextColor="#8A8A93"
                    value={searchInput}
                    onChangeText={setSearchInput}
                    returnKeyType="search"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      setSearchQuery(searchInput);
                      Keyboard.dismiss();
                    }}
                 />
                <TouchableOpacity
                    onPress={() => {
                      setSearchQuery(searchInput);
                      Keyboard.dismiss();
                    }}
                    activeOpacity={0.8}
                    style={{marginLeft: 8}}
                >
                    <LinearGradient
                        colors={["#7033FF", "#B34CFF"]}
                        style={styles.searchButton}
                        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                    >
                        <Search size={18} color="#FFFFFF" />
                    </LinearGradient>
                </TouchableOpacity>
              </View>
          </View>
        )}
     </View>
  ), [showSearch, searchInput, loading]);

  return (
    <>
      {/* This ensures the header is hidden immediately, before any rendering logic. */}
      <Stack.Screen options={{ headerShown: false }} />

      {loading ? (
        // Loading State: Full screen, no header
        <LinearGradient colors={['#5D23E4', '#A044FF']} style={styles.loadingScreen}>
          <StatusBar barStyle="light-content" />
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Buscando perfiles...</Text>
        </LinearGradient>
      ) : (
        // Content State: Custom header is part of the list
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          {/* Header separado para que el TextInput no se desmonte cuando la FlatList se re-renderiza */}
          {ListHeader}
          <FlatList
            data={filteredProfiles}
            renderItem={renderProfile}
            keyExtractor={(item) => item.usuarioId.toString()}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Frown size={64} color="#C2C2D6" />
                <Text style={styles.emptyTitle}>No se encontraron perfiles</Text>
                <Text style={styles.emptySubtitle}>
                    Intenta con otro nombre o verifica que lo hayas escrito correctamente.
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FF',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5D23E4', 
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerContainer: {
      paddingTop: 40, // Adjusted for SafeArea, as the main container is no longer a SafeAreaView
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerButton: {
      padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15, 
    paddingTop: 10,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#EDEDF1',
  },
  searchInput: {
      flex: 1,
      fontSize: 16,
      color: '#1A1A1A',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#7033FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  profileImage: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: '#e0e0e0',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  profileBio: {
    fontSize: 14,
    color: '#8A8A93',
    lineHeight: 20,
  },
  messageButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A4A6A',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8A8A93',
    textAlign: 'center',
    marginTop: 10,
  },
});
