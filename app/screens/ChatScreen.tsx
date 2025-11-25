
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MoreVertical, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground, // Re-introducing for texture
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { messagingService } from '../../services/messagingService';
import { socketService } from '../../services/socketService';
import { Mensaje } from '../../types/messaging-types';
import { MessageBubble } from './components/MessageBubble'; // Using the new Vibrant MessageBubble

// ======================================================================================
// VIBRANT EDITION - ChatScreen
// - Dynamic, colorful, and modern UI with more personality.
// - Logic is 100% untouched.
// ======================================================================================

// Subtle background texture
const CHAT_BACKGROUND_URI = 'https://www.transparenttextures.com/patterns/gplay.png';

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const chatId = params.chatId ? parseInt(params.chatId as string) : null;
  const otherUserId = parseInt(params.otherUserId as string);
  const otherUserName = params.otherUserName as string;
  const otherUserPhoto = params.otherUserPhoto as string;

  const [userId, setUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(chatId);
  const [needsInitialMessage, setNeedsInitialMessage] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);

  // --- LOGIC IS UNTOUCHED ---
  useEffect(() => {
    loadUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      initializeChat();
    }
    return () => {
      socketService.offNewMessage();
      socketService.offUserTyping();
      socketService.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [userId]);

  const loadUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) setUserId(parseInt(storedUserId, 10));
    } catch (error) { console.error('Error al obtener userId:', error); }
  };

  const initializeChat = async () => {
    if (!userId) return;
    setLoading(true);
    setMessages([]);
    setNeedsInitialMessage(false);
    try {
      if (currentChatId) {
        await loadMessages(currentChatId);
        connectWebSocket();
      } else {
        await verifyOrCreateChat();
      }
    } catch (error) {
      console.error('Error al inicializar chat:', error);
    } finally { setLoading(false); }
  };

  const verifyOrCreateChat = async () => {
    if (!userId) return;
    try {
      const response = await messagingService.verifyOrCreateChat(userId, otherUserId);
      if (response.estatus === 200 && response.chat) {
        setCurrentChatId(response.chat.id);
        await loadMessages(response.chat.id);
        connectWebSocket();
      } else if (response.estatus === 404) {
        setNeedsInitialMessage(true);
      }
    } catch (error) { console.error('Error al verificar chat:', error); }
  };

  const loadMessages = async (chatIdToLoad: number) => {
    try {
      const response = await messagingService.getChatMessages(chatIdToLoad);
      setMessages(response.messages);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) { console.error('Error al cargar mensajes:', error); }
  };

  const connectWebSocket = () => {
    if (!userId) return;
    socketService.connect(userId);
    socketService.onNewMessage((nuevoMensaje: Mensaje) => {
      if (nuevoMensaje.usuarioId !== userId) {
        setMessages((prev) => [...prev, nuevoMensaje]);
        setTimeout(() => scrollToBottom(), 100);
      }
    });
    socketService.onUserTyping((data: any) => {
      const typingUserId = typeof data.usuarioId === 'string' ? parseInt(data.usuarioId) : data.usuarioId;
      if (typingUserId === otherUserId) {
        setIsOtherUserTyping(data.isTyping);
      }
    });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !userId) return;
    const messageText = inputText.trim();
    setInputText('');
    try {
      if (needsInitialMessage) {
        const response = await messagingService.verifyOrCreateChat(userId, otherUserId, messageText);
        if (response.estatus === 201 && response.chat) {
          setCurrentChatId(response.chat.id);
          setNeedsInitialMessage(false);
          await loadMessages(response.chat.id);
          connectWebSocket();
        }
      } else if (currentChatId) {
        const tempMessage: Mensaje = { id: Date.now(), usuarioId: userId, mensaje: messageText };
        setMessages((prev) => [...prev, tempMessage]);
        setTimeout(() => scrollToBottom(), 100);
        socketService.sendMessage(currentChatId, messageText);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setInputText(messageText);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) flatListRef.current.scrollToEnd({ animated: true });
  };

  const handleClose = () => {
    socketService.offNewMessage();
    socketService.offUserTyping();
    socketService.disconnect();
    router.back();
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (currentChatId) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socketService.sendTyping(currentChatId, text.length > 0);
      if (text.length > 0) {
        typingTimeoutRef.current = setTimeout(() => socketService.sendTyping(currentChatId, false), 2000);
      }
    }
  };
  // --- END OF UNTOUCHED LOGIC ---

  const renderMessage = ({ item }: { item: Mensaje }) => (
    <MessageBubble mensaje={item.mensaje} isOwn={item.usuarioId === userId} />
  );

  return (
    <ImageBackground 
      source={{ uri: CHAT_BACKGROUND_URI }}
      style={styles.container}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.05 }} // Subtle texture
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#5D23E4', '#A044FF']} style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <ChevronLeft size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerUserInfo}>
            <Image source={{ uri: otherUserPhoto || 'https://via.placeholder.com/40' }} style={styles.headerImage} />
            <View>
              <Text style={styles.headerName} numberOfLines={1}>{otherUserName}</Text>
              {isOtherUserTyping && <Text style={styles.typingIndicator}>escribiendo...</Text>}
            </View>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <MoreVertical size={24} color="#FFFFFF" />
          </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {loading ? (
          <View style={styles.centeredContainer}><ActivityIndicator size="large" color="#7033FF" /></View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={scrollToBottom}
            ListEmptyComponent={
              <View style={styles.centeredContainer}>
                <Text style={styles.emptyText}>Inicia la conversación. ¡Saluda!</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={handleInputChange}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#8A8A93"
              multiline
            />
          <TouchableOpacity onPress={handleSendMessage} disabled={!inputText.trim()} activeOpacity={0.7}>
            <LinearGradient 
              colors={inputText.trim() ? ['#7033FF', '#B34CFF'] : ['#E0E0E0', '#E0E0E0']}
              style={styles.sendButton}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            >
              <Send size={22} color="#FFFFFF" style={{marginLeft: -2}} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

// --- STYLES - Vibrant Edition ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F2FB', // Light purple-tinted background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 55 : 25,
    paddingBottom: 20,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerButton: {
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
  },
  headerUserInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  headerImage: { width: 44, height: 44, borderRadius: 22, marginRight: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  headerName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  typingIndicator: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#8A8A93', textAlign: 'center' },
  messagesList: { paddingTop: 15, paddingHorizontal: 5, paddingBottom: 10 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    marginBottom: Platform.OS === 'ios' ? 25 : 10,
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, 
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingHorizontal: 15,
    minHeight: 40,
    maxHeight: 120,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
