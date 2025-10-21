"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { checkTokenExpiration } from "@/utils/checkTokenExpiration";
import "./Chat.css";

export default function Chat() {
  const [query, setQuery] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [savedChats, setSavedChats] = useState<any[]>([]);
  const [showSavedChats, setShowSavedChats] = useState(false);

  const { conversation, addMessage, clearConversation } = useChatStore();
  const { user } = useAuthStore();

  // ✅ Use environment variable for backend API base URL
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 🔹 Automatically check for token expiration every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, []);

  // 🔹 When user logs out, clear chat + answer instantly
  useEffect(() => {
    if (!user) {
      setAnswer("");
      setQuery("");
      clearConversation();
      setSavedChats([]);

      try {
        localStorage.removeItem("chat-storage"); // Remove persisted chat data
      } catch (err) {
        console.warn("Failed to clear chat storage:", err);
      }
    }
  }, [user, clearConversation]);

  // Fetch  saved chats from backend
  const loadSavedChats = async () => {
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/history`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      console.log("Loaded saved chats from backend:", data);
      setSavedChats(data); // Set saved chats state
    } catch (err) {
      console.error("Failed to load saved chats:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnswer("Loading...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: query, token: user?.token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch answer");
      }

      const answerText = data.answer || "No response from AI Model";
      setAnswer(answerText);

      // ✅ Save to global chat state
      addMessage({ question: query, answer: answerText });
      setQuery("");
    } catch (error) {
      setAnswer("Error: " + (error as Error).message);
    }
  };

  // Function to update the state with the input value
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">Ask a Question!</h1>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          id="query"
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Type your Question..."
          className="chat-input"
        />
        <button type="submit" className="chat-submit-btn">
          Query
        </button>
      </form>

      <div id="answer" className="chat-answer">
        <strong>Answer:</strong> {answer}
      </div>

      {user && (
        <div className="load-chats-container">
          <button
            onClick={async () => {
              if (!showSavedChats) {
                await loadSavedChats(); // only fetch when opening
              }
              setShowSavedChats(!showSavedChats);
            }}
            className="load-chats-btn"
          >
            {showSavedChats ? "Hide Previous Chats" : "Load Previous Chats"}
          </button>
        </div>
      )}

      {/* 🔹 Display saved chats when toggled */}
      {showSavedChats && savedChats.length > 0 && (
        <div className="saved-chats">
          <h2 className="saved-chats-title">Saved Chats</h2>
          {savedChats.map(
            (conv: { id: number; messages: any[] }, idx: number) => (
              <div key={conv.id || idx} className="saved-chat">
                {(conv.messages || []).map(
                  (msg: { question: string; answer: string }, mIdx: number) => (
                    <div key={mIdx} className="saved-message">
                      <p className="saved-question">
                        <b>Q:</b> {msg.question}
                      </p>
                      <p className="saved-answer">
                        <b>A:</b> {msg.answer}
                      </p>
                    </div>
                  )
                )}
                <hr className="saved-chat-divider" />
              </div>
            )
          )}
        </div>
      )}

      {/* 🔹 Show chat history */}
      {conversation.length > 0 && (
        <div className="chat-history">
          <h2 className="chat-history-title">Chat History</h2>
          {conversation.map((msg, idx) => (
            <div key={idx} className="chat-message">
              <p className="chat-question">
                <b>Q:</b> {msg.question}
              </p>
              <p className="chat-answer-text">
                <b>A:</b> {msg.answer}
              </p>
              <hr className="chat-divider" />
            </div>
          ))}
          <button
            onClick={() => {
              clearConversation();
              setAnswer("");
              localStorage.removeItem("chat-storage");
            }}
            className="clear-history-btn"
          >
            Clear Chat History
          </button>
        </div>
      )}
    </div>
  );
}
