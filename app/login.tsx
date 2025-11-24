
import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import axios, { isAxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Versión final. Corregido el bug que impedía hacer clic en "Regístrate".
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const formAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(formAnim, {
                toValue: 0,
                duration: 900,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ])
    ]).start();
  }, [fadeAnim, formAnim]);

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://apiautentificacion.onrender.com/api/auth/login', {
        email,
        password,
      });

      if (response.data.token && response.data.userId) {
        const { token, userId } = response.data;
        
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userId', String(userId));

        try {
          await axios.get(`https://apiautentificacion.onrender.com/api/perfiles/usuario/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await AsyncStorage.setItem('profileExists', 'true');
        } catch (profileError) {
          if (isAxiosError(profileError) && profileError.response && profileError.response.status === 404) {
            await AsyncStorage.setItem('profileExists', 'false');
          }
        }
        router.replace('/');
      } else {
        Alert.alert('Error de Inicio de Sesión', 'Respuesta inválida del servidor.');
      }
    } catch (error) {
      let errorMessage = 'Ocurrió un error inesperado.';
      if (isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Error (${error.response.status}): ${error.response.data.message || 'Credenciales incorrectas.'}`;
        } else if (error.request) {
          errorMessage = 'No se pudo conectar al servidor.';
        }
      }
      Alert.alert('Error de Inicio de Sesión', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#5D23E4', '#A044FF']} style={styles.header}>
            <SafeAreaView style={styles.safeAreaHeader}>
                <Animated.View style={[styles.topBar, {opacity: fadeAnim}]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="chevron-left" size={26} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.topBarTextContainer}>
                        <Text style={styles.topBarText}>¿No tienes cuenta?</Text>
                        <TouchableOpacity onPress={() => router.push('/screens/CreateAccountScreen')} style={styles.getStartedButton}>
                            <Text style={styles.getStartedButtonText}>Regístrate</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                <Animated.Text style={[styles.appName, {opacity: fadeAnim, transform: [{scale: fadeAnim}]}]}>Jobsly</Animated.Text>
            </SafeAreaView>
        </LinearGradient>
      
        {/* CORRECCIÓN: Se añade pointerEvents="box-none" para permitir clics en los elementos de detrás */}
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.keyboardView}
            pointerEvents="box-none"
        >
            <Animated.View style={[styles.formContainer, {transform: [{translateY: formAnim}]}]} pointerEvents="auto">
                <Text style={styles.title}>Bienvenido de Nuevo</Text>
                <Text style={styles.subtitle}>Ingresa tus datos para continuar</Text>

                <Text style={styles.inputLabel}>Correo Electrónico</Text>
                <View style={styles.inputWrapper}>
                    <TextInput 
                        placeholder="Ingresa tu correo electrónico"
                        placeholderTextColor="#C7C7CD"
                        style={styles.input} 
                        value={email} 
                        onChangeText={setEmail} 
                        keyboardType="email-address" 
                        autoCapitalize="none"
                    />
                </View>

                <Text style={styles.inputLabel}>Contraseña</Text>
                <View style={[styles.inputWrapper, {marginBottom: 20}]}>
                    <TextInput 
                        placeholder="Ingresa tu contraseña"
                        placeholderTextColor="#C7C7CD"
                        style={styles.input} 
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry={!isPasswordVisible}
                    />
                    <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                        <Feather name={isPasswordVisible ? "eye" : "eye-off"} size={22} color="#C7C7CD" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.85}>
                    <LinearGradient colors={['#7033FF', '#B34CFF']} style={styles.buttonGradient} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}>
                        <Text style={styles.buttonText}>Iniciar Sesión</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotPasswordButton}>
                    <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
            </Animated.View>
        </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FF', 
  },
  header: {
    height: '38%',
    width: '100%',
  },
  safeAreaHeader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  topBarTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    paddingLeft: 14,
    height: 36,
  },
  topBarText: {
    color: '#E0D7FF',
    fontSize: 13,
    fontWeight: '500',
  },
  getStartedButton: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginLeft: 10,
  },
  getStartedButtonText: {
    color: '#5D23E4',
    fontWeight: 'bold',
    fontSize: 13,
  },
  appName: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
  },
  keyboardView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  formContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingHorizontal: 35,
    paddingVertical: 35,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8A8A93',
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 12,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDEDF1',
    height: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '500',
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  button: {
    borderRadius: 16,
    marginTop: 15,
    shadowColor: '#7033FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
  },
  buttonGradient: {
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: 30,
  },
  forgotPasswordText: {
    color: '#8A8A93',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default LoginScreen;
