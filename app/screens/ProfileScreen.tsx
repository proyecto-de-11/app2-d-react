
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { ArrowLeft, Edit, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// ======================================================================================
// VIBRANT EDITION - ProfileScreen (FIXED... FOR REAL)
// - Reverted to the original export structure to fix the HMR crash.
// - The Vibrant UI remains unchanged.
// - Logic is 100% untouched.
// ======================================================================================

interface UserProfile {
  fotoPerfil: string;
  nombreCompleto: string;
  usuario: { email: string; };
  biografia: string;
  documentoIdentidad: string; 
  fechaNacimiento: string;
  genero: string;
  telefono: string;
  ciudad: string;
  pais: string;
}

const userCreations = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80' },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80' },
  { id: '3', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80' },
  { id: '4', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80' },
  { id: '5', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80' },
  { id: '6', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80' },
];

const ProfileScreen = () => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // --- LOGIC IS UNTOUCHED ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('userToken');

        if (!userId || !token) {
          router.replace('/login');
          return;
        }
        
        const response = await axios.get(`https://apiautentificacion.onrender.com/api/perfiles/usuario/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
      await AsyncStorage.clear();
      router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7033FF" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No se pudieron cargar los datos del perfil.</Text>
         <TouchableOpacity onPress={() => router.replace('/login')} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* --- Header Section --- */}
        <LinearGradient colors={['#5D23E4', '#A044FF']} style={styles.header}>
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.navButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.navButton}>
              <LogOut size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Image 
            source={{ uri: userData.fotoPerfil || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{userData.nombreCompleto}</Text>
          <Text style={styles.biography}>{userData.biografia || 'Sin biografía'}</Text>
        </LinearGradient>

        {/* --- Stats and Actions Section --- */}
        <View style={styles.contentArea}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}><Text style={styles.statValue}>120</Text><Text style={styles.statLabel}>Creaciones</Text></View>
            <View style={styles.statItem}><Text style={styles.statValue}>1.2M</Text><Text style={styles.statLabel}>Seguidores</Text></View>
            <View style={styles.statItem}><Text style={styles.statValue}>340</Text><Text style={styles.statLabel}>Seguidos</Text></View>
          </View>
          
          <TouchableOpacity style={styles.editButton} onPress={() => router.push('/screens/EditProfileScreen')}>
            <LinearGradient colors={['#7033FF', '#B34CFF']} style={styles.editButtonGradient}>
                <Edit size={18} color="#fff" style={{marginRight: 8}}/>
                <Text style={styles.editButtonText}>Editar Perfil</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* --- Content Grid Section --- */}
        <View style={styles.gridContainer}>
            {userCreations.map(item => (
                <TouchableOpacity key={item.id} style={styles.gridItem}>
                    <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
                </TouchableOpacity>
            ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F2FB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F2FB' },
  errorText: { color: '#1A1A1A', fontSize: 18, marginBottom: 20 },
  errorButton: { backgroundColor: '#7033FF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  errorButtonText: { color: '#fff', fontSize: 16 },

  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 60, // Increased padding to push down the stats card
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  navBar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, position: 'absolute', top: 50 },
  navButton: { padding: 10 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginTop: 30,
  },
  name: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  biography: { fontSize: 15, color: 'rgba(255, 255, 255, 0.9)', marginTop: 5, paddingHorizontal: 30, textAlign: 'center' },
  
  contentArea: {
    paddingHorizontal: 20,
    marginTop: -40, // Pulls the content up to overlap the header
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  statLabel: { fontSize: 14, color: '#8A8A93', marginTop: 4 },

  editButton: {
      borderRadius: 25,
      shadowColor: '#7033FF',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 10,
  },
  editButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  editButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 25,
  },
  gridItem: {
    width: '32%',
    height: 120,
    marginBottom: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  gridImage: { width: '100%', height: '100%' },
});

export default ProfileScreen;
