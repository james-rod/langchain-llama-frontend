import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  question: string;
  answer: string;
}

interface ChatState {
  conversation: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearConversation: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversation: [],

      addMessage: (message: ChatMessage) =>
        set((state) => ({
          conversation: [...state.conversation, message],
        })),

      clearConversation: () => set({ conversation: [] }),
    }),
    {
      name: "chat-storage", // Key name in localStorage
    }
  )
);
