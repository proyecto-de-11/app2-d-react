import { useRouter } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MessagingEntryScreen() {
  const router = useRouter();

  const handleEnterMessaging = () => {
    router.push('/screens/ProfileScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MessageSquare size={80} color="#0084ff" />
        <Text style={styles.title}>Sistema de Mensajería</Text>
        <Text style={styles.subtitle}>
          Conecta con otros usuarios y comienza a chatear en tiempo real
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleEnterMessaging}>
          <Text style={styles.buttonText}>Comenzar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#0084ff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
