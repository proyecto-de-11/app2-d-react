
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

// =====================================================================================
// FIX - CreateAccountScreen
// - Removes the back arrow, mirroring the change in the Login screen for consistency.
//   This reinforces that authentication screens are the primary entry point.
// - Aligns the remaining "Sign In" button to the right.
// =====================================================================================

const CreateAccountScreen = () => {
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

  const handleCreateAccount = async () => {
    try {
      await axios.post('https://apiautentificacion.onrender.com/api/auth/registrar', {
        email,
        contrasena: password,
        idRol: 2,
        estaActivo: true,
      });

      Alert.alert('¡Cuenta Creada!', 'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.');
      router.replace('/login');

    } catch (error) {
      let errorMessage = 'Ocurrió un error inesperado. Inténtalo de nuevo.';
      if (isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Error del servidor (${error.response.status}): ${error.response.data.message || 'No se pudo crear la cuenta.'}`;
        } else if (error.request) {
          errorMessage = 'No se pudo conectar al servidor. Revisa tu conexión a internet.';
        }
      }
      Alert.alert('Error al Crear Cuenta', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#5D23E4', '#A044FF']} style={styles.header}>
            <SafeAreaView style={styles.safeAreaHeader}>
                <Animated.View style={[styles.topBar, {opacity: fadeAnim}]}>
                    {/* FIX: Back button removed, container justifies to the end */}
                    <View style={styles.topBarTextContainer}>
                        <Text style={styles.topBarText}>¿Ya tienes cuenta?</Text>
                        <TouchableOpacity onPress={() => router.push('/login')} style={styles.getStartedButton}>
                            <Text style={styles.getStartedButtonText}>Inicia Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                <Animated.Text style={[styles.appName, {opacity: fadeAnim, transform: [{scale: fadeAnim}]}]}>GOFIT</Animated.Text>
            </SafeAreaView>
        </LinearGradient>
      
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.keyboardView}
            pointerEvents="box-none"
        >
            <Animated.View style={[styles.formContainer, {transform: [{translateY: formAnim}]}]} pointerEvents="auto">
                <Text style={styles.title}>Crea tu Cuenta</Text>
                <Text style={styles.subtitle}>Disfruta de los servicios de Gofit</Text>

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

                <TouchableOpacity style={styles.button} onPress={handleCreateAccount} activeOpacity={0.85}>
                    <LinearGradient colors={['#7033FF', '#B34CFF']} style={styles.buttonGradient} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}>
                        <Text style={styles.buttonText}>Regístrate</Text>
                    </LinearGradient>
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
    // FIX: Content is pushed to the end of the flex container.
    justifyContent: 'flex-end',
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
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8A8A93',
    marginBottom: 30,
    alignSelf: 'center',
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
});

export default CreateAccountScreen;
