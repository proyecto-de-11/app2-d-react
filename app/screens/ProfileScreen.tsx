
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView, StatusBar
} from 'react-native';
import { ArrowLeft, Edit, LogOut, Mail, Phone, Hash, MapPin, User, Calendar as CalendarIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// ======================================================================================
// POLISHED EDITION - ProfileScreen
// - Builds upon the functional "Clean Slate" version.
// - Re-introduces a more sophisticated UI with floating cards and shadows.
// - Information is now grouped into logical cards for better readability.
// - The edit button is enhanced with a gradient to make it a clear call to action.
// - Logic remains 100% untouched.
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

const InfoRow = ({ icon: IconComponent, value, isLast = false }: { icon: React.ElementType, value: string, isLast?: boolean }) => (
  <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
    <IconComponent size={20} color="#8A8A93" style={styles.infoIcon} />
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

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
        if (!userId || !token) { router.replace('/login'); return; }
        
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

  const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return dateString; }
  }

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#622BEF" /></View>;
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
       <View style={styles.navBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.navButton}><ArrowLeft size={24} color="#fff" /></TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.navButton}><LogOut size={24} color="#fff" /></TouchableOpacity>
        </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
             <LinearGradient colors={['#622BEF', '#9D3BFF']} style={StyleSheet.absoluteFill} />
            <Image source={{ uri: userData.fotoPerfil || 'https://via.placeholder.com/150' }} style={styles.avatar} />
            <Text style={styles.name}>{userData.nombreCompleto}</Text>
            <Text style={styles.biography}>{userData.biografia || 'Sin biografía'}</Text>
        </View>
        
        <View style={styles.contentArea}>
            <Text style={styles.cardTitle}>Información de Contacto</Text>
            <View style={styles.infoCard}>
                 <InfoRow icon={Mail} value={userData.usuario.email} />
                 <InfoRow icon={Phone} value={userData.telefono} isLast />
            </View>

            <Text style={styles.cardTitle}>Datos Personales</Text>
            <View style={styles.infoCard}>
                 <InfoRow icon={Hash} value={userData.documentoIdentidad} />
                 <InfoRow icon={User} value={userData.genero} />
                 <InfoRow icon={CalendarIcon} value={formatDate(userData.fechaNacimiento)} />
                 <InfoRow icon={MapPin} value={`${userData.ciudad}, ${userData.pais}`} isLast />
            </View>

             <TouchableOpacity style={styles.editButton} onPress={() => router.push('/screens/EditProfileScreen')}>
                 <LinearGradient colors={['#7033FF', '#B34CFF']} style={styles.editButtonGradient}>
                    <Edit size={18} color="#fff" style={{marginRight: 10}}/>
                    <Text style={styles.editButtonText}>Editar Perfil</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F8' },
  scrollContent: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F8' },
  errorText: { color: '#333', fontSize: 18, marginBottom: 20 },
  errorButton: { backgroundColor: '#622BEF', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
  errorButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

   navBar: { 
    position: 'absolute', 
    top: StatusBar.currentHeight || 40, 
    left: 0, 
    right: 0, 
    zIndex: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
  },
  navButton: { padding: 10 },

  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: (StatusBar.currentHeight || 40) + 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
  },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  biography: { fontSize: 15, color: 'rgba(255, 255, 255, 0.9)', marginTop: 8, textAlign: 'center', lineHeight: 21 },
  
  contentArea: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A93',
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoRowLast: {
      borderBottomWidth: 0,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1, // Allows text to wrap
  },

  editButton: {
      borderRadius: 30,
      marginTop: 30,
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
    paddingVertical: 16,
    borderRadius: 30,
  },
  editButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

export default ProfileScreen;
