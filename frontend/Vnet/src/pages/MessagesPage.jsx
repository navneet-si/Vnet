import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useNavigate, useSearchParams } from "react-router-dom";

// Create socket outside component with better config
const socket = io("http://localhost:5000", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
});

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const currentRoomRef = useRef(null);
  const activeChatRef = useRef(null); // For socket handler to access current activeChat
  const urlProcessedRef = useRef(false); // Prevent double processing of URL params
  const socketConnectedRef = useRef(false);
  const fileInputRef = useRef(null);

  // Keep activeChatRef in sync with activeChat state
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/protected/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Function to fetch chat users - wrapped in useCallback for stability
  const fetchChatUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5000/api/protected/chat-users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setChatUsers(data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching chat users:", error);
    }
    return [];
  }, []);

  // Fetch chat users on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchChatUsers();
      setIsLoading(false);
    };
    loadData();
  }, [fetchChatUsers]);

  // Handle URL params - process only once when data is loaded
  useEffect(() => {
    // Don't process if still loading or already processed
    if (isLoading || urlProcessedRef.current) return;

    const userId = searchParams.get("userId");
    const username = searchParams.get("username");

    if (userId && username) {
      urlProcessedRef.current = true;

      // Check if user already exists in chat list
      const existingUser = chatUsers.find(
        (f) => f._id === userId || f._id.toString() === userId
      );

      if (existingUser) {
        setActiveChat(existingUser);
      } else {
        // Create new chat user
        const colors = [
          "bg-purple-600",
          "bg-orange-600",
          "bg-blue-600",
          "bg-green-600",
          "bg-pink-600",
        ];
        const decodedUsername = decodeURIComponent(username);
        const colorIndex = decodedUsername.charCodeAt(0) % colors.length;
        const newChatUser = {
          _id: userId,
          username: decodedUsername,
          role: "Member",
          color: colors[colorIndex],
          avatar: decodedUsername.charAt(0).toUpperCase(),
        };
        setActiveChat(newChatUser);
        setChatUsers((prev) => {
          if (prev.some((f) => f._id === userId)) return prev;
          return [newChatUser, ...prev];
        });
      }

      // Clear URL params after processing to prevent issues
      setSearchParams({}, { replace: true });
    } else if (chatUsers.length > 0 && !activeChat) {
      urlProcessedRef.current = true;
      setActiveChat(chatUsers[0]);
    }
  }, [searchParams, chatUsers, isLoading, activeChat, setSearchParams]);

  // Socket connection - connect once and stay connected
  useEffect(() => {
    if (socketConnectedRef.current) return;

    socket.connect();
    socketConnectedRef.current = true;

    return () => {
      socket.disconnect();
      socketConnectedRef.current = false;
    };
  }, []);

  // Socket message handling - uses ref to get current activeChat
  useEffect(() => {
    if (!currentUser) return;

    const handleReceiveMessage = (data) => {
      if (!data.roomId) return;

      const currentActiveChat = activeChatRef.current;
      const currentUserId = currentUser._id.toString();

      // Check if message is for the active chat
      if (currentActiveChat) {
        const activeRoomId = [currentUser._id, currentActiveChat._id]
          .sort()
          .join("_");
        if (data.roomId === activeRoomId) {
          // Add message to active chat (prevent duplicates)
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
          return;
        }
      }

      // Message is from different chat - increment unread
      const otherUserId = data.roomId
        .split("_")
        .find((id) => id !== currentUserId);
      if (otherUserId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [otherUserId]: (prev[otherUserId] || 0) + 1,
        }));
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [currentUser]); // Only depends on currentUser, uses ref for activeChat

  // Load message history and join room when active chat changes
  useEffect(() => {
    if (activeChat && currentUser) {
      // Create room ID from user IDs (sorted for consistency)
      const roomId = [currentUser._id, activeChat._id].sort().join("_");

      // Clear unread count for this chat
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        const activeChatIdStr = activeChat._id.toString();
        delete newCounts[activeChat._id];
        delete newCounts[activeChatIdStr];
        return newCounts;
      });

      // Fetch message history
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `http://localhost:5000/api/protected/messages/${roomId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          if (res.ok) {
            setMessages(data);
            // Dispatch event to update unread messages count in sidebar
            window.dispatchEvent(new Event("messagesUpdated"));
            // Refresh chat users list to update order and unread counts
            fetchChatUsers();
          } else {
            setMessages([]);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          setMessages([]);
        }
      };

      fetchMessages();
      // Only emit join_room if not already in this room
      if (currentRoomRef.current !== roomId) {
        currentRoomRef.current = roomId;
        socket.emit("join_room", roomId);
      }
    }
  }, [activeChat, currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview({ type: "image", url: reader.result, name: file.name });
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      setFilePreview({
        type: "video",
        url: URL.createObjectURL(file),
        name: file.name,
      });
    } else {
      setFilePreview({ type: "file", name: file.name, size: file.size });
    }
  };

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (
      (inputValue.trim() === "" && !selectedFile) ||
      !activeChat ||
      !currentUser
    )
      return;

    // Create room ID from user IDs (sorted for consistency)
    const roomId = [currentUser._id, activeChat._id].sort().join("_");
    const messageText = inputValue.trim();

    // Determine file type for preview
    let fileType = null;
    let filePreviewUrl = null;
    if (selectedFile) {
      if (selectedFile.type.startsWith("image/")) fileType = "image";
      else if (selectedFile.type.startsWith("video/")) fileType = "video";
      else if (selectedFile.type.startsWith("audio/")) fileType = "audio";
      else if (selectedFile.type === "application/pdf") fileType = "pdf";
      else fileType = "document";

      filePreviewUrl = filePreview?.url || null;
    }

    const tempMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: messageText,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      roomId: roomId,
      fileUrl: filePreviewUrl,
      fileName: selectedFile?.name || null,
      fileType: fileType,
      fileSize: selectedFile?.size || null,
      isUploading: !!selectedFile,
    };

    // Optimistically add message to UI
    setMessages((prev) => [...prev, tempMessage]);
    setInputValue("");

    const fileToUpload = selectedFile;
    clearSelectedFile();

    // Save message to database
    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");

      // Use FormData for file upload
      const formData = new FormData();
      formData.append("roomId", roomId);
      formData.append("receiverId", activeChat._id);
      formData.append("text", messageText);
      if (fileToUpload) {
        formData.append("file", fileToUpload);
      }

      const res = await fetch("http://localhost:5000/api/protected/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.message) {
        // Update the optimistic message with the real data from server
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? {
                  ...data.message,
                  id: data.message.id || tempMessage.id,
                  isUploading: false,
                }
              : msg
          )
        );

        // Send via socket for real-time delivery
        socket.emit("send_message", {
          ...data.message,
          roomId: roomId,
        });
      }
    } catch (error) {
      console.error("Error saving message:", error);
      // Remove failed message
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    }
    setIsUploading(false);
  };

  // Helper function to get user display info
  const getUserDisplayInfo = (user) => {
    if (!user) return { initials: "U", color: "bg-gray-600", name: "User" };
    const initials = user.username
      ? user.username.charAt(0).toUpperCase()
      : "U";
    const colors = [
      "bg-purple-600",
      "bg-orange-600",
      "bg-blue-600",
      "bg-green-600",
      "bg-pink-600",
    ];
    const colorIndex = user.username
      ? user.username.charCodeAt(0) % colors.length
      : 0;
    return {
      initials,
      color: colors[colorIndex],
      name: user.username || "User",
    };
  };

  if (!currentUser || isLoading) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 max-w-sm border-r border-white/5 flex flex-col bg-[#161616]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Messages</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Back
          </button>
        </div>
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {chatUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <p>No messages yet</p>
              <p className="text-xs mt-2">
                Click the message icon on a user to start chatting
              </p>
            </div>
          ) : (
            chatUsers.map((user) => {
              const displayInfo = getUserDisplayInfo(user);
              const isActive = activeChat && activeChat._id === user._id;
              const userIdStr = user._id.toString();
              // Use local unreadCounts or backend unreadCount
              const unreadCount =
                unreadCounts[userIdStr] ||
                unreadCounts[user._id] ||
                user.unreadCount ||
                0;
              const hasUnread = unreadCount > 0;
              return (
                <div
                  key={user._id}
                  onClick={() => setActiveChat(user)}
                  className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition border-b border-white/5 ${
                    isActive ? "bg-white/10" : ""
                  } ${hasUnread ? "bg-blue-500/10" : ""}`}
                >
                  <div
                    className={`w-12 h-12 ${
                      displayInfo.color
                    } rounded-full flex items-center justify-center font-bold text-white shrink-0 relative ${
                      hasUnread
                        ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#161616]"
                        : ""
                    }`}
                  >
                    {displayInfo.initials}
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#161616] z-10 shadow-lg flex items-center justify-center text-[10px] font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4
                        className={`font-semibold text-sm truncate ${
                          hasUnread ? "text-blue-400" : ""
                        }`}
                      >
                        {displayInfo.name}
                      </h4>
                      {hasUnread && (
                        <span className="text-[10px] text-blue-400 font-medium ml-2">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {user.role || "Member"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-black">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#1C1C1E]">
            <div className="flex items-center gap-3">
              {(() => {
                const displayInfo = getUserDisplayInfo(activeChat);
                return (
                  <>
                    <div
                      className={`w-10 h-10 ${displayInfo.color} rounded-full flex items-center justify-center font-bold text-white`}
                    >
                      {displayInfo.initials}
                    </div>
                    <div>
                      <h3 className="font-bold">{displayInfo.name}</h3>
                      <p className="text-xs text-gray-400">
                        {activeChat.role || "Member"}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No messages yet. Say hello! 👋</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg.id || `msg-${index}-${msg.timestamp}`}
                  className={`flex ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm ${
                      msg.sender === "me"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : msg.sender === "system"
                        ? "bg-transparent text-gray-500 text-xs w-full text-center border border-white/10"
                        : "bg-[#2f2f31] text-[#E5E7EB] rounded-bl-none"
                    } ${msg.isUploading ? "opacity-70" : ""}`}
                  >
                    {/* File attachment display */}
                    {msg.fileUrl && (
                      <div className="mb-2">
                        {msg.fileType === "image" ? (
                          <a
                            href={
                              msg.fileUrl.startsWith("http") ||
                              msg.fileUrl.startsWith("data:")
                                ? msg.fileUrl
                                : `http://localhost:5000${msg.fileUrl}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={
                                msg.fileUrl.startsWith("http") ||
                                msg.fileUrl.startsWith("data:")
                                  ? msg.fileUrl
                                  : `http://localhost:5000${msg.fileUrl}`
                              }
                              alt={msg.fileName || "Image"}
                              className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition"
                            />
                          </a>
                        ) : msg.fileType === "video" ? (
                          <video
                            src={
                              msg.fileUrl.startsWith("http") ||
                              msg.fileUrl.startsWith("blob:")
                                ? msg.fileUrl
                                : `http://localhost:5000${msg.fileUrl}`
                            }
                            controls
                            className="max-w-full max-h-64 rounded-lg"
                          />
                        ) : (
                          <a
                            href={
                              msg.fileUrl.startsWith("http")
                                ? msg.fileUrl
                                : `http://localhost:5000${msg.fileUrl}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              msg.sender === "me"
                                ? "bg-blue-700/50"
                                : "bg-[#3f3f41]"
                            } hover:opacity-80 transition`}
                          >
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                              {msg.fileType === "pdf" ? (
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {msg.fileName}
                              </p>
                              {msg.fileSize && (
                                <p className="text-xs opacity-70">
                                  {formatFileSize(msg.fileSize)}
                                </p>
                              )}
                            </div>
                            <svg
                              className="w-5 h-5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                          </a>
                        )}
                        {msg.isUploading && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                          </div>
                        )}
                      </div>
                    )}
                    {msg.text && <p>{msg.text}</p>}
                    {msg.sender !== "system" && (
                      <p
                        className={`text-[10px] mt-1 text-right ${
                          msg.sender === "me"
                            ? "text-blue-200"
                            : "text-gray-400"
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* File Preview */}
          {filePreview && (
            <div className="px-4 py-3 bg-[#1C1C1E] border-t border-white/5">
              <div className="flex items-center gap-3 bg-[#161616] rounded-lg p-3">
                {filePreview.type === "image" ? (
                  <img
                    src={filePreview.url}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : filePreview.type === "video" ? (
                  <video
                    src={filePreview.url}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {filePreview.name}
                  </p>
                  {filePreview.size && (
                    <p className="text-xs text-gray-400">
                      {formatFileSize(filePreview.size)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="p-4 bg-[#1C1C1E] border-t border-white/5">
            <form onSubmit={sendMessage} className="flex gap-3 items-center">
              {/* File Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-3 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white disabled:opacity-50"
                title="Attach file"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>

              {/* Image Upload Button */}
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => handleFileSelect(e);
                  input.click();
                }}
                disabled={isUploading}
                className="p-3 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white disabled:opacity-50"
                title="Send image"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  selectedFile
                    ? "Add a message..."
                    : `Message ${activeChat.username || "User"}...`
                }
                className="flex-1 bg-[#161616] border border-[#2f2f31] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              />
              <button
                type="submit"
                disabled={
                  isUploading || (inputValue.trim() === "" && !selectedFile)
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition text-sm flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending</span>
                  </>
                ) : (
                  "Send"
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="text-center text-gray-400">
            <p className="text-lg mb-2">No chat selected</p>
            <p className="text-sm">
              Select a user from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
