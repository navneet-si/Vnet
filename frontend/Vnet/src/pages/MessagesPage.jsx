import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Force WebSocket transport to avoid CORS polling errors
const socket = io('http://localhost:5000', { 
  transports: ['websocket'], 
  autoConnect: false 
});

export default function MessagesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [conversations, setConversations] = useState([]); // Initialize as empty array
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Retrieve ID
  const currentUserId = localStorage.getItem("userId");

  // --- DEBUGGING LOGS ---
  useEffect(() => {
    console.log("Current User ID:", currentUserId);
    if (!currentUserId) console.warn("No User ID found in localStorage.");
  }, [currentUserId]);

  // 1. Handle Redirect from "Message" button
  useEffect(() => {
    if (location.state?.chat) {
      setActiveChat(location.state.chat);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 2. Fetch Conversations
  useEffect(() => {
    if (!currentUserId) return;

    const fetchConversations = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/conversations/${currentUserId}`);
        console.log("Fetched conversations:", res.data);
        setConversations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };
    fetchConversations();
  }, [currentUserId]);

  // 3. Fetch Messages & Join Room
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/messages/${activeChat._id}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
        socket.emit('join_room', activeChat._id);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [activeChat]);

  // 4. Socket Listener
  useEffect(() => {
    socket.connect();
    socket.on('receive_message', (newMessage) => {
      if (activeChat && newMessage.conversationId === activeChat._id) {
        setMessages((prev) => [...prev, newMessage]);
      }
      setConversations(prev => prev.map(conv => 
        conv._id === newMessage.conversationId 
          ? { ...conv, lastMessage: newMessage.text } 
          : conv
      ));
    });

    return () => {
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [activeChat]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === "" || !activeChat) return;

    const messageData = {
      roomId: activeChat._id,
      sender: currentUserId,
      text: inputValue
    };

    socket.emit('send_message', messageData);
    setInputValue("");
  };

  // --- SAFETY HELPERS ---
  const getChatPartner = (conversation) => {
    if (!conversation || !conversation.participants) return {};
    // Safe check: ensure 'p' exists before checking '_id'
    const partner = conversation.participants.find(p => p && p._id !== currentUserId);
    return partner || {};
  };

  // --- RENDER CHECKS ---
  
  // FIX: Added black background to this warning so it's visible on white screens
  if (!currentUserId) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="mb-4">Please log in to view your messages.</p>
        <button 
          onClick={() => navigate('/login')} // Adjust route if needed
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 max-w-sm border-r border-white/5 flex flex-col bg-[#161616]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Messages</h2>
          <button onClick={() => navigate('/dashboard')} className="text-xs text-blue-400 hover:text-blue-300">Back</button>
        </div>
        
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {(!conversations || conversations.length === 0) && (
            <p className="p-4 text-gray-500 text-sm">No conversations yet.</p>
          )}
          
          {Array.isArray(conversations) && conversations.map((chat) => {
            const partner = getChatPartner(chat);
            const username = partner.username || "Unknown User";
            const initial = username[0] ? username[0].toUpperCase() : "?";

            return (
              <div 
                key={chat._id} 
                onClick={() => setActiveChat(chat)} 
                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition border-b border-white/5 ${activeChat?._id === chat._id ? 'bg-white/10' : ''}`}
              >
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center font-bold text-white shrink-0">
                  {initial}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold text-sm truncate">{username}</h4>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{chat.lastMessage || "Start chatting..."}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-black">
        {activeChat ? (
          <>
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#1C1C1E]">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                    {getChatPartner(activeChat).username?.[0]?.toUpperCase() || "?"}
                 </div>
                 <div>
                    <h3 className="font-bold">{getChatPartner(activeChat).username || "Unknown"}</h3>
                    <p className="text-xs text-gray-400">{getChatPartner(activeChat).bio || "User"}</p>
                 </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 [&::-webkit-scrollbar]:hidden">
              {messages.map((msg, index) => {
                 const isMe = msg.sender === currentUserId;
                 return (
                   <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#2f2f31] text-[#E5E7EB] rounded-bl-none'}`}>
                       <p>{msg.text}</p>
                       <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                         {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                     </div>
                   </div>
                 );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-[#1C1C1E] border-t border-white/5">
               <form onSubmit={sendMessage} className="flex gap-4">
                 <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    placeholder="Type a message..." 
                    className="flex-1 bg-[#161616] border border-[#2f2f31] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition" 
                 />
                 <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition text-sm">Send</button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}