
import { ChevronLeft, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
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
import { useMessaging } from '../contexts/MessagingContext';
import { MessageBubble } from './components/MessageBubble';

const CHAT_BACKGROUND_URI = 'https://www.transparenttextures.com/patterns/gplay.png';

export default function ChatModal() {
  const { userId, modalVisible, currentChat, closeChatModal, triggerRefreshChats } = useMessaging();
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [needsInitialMessage, setNeedsInitialMessage] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (modalVisible && currentChat && userId) {
      initializeChat();
    }
    return () => {
      if (modalVisible) {
        socketService.offNewMessage();
        socketService.offUserTyping();
        socketService.disconnect();
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
      }
    };
  }, [modalVisible, currentChat]);

  const initializeChat = async () => {
    if (!currentChat || !userId) return;
    setLoading(true);
    setMessages([]);
    setChatId(null);
    setNeedsInitialMessage(false);
    try {
      if (currentChat.chatId) {
        setChatId(currentChat.chatId);
        await loadMessages(currentChat.chatId);
        connectWebSocket();
      } else {
        await verifyOrCreateChat();
      }
    } catch (error) {
      console.error('Error al inicializar chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyOrCreateChat = async () => {
    if (!userId || !currentChat) return;
    try {
      const response = await messagingService.verifyOrCreateChat(userId, currentChat.otherUserId);
      if (response.estatus === 200 && response.chat) {
        setChatId(response.chat.id);
        await loadMessages(response.chat.id);
        connectWebSocket();
      } else if (response.estatus === 404) {
        setNeedsInitialMessage(true);
      }
    } catch (error) {
      console.error('Error al verificar chat:', error);
    }
  };

  const loadMessages = async (chatIdToLoad: number) => {
    try {
      const response = await messagingService.getChatMessages(chatIdToLoad);
      setMessages(response.messages);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  const connectWebSocket = () => {
    if (!userId) return;
    socketService.connect(userId);
    socketService.onNewMessage((nuevoMensaje: Mensaje) => {
      if(nuevoMensaje.usuarioId !== userId){
        setMessages((prev) => [...prev, nuevoMensaje]);
        setTimeout(() => scrollToBottom(), 100);
      }
    });
    socketService.onUserTyping((data: any) => {
        const typingUserId = typeof data.usuarioId === 'string' ? parseInt(data.usuarioId) : data.usuarioId;
        if (typingUserId === currentChat?.otherUserId) {
          setIsOtherUserTyping(data.isTyping);
        }
    });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !userId || !currentChat) return;
    const messageText = inputText.trim();
    setInputText('');
    try {
      if (needsInitialMessage) {
        const response = await messagingService.verifyOrCreateChat(userId, currentChat.otherUserId, messageText);
        if (response.estatus === 201 && response.chat) {
          setChatId(response.chat.id);
          setNeedsInitialMessage(false);
          await loadMessages(response.chat.id);
          connectWebSocket();
          triggerRefreshChats();
        }
      } else if (chatId) {
        const tempMessage: Mensaje = { id: Date.now(), usuarioId: userId, mensaje: messageText };
        setMessages((prev) => [...prev, tempMessage]);
        setTimeout(() => scrollToBottom(), 100);
        socketService.sendMessage(chatId, messageText);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setInputText(messageText);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleClose = () => {
    closeChatModal();
    triggerRefreshChats();
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (chatId && text.length > 0) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socketService.sendTyping(chatId, true);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTyping(chatId, false);
      }, 2000);
    } else if (chatId) {
      socketService.sendTyping(chatId, false);
    }
  };

  const renderMessage = ({ item }: { item: Mensaje }) => (
    <MessageBubble mensaje={item.mensaje} isOwn={item.usuarioId === userId} />
  );

  if (!modalVisible) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <ImageBackground 
        source={{ uri: CHAT_BACKGROUND_URI }}
        style={styles.container}
        resizeMode="repeat"
        imageStyle={{ opacity: 0.05 }}
      >
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#5D23E4', '#A044FF']} style={styles.header}>
          <View style={styles.headerContent}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <ChevronLeft size={30} color="#fff" />
              </TouchableOpacity>
              <Image
                source={{ uri: currentChat?.otherUserPhoto || 'https://via.placeholder.com/40' }}
                style={styles.headerImage}
              />
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerName} numberOfLines={1}>{currentChat?.otherUserName}</Text>
                {isOtherUserTyping && (
                  <Text style={styles.typingIndicator}>escribiendo...</Text>
                )}
              </View>
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
        >
          {loading ? (
            <View style={styles.centeredContainer}>
              <ActivityIndicator size="large" color="#7033FF" />
            </View>
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
                  {needsInitialMessage ? (
                    <Text style={styles.emptyText}>
                      Escribe un mensaje para iniciar la conversación
                    </Text>
                  ) : (
                    <Text style={styles.emptyText}>Aún no hay mensajes. ¡Saluda!</Text>
                  )}
                </View>
              }
              style={{backgroundColor: 'transparent'}}
            />
          )}

          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, styles.shadow]}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={handleInputChange}
                    placeholder="Escribe un mensaje..."
                    placeholderTextColor="#9E9E9E"
                    multiline
                />
                <TouchableOpacity onPress={handleSendMessage} disabled={!inputText.trim()} activeOpacity={0.7}>
                    <LinearGradient 
                        colors={inputText.trim() ? ['#8A4CFF', '#5D23E4'] : ['#BDBDBD', '#BDBDBD']}
                        style={styles.sendButton}
                        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                    >
                        <Send size={20} color="#fff" style={{marginLeft: -1}} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F3FF', 
    zIndex: 9999,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20, 
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10, 
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  closeButton: {
    padding: 5,
    marginRight: 8,
  },
  headerImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 2
  },
  typingIndicator: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 16,
    color: '#695D89',
    textAlign: 'center',
    opacity: 0.8,
  },
  messagesList: {
    paddingTop: 10,
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12, 
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#1A1A1A',
    maxHeight: 110,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
});
