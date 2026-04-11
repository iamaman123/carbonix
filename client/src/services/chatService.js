import api from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/api";

export const getUserChats = async () => {
  const { data } = await api.get(API_ENDPOINTS.CHAT.BASE);
  return data;
};

export const getChatableUsers = async () => {
  const { data } = await api.get(API_ENDPOINTS.CHAT.USERS);
  return data;
};

export const getOrCreateChat = async (participantId) => {
  const { data } = await api.post(API_ENDPOINTS.CHAT.CREATE, { participantId });
  return data;
};

export const getChatMessages = async (chatId) => {
  const { data } = await api.get(API_ENDPOINTS.CHAT.MESSAGES(chatId));
  return data;
};

export const sendChatMessage = async (chatId, content) => {
  const { data } = await api.post(API_ENDPOINTS.CHAT.SEND, { chatId, content });
  return data;
};
