
import { Stack } from 'expo-router';
import "../global.css";
import { MessagingProvider } from './contexts/MessagingContext';

export default function RootLayout() {

  return (
    <MessagingProvider>
      <Stack>
        <Stack.Screen name="index" options={{headerShown:false}}  />
        <Stack.Screen name="login" options={{headerShown:false }} />
        <Stack.Screen name="screen_a/ListUsuarios" options={{headerShown:false }} />
        <Stack.Screen name="screens/ProfileScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/EditProfileScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/CreateAccountScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/CreateProfileScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/MessagingEntryScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/SetUserIdScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/ChatScreen" options={{headerShown:false }} />
        <Stack.Screen name="(tabs)" options={{headerShown:false }} />
      </Stack>
    </MessagingProvider>
  );
}
