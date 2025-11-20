
import React from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Image } from 'react-native';

const LoginScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/react-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Bienvenido</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.buttonOutline]}>
        <Text style={[styles.buttonText, styles.buttonOutlineText]}>Crear Cuenta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  buttonOutlineText: {
    color: '#007BFF',
  },
});

export default LoginScreen;
