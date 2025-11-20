
import { Stack } from 'expo-router';
import "../global.css"

export default function RootLayout() {
  
  return (
    <Stack
    
    >
      <Stack.Screen name="index" options={{headerShown:false}}  />
      <Stack.Screen name="screens/LoginScreen" options={{headerShown:false }} />
      <Stack.Screen name="screen_a/ListUsuarios" options={{headerShown:false }} />
      <Stack.Screen name="screens/HomeScreen" options={{ title: 'Inicio' }} />
      <Stack.Screen name="screens/ProfileScreen" options={{headerShown:false }} />
    </Stack>
  );
}
