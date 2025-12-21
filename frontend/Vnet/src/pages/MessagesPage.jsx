import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate, useSearchParams } from "react-router-dom";

const socket = io("http://localhost:5000", { autoConnect: false });

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({}); // Track unread messages per chat
  const messagesEndRef = useRef(null);

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

  // Function to fetch chat users
  const fetchChatUsers = async () => {
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
        setFollowers(data);
      }
    } catch (error) {
      console.error("Error fetching chat users:", error);
    }
  };

  // Fetch chat users (only users you have messaged with)
  useEffect(() => {
    fetchChatUsers();
  }, []);

  // Handle URL params - if userId is provided, set that as active chat
  useEffect(() => {
    const userId = searchParams.get("userId");
    const username = searchParams.get("username");

    if (userId && username) {
      const selectedFollower = followers.find(
        (f) => f._id === userId || f._id.toString() === userId
      );
      if (selectedFollower) {
        setActiveChat(selectedFollower);
      } else {
        // User clicked message but hasn't messaged yet - add them to chat list temporarily
        const colors = [
          "bg-purple-600",
          "bg-orange-600",
          "bg-blue-600",
          "bg-green-600",
          "bg-pink-600",
        ];
        const colorIndex = username.charCodeAt(0) % colors.length;
        const newChatUser = {
          _id: userId,
          username: decodeURIComponent(username),
          role: "Member",
          color: colors[colorIndex],
          avatar: username.charAt(0).toUpperCase(),
        };
        setActiveChat(newChatUser);
        // Add to followers list if not already there
        if (
          !followers.find(
            (f) => f._id === userId || f._id.toString() === userId
          )
        ) {
          setFollowers((prev) => [...prev, newChatUser]);
        }
      }
    } else if (followers.length > 0 && !activeChat) {
      // If no URL params, set first follower as default
      setActiveChat(followers[0]);
    }
  }, [searchParams, followers]);

  // Socket connection and message handling
  useEffect(() => {
    if (!currentUser) return;

    socket.connect();
    socket.on("receive_message", (data) => {
      if (!data.roomId) return;

      // Check if message is for the active chat
      if (activeChat && currentUser) {
        const activeRoomId = [currentUser._id, activeChat._id].sort().join("_");
        if (data.roomId === activeRoomId) {
          // Add message to active chat
          setMessages((prev) => [...prev, data]);
        } else {
          // Message is from a different chat - increment unread count
          const messageRoomParts = data.roomId.split("_");
          const otherUserId = messageRoomParts.find((id) => {
            const currentUserIdStr = currentUser._id.toString();
            return id !== currentUserIdStr;
          });

          if (otherUserId) {
            setUnreadCounts((prev) => {
              // Try both string and original format to ensure we catch it
              const newCounts = { ...prev };
              newCounts[otherUserId] = (prev[otherUserId] || 0) + 1;
              return newCounts;
            });
          }
        }
      } else {
        // No active chat - increment unread for the sender
        const messageRoomParts = data.roomId.split("_");
        const otherUserId = messageRoomParts.find((id) => {
          const currentUserIdStr = currentUser._id.toString();
          return id !== currentUserIdStr;
        });

        if (otherUserId) {
          setUnreadCounts((prev) => {
            const newCounts = { ...prev };
            newCounts[otherUserId] = (prev[otherUserId] || 0) + 1;
            return newCounts;
          });
        }
      }
    });
    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [activeChat, currentUser]);

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
      socket.emit("join_room", roomId);
    }
  }, [activeChat, currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === "" || !activeChat || !currentUser) return;

    // Create room ID from user IDs (sorted for consistency)
    const roomId = [currentUser._id, activeChat._id].sort().join("_");
    const messageText = inputValue.trim();

    const newMessage = {
      id: Date.now(),
      text: messageText,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      roomId: roomId,
    };

    // Optimistically add message to UI
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Save message to database
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/protected/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: roomId,
          receiverId: activeChat._id,
          text: messageText,
        }),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }

    // Send via socket for real-time delivery
    socket.emit("send_message", newMessage);
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

  if (!currentUser) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 max-w-sm border-r border-white/5 flex flex-col bg-[#161616]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Messages</h2>
          <button onClick={() => navigate('/dashboard')} className="text-xs text-blue-400 hover:text-blue-300">Back</button>
        </div>
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {followers.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <p>No messages yet</p>
              <p className="text-xs mt-2">
                Click the message icon on a follower to start chatting
              </p>
            </div>
          ) : (
            followers.map((follower) => {
              const displayInfo = getUserDisplayInfo(follower);
              const isActive = activeChat && activeChat._id === follower._id;
              const followerIdStr = follower._id.toString();
              // Use backend unreadCount or local unreadCounts
              const unreadCount =
                unreadCounts[followerIdStr] ||
                unreadCounts[follower._id] ||
                follower.unreadCount ||
                0;
              const hasUnread = unreadCount > 0;
              return (
                <div
                  key={follower._id}
                  onClick={() => setActiveChat(follower)}
                  className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition border-b border-white/5 ${
                    isActive ? "bg-white/10" : ""
                  } ${hasUnread ? "bg-blue-500/10 animate-pulse" : ""}`}
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
                      {follower.role || "Member"}
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
            {messages.map((msg) => (
              <div
                key={msg.id || Date.now() + Math.random()}
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
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.sender !== "system" && (
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        msg.sender === "me" ? "text-blue-200" : "text-gray-400"
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 bg-[#1C1C1E] border-t border-white/5">
            <form onSubmit={sendMessage} className="flex gap-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message ${activeChat.username || "User"}...`}
                className="flex-1 bg-[#161616] border border-[#2f2f31] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition text-sm"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="text-center text-gray-400">
            <p className="text-lg mb-2">No chat selected</p>
            <p className="text-sm">
              Select a follower from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
