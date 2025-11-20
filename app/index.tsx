
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons'; // Added Feather here
import { Search } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HomeScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('userToken');

        if (!userId || !token) {
          router.replace('/screens/LoginScreen');
          return;
        }

        const response = await axios.get(`https://apiautentificacion.onrender.com/api/perfiles/usuario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Failed to fetch user data for home screen:", error);
        await AsyncStorage.clear();
        router.replace('/screens/LoginScreen');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Safer way to get the first name
  const firstName = userData?.nombreCompleto ? userData.nombreCompleto.split(' ')[0] : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.welcomeContainer}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.welcomeText}>¡Hola, {firstName}!</Text>
              )}
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/screens/ProfileScreen')}>
              {loading || !userData?.fotoPerfil ? (
                 <View style={styles.profileIconPlaceholder}><Feather name="user" size={30} color="#4A90E2" /></View>
              ) : (
                <Image source={{ uri: userData.fotoPerfil }} style={styles.profileImage} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar canchas..."
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.categoriesContainer}>
            <TouchableOpacity style={styles.categoryBox}>
              <MaterialCommunityIcons name="soccer-field" size={32} color="#00A79D" />
              <Text style={styles.categoryText}>Fútbol</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryBox}>
              <MaterialCommunityIcons name="basketball" size={32} color="#4A90E2" />
              <Text style={styles.categoryText}>Básquet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryBox}>
               <MaterialCommunityIcons name="tennis" size={32} color="#4A90E2" />
              <Text style={styles.categoryText}>Tenis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryBox}>
              <MaterialCommunityIcons name="volleyball" size={32} color="#50E3C2" />
              <Text style={styles.categoryText}>Vóley</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.promotionsTitle}>Promociones</Text>

          <View style={styles.promotionsGrid}>
            <TouchableOpacity style={styles.promotionCard}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/150/FFC107/000000?Text=Cancha+1' }}
                style={styles.promotionImage}
              />
              <Text style={styles.promotionText}>Reserva 2 horas y paga 1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.promotionCard}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/150/4CAF50/FFFFFF?Text=Cancha+2' }}
                style={styles.promotionImage}
              />
              <Text style={styles.promotionText}>Descuento para estudiantes</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
      
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color={Colors.light.tint} />
          <Text style={[styles.navText, { color: Colors.light.tint }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screen_a/ListUsuarios')}>
          <Ionicons name="search" size={24} color="#888" />
          <Text style={styles.navText}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#888" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screens/ProfileScreen')}>
          <Ionicons name="person-outline" size={24} color="#888" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F7',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 20,
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  profileIconPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    position: 'absolute',
    bottom: -25,
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 80,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 30,
  },
  categoryBox: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    backgroundColor: 'white',
    width: 75,
    height: 85,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  promotionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  promotionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  promotionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  promotionImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  promotionText: {
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    zIndex: 100,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});

export default HomeScreen;
