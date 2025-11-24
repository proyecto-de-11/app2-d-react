import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface CurrentChat {
  chatId: number | null;
  otherUserId: number;
  otherUserName: string;
  otherUserPhoto: string;
}

interface MessagingContextType {
  userId: number | null;
  modalVisible: boolean;
  currentChat: CurrentChat | null;
  openChatModal: (chat: CurrentChat) => void;
  closeChatModal: () => void;
  refreshChats: boolean;
  triggerRefreshChats: () => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentChat, setCurrentChat] = useState<CurrentChat | null>(null);
  const [refreshChats, setRefreshChats] = useState(false);

  useEffect(() => {
    // Obtener userId de AsyncStorage al montar
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        }
      } catch (error) {
        console.error('Error al obtener userId:', error);
      }
    };

    loadUserId();
  }, []);

  const openChatModal = (chat: CurrentChat) => {
    console.log('=== openChatModal called ===');
    console.log('chat data:', chat);
    setCurrentChat(chat);
    setModalVisible(true);
    console.log('Modal visible set to true');
  };

  const closeChatModal = () => {
    console.log('=== closeChatModal called ===');
    setModalVisible(false);
    setCurrentChat(null);
    // Trigger refresh de la lista de chats al cerrar el modal
    setRefreshChats(prev => !prev);
  };

  const triggerRefreshChats = () => {
    setRefreshChats(prev => !prev);
  };

  return (
    <MessagingContext.Provider
      value={{
        userId,
        modalVisible,
        currentChat,
        openChatModal,
        closeChatModal,
        refreshChats,
        triggerRefreshChats,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging debe usarse dentro de MessagingProvider');
  }
  return context;
};
