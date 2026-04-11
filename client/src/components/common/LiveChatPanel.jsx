import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { SOCKET_BASE_URL } from "@/constants/api";
import {
  getChatMessages,
  getChatableUsers,
  getOrCreateChat,
  getUserChats,
} from "@/services/chatService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

const getUserId = (user) => user?._id || user?.id || user?.userId || null;

const LiveChatPanel = ({ initialParticipantId = null }) => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const activeChatRef = useRef(null);
  const initialParticipantRef = useRef(null);
  const socketRef = useRef(null);

  const socket = useMemo(() => {
    if (!token) return null;

    console.log("🔌 Connecting to socket:", SOCKET_BASE_URL);

    const socketInstance = io(SOCKET_BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    // Add connection event handlers for debugging
    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setSocketConnected(true);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      setSocketConnected(false);
      toast.error("Chat connection failed");
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setSocketConnected(false);
    });

    socketInstance.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    // Store socket in ref for cleanup
    socketRef.current = socketInstance;

    return socketInstance;
  }, [token]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [chatList, userList] = await Promise.all([
          getUserChats(),
          getChatableUsers(),
        ]);
        setChats(chatList.data || []);
        setUsers(userList.data || []);
      } catch (error) {
        toast.error("Failed to load chat data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleMessage = ({ chatId, message }) => {
      console.log("📨 Received message:", { chatId, message });

      setChats((previous) =>
        previous.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                lastMessage: message.content,
                lastMessageTime: message.timestamp,
              }
            : chat,
        ),
      );

      if (activeChatRef.current?._id === chatId) {
        setMessages((previous) => [...previous, message]);
      }
    };

    const handleChatJoined = ({ chatId }) => {
      console.log("✅ Successfully joined chat:", chatId);
    };

    socket.on("chat:message", handleMessage);
    socket.on("chat:joined", handleChatJoined);

    return () => {
      socket.off("chat:message", handleMessage);
      socket.off("chat:joined", handleChatJoined);
    };
  }, [socket]);

  // Cleanup socket only on component unmount
  useEffect(() => {
    return () => {
      if (socketRef.current && socketRef.current.connected) {
        console.log("🔴 Disconnecting socket on component unmount");
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  useEffect(() => {
    if (!socket || !activeChat?._id) return;

    console.log("🔗 Joining chat:", activeChat._id);
    socket.emit("chat:join", { chatId: activeChat._id });

    return () => {
      console.log("👋 Leaving chat:", activeChat._id);
      socket.emit("chat:leave", { chatId: activeChat._id });
    };
  }, [socket, activeChat]);

  const openChatWithUser = async (participantId) => {
    try {
      const response = await getOrCreateChat(participantId);
      const chat = response.data;
      setActiveChat(chat);
      await loadMessages(chat._id);

      setChats((previous) => {
        const exists = previous.some((item) => item._id === chat._id);
        return exists ? previous : [chat, ...previous];
      });
    } catch (error) {
      toast.error("Failed to start chat");
    }
  };

  useEffect(() => {
    if (!initialParticipantId) return;
    if (initialParticipantRef.current === initialParticipantId) return;

    initialParticipantRef.current = initialParticipantId;
    openChatWithUser(initialParticipantId);
  }, [initialParticipantId]);

  const loadMessages = async (chatId) => {
    try {
      const response = await getChatMessages(chatId);
      setMessages(response.data || []);
    } catch (error) {
      toast.error("Failed to load messages");
    }
  };

  const handleChatSelect = async (chat) => {
    setActiveChat(chat);
    await loadMessages(chat._id);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed || !activeChat?._id) return;

    setMessageInput("");

    if (!socket || !socket.connected) {
      console.error("❌ Socket not connected");
      toast.error("Live connection unavailable");
      return;
    }

    console.log("📤 Sending message:", {
      chatId: activeChat._id,
      content: trimmed,
    });

    socket.emit(
      "chat:message",
      { chatId: activeChat._id, content: trimmed },
      (response) => {
        if (response) {
          if (response.success) {
            console.log("✅ Message sent successfully");
          } else {
            console.error("❌ Message failed:", response.message);
            toast.error(response.message || "Failed to send message");
          }
        }
      },
    );
  };

  const currentUserId = getUserId(user);

  return (
    <div className="grid gap-6 md:grid-cols-[300px_1fr] h-[600px] min-h-0 bg-background/50 backdrop-blur-xl rounded-[32px] border border-border/40 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Sidebar: Chat List */}
      <div className="flex min-h-0 flex-col border-r border-border/40 bg-card/40">
        <div className="p-5 border-b border-border/40 bg-muted/10">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="h-5 w-5 text-brandMainColor dark:text-brandSubColor" />
            <h3 className="font-bold text-lg">Conversations</h3>
            {socketConnected ? (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] uppercase font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse"></span>
                Live
              </span>
            ) : (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] uppercase font-bold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                Offline
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brandMainColor border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Recent Chats */}
              <div className="space-y-3">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground px-2">
                  Recent Messages
                </p>
                <div className="space-y-1">
                  {chats.length === 0 && (
                    <p className="text-sm text-muted-foreground px-2 italic">
                      No chats yet.
                    </p>
                  )}
                  {chats.map((chat) => {
                    const otherParticipant = chat.participants?.find(
                      (participant) => participant._id !== currentUserId,
                    );
                    const isActive = activeChat?._id === chat._id;
                    return (
                      <button
                        key={chat._id}
                        type="button"
                        onClick={() => handleChatSelect(chat)}
                        className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition-all duration-200 border border-transparent ${
                          isActive
                            ? "bg-brandMainColor/10 dark:bg-brandSubColor/10 border-brandMainColor/20 dark:border-brandSubColor/20 shadow-sm"
                            : "hover:bg-muted/50 hover:border-border/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isActive ? "bg-brandMainColor text-white dark:bg-brandSubColor dark:text-slate-900" : "bg-muted text-muted-foreground"}`}
                          >
                            {(
                              otherParticipant?.name ||
                              otherParticipant?.email ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p
                              className={`font-bold line-clamp-1 ${isActive ? "text-brandMainColor dark:text-brandSubColor" : "text-foreground"}`}
                            >
                              {otherParticipant?.name ||
                                otherParticipant?.email ||
                                "Producer"}
                            </p>
                            <p
                              className={`text-xs line-clamp-1 mt-0.5 ${isActive ? "text-foreground/80" : "text-muted-foreground"}`}
                            >
                              {chat.lastMessage || "Start a conversation"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Available Users */}
              <div className="space-y-3">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground px-2">
                  Market Contacts
                </p>
                <div className="space-y-1">
                  {users.length === 0 && (
                    <p className="text-sm text-muted-foreground px-2 italic">
                      No producers found.
                    </p>
                  )}
                  {users.map((participant) => (
                    <button
                      key={participant._id}
                      type="button"
                      onClick={() => openChatWithUser(participant._id)}
                      className="w-full rounded-2xl px-4 py-2.5 text-left transition-all duration-200 hover:bg-muted/50 border border-transparent hover:border-border/50 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-xs font-bold text-secondary-foreground">
                        {(participant.name || participant.email || "P")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">
                          {participant.name || participant.email}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">
                          {participant.role}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="relative flex min-h-0 flex-col bg-card/60">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:16px_16px] pointer-events-none z-0" />

        {/* Chat Header */}
        <div className="p-5 border-b border-border/40 bg-muted/5 backdrop-blur-md relative z-10 flex items-center justify-between shadow-sm">
          {activeChat ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brandMainColor/10 dark:bg-brandSubColor/10 border border-brandMainColor/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-brandMainColor dark:text-brandSubColor" />
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-tight">
                  Active Negotiation
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
                  Connected securely
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-lg text-muted-foreground">
                No Chat Selected
              </h3>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col space-y-6 overflow-y-scroll p-6 custom-scrollbar">
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 space-y-4">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-xl font-bold">Select a conversation</h4>
                <p className="text-sm">
                  Choose a contact from the sidebar to chat
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-brandMainColor/10 dark:bg-brandSubColor/10 flex items-center justify-center rotate-12">
                    <MessageCircle className="w-8 h-8 text-brandMainColor dark:text-brandSubColor -rotate-12" />
                  </div>
                  <div className="max-w-xs">
                    <p className="text-foreground tracking-tight font-bold">
                      Start a new negotiation
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Say hello and discuss clean energy rates
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, idx) => {
                  const isMe =
                    message.sender?._id === currentUserId ||
                    message.sender === currentUserId;
                  const showAvatar =
                    idx === 0 ||
                    isMe !==
                      (messages[idx - 1].sender?._id === currentUserId ||
                        messages[idx - 1].sender === currentUserId);

                  return (
                    <div
                      key={`${message._id || message.timestamp || idx}`}
                      className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {!isMe && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-auto shadow-sm">
                          P
                        </div>
                      )}
                      {!isMe && !showAvatar && (
                        <div className="w-8 shrink-0"></div>
                      )}

                      <div
                        className={`max-w-[75%] rounded-[24px] px-5 py-3 text-[15px] shadow-[0_2px_10px_rgb(0,0,0,0.04)] font-medium ${
                          isMe
                            ? "bg-brandMainColor text-white rounded-br-sm"
                            : "bg-muted border border-border/50 text-foreground rounded-bl-sm"
                        }`}
                      >
                        {message.content}
                      </div>

                      {isMe && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-auto border border-primary/30 shadow-sm">
                          Me
                        </div>
                      )}
                      {isMe && !showAvatar && (
                        <div className="w-8 shrink-0"></div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        {activeChat && (
          <div className="p-5 border-t border-border/40 bg-background/50 backdrop-blur-xl relative z-10">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3">
              <div className="relative flex-1">
                <Input
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  placeholder={
                    socketConnected
                      ? "Type your message..."
                      : "Waiting for connection..."
                  }
                  disabled={!socketConnected}
                  className="h-14 rounded-2xl border-border/50 bg-background pl-6 pr-4 focus-visible:ring-brandMainColor/50 shadow-inner"
                />
              </div>
              <Button
                type="submit"
                className="h-14 w-14 rounded-2xl bg-brandMainColor hover:bg-brandMainColor/90 shadow-md transition-transform active:scale-95 shrink-0"
                disabled={!socketConnected || !messageInput.trim()}
              >
                <Send className="h-5 w-5 ml-1" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChatPanel;
