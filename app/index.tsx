
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback, ImageBackground, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';

// ======================================================================================
// HOME SCREEN API INTEGRATION
// - Fetches and displays a list of popular courts from the provided API.
// - Defines a TypeScript interface for the `Cancha` object for type safety.
// - Adds loading and data states to handle the API lifecycle.
// - Creates a reusable `PopularCourtCard` component for clean, dynamic rendering.
// - Displays a loading indicator or a "no courts" message when appropriate.
// ======================================================================================


interface UserData {
  nombreCompleto: string;
  fotoPerfil: string;
}

// 1. Define the interface for the Court object based on the API response
interface Cancha {
  id: number;
  nombre: string;
  ubicacion: string;
  calificacion_promedio: string;
  precio_hora: string;
  // Adding a placeholder for the image, as it's not in the API response
  imagen_url?: string; 
}

// 2. Create a reusable component for the popular court card
const PopularCourtCard: React.FC<{ court: Cancha }> = ({ court }) => (
  <TouchableOpacity style={styles.popularCourtCard}>
    <Image 
      source={{ uri: court.imagen_url || `https://picsum.photos/seed/${court.id}/200/200` }} 
      style={styles.popularCourtImage}
    />
    <View style={styles.popularCourtInfo}>
        <Text style={styles.popularCourtTitle} numberOfLines={1}>{court.nombre}</Text>
        <Text style={styles.popularCourtLocation} numberOfLines={1}>{court.ubicacion}</Text>
        <View style={styles.popularCourtRating}>
            <Ionicons name="star" size={16} color="#FFC700"/>
            <Text style={styles.popularCourtRatingText}>{parseFloat(court.calificacion_promedio).toFixed(1)}</Text>
        </View>
    </View>
      <View style={styles.popularCourtPriceContainer}>
        <Text style={styles.popularCourtPrice}>${parseFloat(court.precio_hora).toFixed(2)}/hr</Text>
      </View>
  </TouchableOpacity>
);

const HomeScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);

  // 3. Add state for courts and their loading status
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [canchasLoading, setCanchasLoading] = useState(true);

  // 4. Create a function to fetch courts from the API
  const fetchCanchas = async () => {
    setCanchasLoading(true);
    try {
      const response = await axios.get('https://apicanchasyreservas.onrender.com/api/canchas');
      // Filter for active courts only, as per API structure
      const activeCanchas = response.data.filter((cancha: any) => cancha.esta_activa === 1);
      setCanchas(activeCanchas);
    } catch (error) {
      console.error("Failed to fetch courts:", error);
      // Optionally, set an error state here to show a message to the user
    } finally {
      setCanchasLoading(false);
    }
  };

  const fetchUserData = async () => {
    setUserLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');
      if (!userId || !token) {
        router.replace('/login');
        return;
      }
      const response = await axios.get(`https://apiautentificacion.onrender.com/api/perfiles/usuario/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
    } catch (err) {
       const error = err as AxiosError;
       if (error.response && error.response.status !== 404) {
          console.error("Failed to fetch user data:", error);
          await AsyncStorage.clear();
          router.replace('/login');
      }
    } finally {
      setUserLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const checkProfileStatus = async () => {
        const profileExists = await AsyncStorage.getItem('profileExists');
        if (profileExists === 'false') {
          setProfileModalVisible(true);
        } else {
          setProfileModalVisible(false);
          fetchUserData();
        }
      };
      checkProfileStatus();
      fetchCanchas(); // Fetch courts every time the screen is focused
    }, [])
  );

  const handleLogout = async () => {
    setMenuVisible(false);
    await AsyncStorage.clear();
    router.replace('/login');
  };

  const navigateToProfile = () => {
    setMenuVisible(false);
    router.push('/screens/ProfileScreen');
  };

  const navigateToCreateProfile = () => {
    setProfileModalVisible(false);
    router.push('/screens/CreateProfileScreen');
  };

  const firstName = userData?.nombreCompleto ? userData.nombreCompleto.split(' ')[0] : 'Usuario';

  const renderCategory = (icon: any, name: string) => (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={styles.categoryIconContainer}>
        <MaterialCommunityIcons name={icon} size={28} color="#7033FF" />
      </View>
      <Text style={styles.categoryText}>{name}</Text>
    </TouchableOpacity>
  );
  
  // 5. Create a render function for the popular courts section
  const renderPopularCourts = () => {
    if (canchasLoading) {
      return <ActivityIndicator size="large" color="#7033FF" style={{marginTop: 20}}/>;
    }

    if (canchas.length === 0) {
      return <Text style={styles.noCourtsText}>No hay canchas populares disponibles en este momento.</Text>;
    }

    return canchas.map(court => <PopularCourtCard key={court.id} court={court} />);
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeSubtitle}>Bienvenido,</Text>
            {userLoading ? (
              <ActivityIndicator color="#1A1A1A" style={{alignSelf: 'flex-start'}}/>
            ) : (
              <Text style={styles.welcomeTitle}>{firstName}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => setMenuVisible(true)}>
            {userLoading || !userData?.fotoPerfil ? (
               <View style={styles.profileIconPlaceholder}><Feather name="user" size={28} color="#7033FF" /></View>
            ) : (
              <Image source={{ uri: userData.fotoPerfil }} style={styles.profileImage} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={22} color="#8A8A93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar canchas, torneos..."
            placeholderTextColor="#8A8A93"
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Categorías</Text>
            <View style={styles.categoriesGrid}>
                {renderCategory("soccer-field", "Fútbol")}
                {renderCategory("basketball", "Básquet")}
                {renderCategory("tennis", "Tenis")}
                {renderCategory("volleyball", "Vóley")}
            </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Promociones</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContainer}>
            <TouchableOpacity style={styles.promoCard}>
                <ImageBackground 
                    source={{uri: 'https://images.unsplash.com/photo-1540203204368-a74a36a75f87?q=80&w=1974&auto=format&fit=crop'}}
                    style={styles.promoBackground}
                    imageStyle={{borderRadius: 20}}
                >
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.promoOverlay}>
                        <Text style={styles.promoText}>2x1 en canchas de fútbol</Text>
                        <Text style={styles.promoSubText}>Válido todos los lunes</Text>
                    </LinearGradient>
                </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity style={styles.promoCard}>
                <ImageBackground 
                    source={{uri: 'https://images.unsplash.com/photo-1551955132-a9ac60243457?q=80&w=2070&auto=format&fit=crop'}}
                    style={styles.promoBackground}
                    imageStyle={{borderRadius: 20}}
                >
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.promoOverlay}>
                        <Text style={styles.promoText}>25% OFF para estudiantes</Text>
                        <Text style={styles.promoSubText}>Presentando credencial</Text>
                    </LinearGradient>
                </ImageBackground>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={[styles.sectionContainer, {marginBottom: 100}]}>
          <Text style={styles.sectionTitle}>Canchas Populares</Text>
            {/* 6. Replace static card with the dynamic render function */}
            {renderPopularCourts()}
        </View>
        
      </ScrollView>

      {/* --- Unchanged Code: Bottom Nav & Modals --- */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={26} color={'#7033FF'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('./screens/PublicProfilesScreen')} >
            <Ionicons name="compass-outline" size={28} color="#8A8A93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('./screens/MyChatsScreen')}>
            <Ionicons name="chatbubble-ellipses-outline" size={26} color="#8A8A93" />
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={isProfileModalVisible} transparent={true} animationType="fade" onRequestClose={() => {}}>
        <View style={styles.profileModalOverlay}>
          <View style={styles.modalContentContainer}>
            <Feather name="info" size={40} color="#fff" />
            <Text style={styles.modalTitle}>¡Completa tu perfil!</Text>
            <Text style={styles.modalText}>Para disfrutar de todas las funcionalidades, por favor, crea tu perfil de usuario.</Text>
            <TouchableOpacity onPress={navigateToCreateProfile}>
                <LinearGradient colors={['#7033FF', '#B34CFF']} style={styles.modalButton} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}>
                    <Text style={styles.modalButtonText}>Crear Perfil</Text>
                </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal transparent={true} visible={menuVisible} onRequestClose={() => setMenuVisible(false)} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuOption} onPress={navigateToProfile}><Feather name="user" size={20} color="#1A1A1A" /><Text style={styles.menuText}>Ver mi perfil</Text></TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuOption} onPress={handleLogout}><Feather name="log-out" size={20} color="#E74C3C" /><Text style={[styles.menuText, { color: '#E74C3C' }]}>Cerrar Sesión</Text></TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FC' },
  scrollView: { flex: 1 },
  contentContainer: { paddingVertical: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeSubtitle: { fontSize: 16, color: '#8A8A93', fontWeight: '400' },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  profileButton: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  profileImage: { width: '100%', height: '100%', borderRadius: 18 },
  profileIconPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  searchContainer: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#1A1A1A', marginLeft: 10, fontWeight: '500' },
  filterButton: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor: '#7033FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
  },
  sectionContainer: { marginTop: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 20, paddingHorizontal: 20 },
  categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
  },
  categoryCard: {
      width: '48%',
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 18,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 4,
  },
  categoryIconContainer: {
      width: 45,
      height: 45,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F7F3FF',
      borderRadius: 14,
      marginRight: 10,
  },
  categoryText: { fontSize: 14, color: '#1A1A1A', fontWeight: '600' },
  horizontalScrollContainer: { paddingHorizontal: 20, paddingBottom: 10, gap: 15 },
  promoCard: {
      width: 280,
      height: 160,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      backgroundColor: '#fff',
  },
  promoBackground: { width: '100%', height: '100%' },
  promoOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      padding: 15,
      borderRadius: 20,
  },
  promoText: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginBottom: 5 },
  promoSubText: { fontSize: 14, color: '#E0E0E0', fontWeight: '500' },
  popularCourtCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 15, // Added margin for spacing between cards
  },
  popularCourtImage: { width: 80, height: 80, borderRadius: 14 },
  popularCourtInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  popularCourtTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 5 },
  popularCourtLocation: { fontSize: 14, color: '#8A8A93', marginBottom: 8 },
  popularCourtRating: { flexDirection: 'row', alignItems: 'center' },
  popularCourtRatingText: { marginLeft: 5, color: '#1A1A1A', fontWeight: '600' },
  popularCourtPriceContainer: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#F7F3FF',
      borderRadius: 10,
  },
  popularCourtPrice: { color: '#7033FF', fontWeight: 'bold', fontSize: 14 },
  noCourtsText: {
    textAlign: 'center',
    color: '#8A8A93',
    fontSize: 16,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Changed for a lighter feel
    backdropFilter: 'blur(10px)', // For iOS blur effect
    borderRadius: 22,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 10,
  },
  navItem: { alignItems: 'center', padding: 5 },

  // Modal styles
  profileModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContentContainer: { width: '100%', maxWidth: 360, backgroundColor: '#1F222A', borderRadius: 25, padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#fff', textAlign: 'center' },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#C7C7CD', lineHeight: 24 },
  modalButton: { borderRadius: 16, paddingVertical: 18, width: '100%', alignItems: 'center', elevation: 2 },
  modalButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  menuContainer: { position: 'absolute', top: 100, right: 20, backgroundColor: 'white', borderRadius: 16, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 10, width: 200 },
  menuOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  menuText: { marginLeft: 12, fontSize: 16, fontWeight: '500', color: '#1A1A1A' },
  menuDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },
});

export default HomeScreen;
