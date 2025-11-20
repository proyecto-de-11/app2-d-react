import { View, Text, StyleSheet, Image, Pressable } from 'react-native';

import { Colors } from '@/constants/theme';

export default function WelcomeScreen() {

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/react-logo.png')} style={styles.logo} />

        <Text style={styles.buttonText}>Comenzar</Text>
  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
