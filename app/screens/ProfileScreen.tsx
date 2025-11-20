
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
          router.replace('/screens/LoginScreen');
          return;
        }
        
        const response = await axios.get(`https://apiautentificacion.onrender.com/api/perfiles/usuario/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setUserData(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        Alert.alert("Error", "No se pudieron cargar los datos del perfil. Intenta iniciar sesión de nuevo.");
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userId');
    router.replace('/screens/LoginScreen');
  };

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
        <Text style={styles.name}>No se encontraron datos del usuario.</Text>
      </LinearGradient>
    );
  }

  const formattedDate = userData.fechaNacimiento 
    ? new Date(userData.fechaNacimiento).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'long', year: 'numeric' 
      }) 
    : 'No especificada';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1c1e2a', '#2a2d3e']}
        style={styles.background}
      >
        <View style={styles.profileContainer}>
          <Image 
            source={{ uri: userData.fotoPerfil || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{userData.nombreCompleto}</Text>
          <Text style={styles.email}>{userData.usuario.email}</Text>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar Perfil</Text>
            <Feather name="edit-2" size={20} color="#fff" style={styles.editIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Información Personal</Text>
             <View style={styles.infoRow}>
              <Feather name="info" size={16} color="#aab1d6" />
              <Text style={styles.infoText}>{userData.biografia}</Text>
            </View>
             <View style={styles.infoRow}>
              <Feather name="hash" size={16} color="#aab1d6" />
              <Text style={styles.infoText}>{userData.documentoIdentidad}</Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="calendar" size={16} color="#aab1d6" />
              <Text style={styles.infoText}>{formattedDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="tag" size={16} color="#aab1d6" />
              <Text style={styles.infoText}>{userData.genero}</Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="phone" size={16} color="#aab1d6" />
              <Text style={styles.infoText}>{userData.telefono}</Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={16} color="#aab1d6" />
              <Text style={styles.infoText}>{userData.ciudad}, {userData.pais}</Text>
            </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </LinearGradient>
    </View>
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
  background: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  profileContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#aab1d6',
    marginTop: 5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8e44ad',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editIcon: {
    marginLeft: 10,
  },
  infoContainer: {
    width: '90%',
    marginTop: 30,
    backgroundColor: '#2a2d3e',
    borderRadius: 15,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#aab1d6',
    marginLeft: 10,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#c0392b',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;
