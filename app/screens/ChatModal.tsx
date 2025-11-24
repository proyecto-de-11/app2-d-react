import { Send, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { messagingService } from '../../services/messagingService';
import { socketService } from '../../services/socketService';
import { Mensaje } from '../../types/messaging-types';
import { useMessaging } from '../contexts/MessagingContext';
import { MessageBubble } from './components/MessageBubble';

export default function ChatModal() {
  const { userId, modalVisible, currentChat, closeChatModal, triggerRefreshChats } = useMessaging();
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [needsInitialMessage, setNeedsInitialMessage] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Debug log
  console.log('=== ChatModal Render ===');
  console.log('modalVisible:', modalVisible);
  console.log('currentChat:', currentChat);
  console.log('userId:', userId);

  useEffect(() => {
    if (modalVisible && currentChat && userId) {
      initializeChat();
    }

    return () => {
      // Limpiar al desmontar
      if (modalVisible) {
        socketService.offNewMessage();
        socketService.disconnect();
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
      // Si ya tenemos un chatId, cargar mensajes directamente
      if (currentChat.chatId) {
        setChatId(currentChat.chatId);
        await loadMessages(currentChat.chatId);
        connectWebSocket();
      } else {
        // Verificar si existe el chat
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
      const response = await messagingService.verifyOrCreateChat(
        userId,
        currentChat.otherUserId
      );

      if (response.estatus === 200 && response.chat) {
        // Chat ya existe
        setChatId(response.chat.id);
        await loadMessages(response.chat.id);
        connectWebSocket();
      } else if (response.estatus === 404) {
        // No existe chat, necesita mensaje inicial
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
      setMessages((prev) => [...prev, nuevoMensaje]);
      setTimeout(() => scrollToBottom(), 100);
    });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !userId || !currentChat) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      if (needsInitialMessage) {
        // Crear chat con mensaje inicial
        const response = await messagingService.verifyOrCreateChat(
          userId,
          currentChat.otherUserId,
          messageText
        );

        if (response.estatus === 201 && response.chat) {
          setChatId(response.chat.id);
          setNeedsInitialMessage(false);
          await loadMessages(response.chat.id);
          connectWebSocket();
          triggerRefreshChats();
        }
      } else if (chatId) {
        // Enviar mensaje por WebSocket
        socketService.sendMessage(chatId, messageText);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setInputText(messageText); // Restaurar el texto en caso de error
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleClose = () => {
    socketService.offNewMessage();
    socketService.disconnect();
    setMessages([]);
    setChatId(null);
    setNeedsInitialMessage(false);
    closeChatModal();
  };

  const renderMessage = ({ item }: { item: Mensaje }) => (
    <MessageBubble mensaje={item.mensaje} isOwn={item.usuarioId === userId} />
  );

  if (!modalVisible) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#000" />
          </TouchableOpacity>
          <Image
            source={{ uri: currentChat?.otherUserPhoto || 'https://via.placeholder.com/40' }}
            style={styles.headerImage}
          />
          <Text style={styles.headerName}>{currentChat?.otherUserName}</Text>
        </View>

        {/* Messages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0084ff" />
          </View>
        ) : needsInitialMessage ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Escribe un mensaje para iniciar la conversación
            </Text>
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
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay mensajes aún</Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Send size={20} color={inputText.trim() ? '#0084ff' : '#ccc'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: '#ffffff',
    zIndex: 9999,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  closeButton: {
    marginRight: 12,
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  messagesList: {
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
