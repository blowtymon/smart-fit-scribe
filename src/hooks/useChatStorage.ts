import { useState, useEffect } from 'react';
import { Chat } from '@/components/chat/ChatManager';

export function useChatStorage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('fitness_chats');
    const savedCurrentChatId = localStorage.getItem('fitness_current_chat_id');
    
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt)
      }));
      setChats(parsedChats);
    }
    
    if (savedCurrentChatId) {
      setCurrentChatId(savedCurrentChatId);
    } else if (chats.length > 0) {
      setCurrentChatId(chats[0].id);
    }
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    localStorage.setItem('fitness_chats', JSON.stringify(chats));
  }, [chats]);

  // Save current chat ID to localStorage
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('fitness_current_chat_id', currentChatId);
    }
  }, [currentChatId]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Chat ${chats.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    setChats(chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, ...updates, updatedAt: new Date() }
        : chat
    ));
  };

  const deleteChat = (chatId: string) => {
    const filteredChats = chats.filter(chat => chat.id !== chatId);
    setChats(filteredChats);
    
    if (currentChatId === chatId) {
      if (filteredChats.length > 0) {
        setCurrentChatId(filteredChats[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === currentChatId);
  };

  const addMessageToCurrentChat = (message: any) => {
    if (currentChatId) {
      const currentChat = getCurrentChat();
      if (currentChat) {
        const updatedMessages = [...currentChat.messages, message];
        updateChat(currentChatId, { 
          messages: updatedMessages,
          title: updatedMessages.length === 1 ? message.content.slice(0, 50) + '...' : currentChat.title
        });
      }
    }
  };

  return {
    chats,
    currentChatId,
    setCurrentChatId,
    createNewChat,
    updateChat,
    deleteChat,
    getCurrentChat,
    addMessageToCurrentChat
  };
}