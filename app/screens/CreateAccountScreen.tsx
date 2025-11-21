
import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  Image, 
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import axios, { isAxiosError } from 'axios';

const CreateAccountScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleCreateAccount = async () => {
    try {
      const response = await axios.post('https://apiautentificacion.onrender.com/api/auth/register', {
        email,
        contrasena: password, // The API expects 'contrasena'
        idRol: 2, // Default value
        estaActivo: true, // Default value
      });

      Alert.alert('Cuenta Creada', 'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.');
      router.replace('/login');

    } catch (error) {
      console.error('Error al crear la cuenta:', JSON.stringify(error, null, 2));

      let errorMessage = 'Ocurrió un error inesperado. Inténtalo de nuevo.';

      if (isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Error del servidor (${error.response.status}): ${error.response.data.message || 'No se pudo crear la cuenta.'}`;
        } else if (error.request) {
          errorMessage = 'No se pudo conectar al servidor. Revisa tu conexión a internet.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      Alert.alert('Error al Crear Cuenta', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={['#1c1e2a', '#2a2d3e']}
        style={styles.background}
      >
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerContainer}>
            <Image source={require('@/assets/images/react-logo.png')} style={styles.logo} />
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#8a8d97" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                placeholderTextColor="#8a8d97"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#8a8d97" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#8a8d97"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateAccount}
              disabled={!(email && password)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={!(email && password) ? ['#4a4e69', '#3a3d51'] : ['#8e44ad', '#c0392b']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>Crear Cuenta</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.footerText}>¿Ya tienes una cuenta? <Text style={styles.signUpText}>Inicia Sesión</Text></Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aab1d6',
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#2a2d3e',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1e2a',
    borderRadius: 10,
    marginBottom: 20,
  },
  inputIcon: {
    padding: 15,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    paddingRight: 15,
  },
  button: {
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonGradient: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#aab1d6',
  },
  signUpText: {
    color: '#8e44ad',
    fontWeight: 'bold',
  },
});

export default CreateAccountScreen;
