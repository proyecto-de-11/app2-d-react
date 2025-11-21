
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        await AsyncStorage.clear();
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={['#1c1e2a', '#2a2d3e']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  if (!userData) {
    return (
      <LinearGradient colors={['#1c1e2a', '#2a2d3e']} style={styles.loadingContainer}>
        <Text style={styles.errorText}>No se encontraron datos del usuario.</Text>
      </LinearGradient>
    );
  }
  
  const InfoRow = ({ icon, label, value }) => (
    <>
      <View style={styles.infoRow}>
        <Feather name={icon} size={20} color="#8a8d97" style={styles.infoIcon} />
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      <View style={styles.divider} />
    </>
  );

  return (
    <LinearGradient colors={['#1c1e2a', '#2a2d3e']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Image 
            source={{ uri: userData.fotoPerfil || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{userData.nombreCompleto}</Text>
          <Text style={styles.email}>{userData.usuario.email}</Text>
          <Text style={styles.biography}>{userData.biografia}</Text>
        </View>

        <View style={styles.card}>
          <InfoRow icon="shield" label="Documento" value={userData.documentoIdentidad} />
          <InfoRow icon="gift" label="Nacimiento" value={new Date(userData.fechaNacimiento).toLocaleDateString('es-ES')} />
          <InfoRow icon="user" label="Género" value={userData.genero} />
          <InfoRow icon="phone" label="Teléfono" value={userData.telefono} />
          <InfoRow icon="map-pin" label="Ubicación" value={`${userData.ciudad}, ${userData.pais}`} />
        </View>

        <View style={styles.card}>
           <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/screens/EditProfileScreen')}>
            <Feather name="edit" size={20} color="#8a8d97" style={styles.actionIcon} />
            <Text style={styles.actionText}>Editar Perfil</Text>
            <Feather name="chevron-right" size={20} color="#8a8d97" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={() => router.replace('/')}>
            <Feather name="home" size={20} color="#8a8d97" style={styles.actionIcon} />
            <Text style={styles.actionText}>Regresar al inicio</Text>
            <Feather name="chevron-right" size={20} color="#8a8d97" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingVertical: 30,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: '#2a2d3e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#8e44ad',
    alignSelf: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#aab1d6',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  biography: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 16,
    color: '#aab1d6',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3d51',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  logoutText: {
    color: '#c0392b',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default ProfileScreen;
