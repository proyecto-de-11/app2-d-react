
import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inicio</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>¡Bienvenido a tu App!</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actividad Reciente</Text>
          <Text style={styles.cardContent}>Aquí verás las últimas actualizaciones.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Atajos</Text>
          <Text style={styles.cardContent}>- Ir a Perfil</Text>
          <Text style={styles.cardContent}>- Ver Notificaciones</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007BFF',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardContent: {
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;
