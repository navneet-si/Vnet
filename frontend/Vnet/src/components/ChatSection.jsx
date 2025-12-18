import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// DUMMY DATA FOR SIDEBAR
const initialConversations = [
  { id: 1, name: "Sarah Jenkins", avatar: "SJ", color: "bg-green-500", status: "online", lastMessage: "Yeah, just working on the dashboard." },
  { id: 2, name: "David Ross", avatar: "DR", color: "bg-purple-500", status: "offline", lastMessage: "Can you send the video file?" },
  { id: 3, name: "Alex Chen", avatar: "AC", color: "bg-yellow-500", status: "online", lastMessage: "The vertical test looks good." },
  { id: 4, name: "Marketing Team", avatar: "MT", color: "bg-red-500", status: "online", lastMessage: "Meeting at 3 PM confirmed." },
];

const socket = io('http://localhost:3001');

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(initialConversations[0]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Handle switching chats (In a real app, you'd fetch history here)
  useEffect(() => {
    // Reset messages or fetch specific chat history when activeChat changes
    setMessages([
      { id: 1, text: `History with ${activeChat.name} loaded...`, sender: "system", timestamp: "Today" }
    ]);
    
    // Join specific room for this user/chat ID
    socket.emit('join_room', activeChat.id);

  }, [activeChat]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off('receive_message');
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roomId: activeChat.id // Send to specific room
    };

    setMessages((prev) => [...prev, newMessage]);
    socket.emit('send_message', newMessage);
    setInputValue("");
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      
      {/* LEFT SIDEBAR: CONVERSATION LIST */}
      <div className="w-1/3 max-w-sm border-r border-white/5 flex flex-col bg-[#161616]">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        
        {/* List */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {initialConversations.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition border-b border-white/5 
                ${activeChat.id === chat.id ? 'bg-white/10' : ''}`}
            >
              <div className={`w-12 h-12 ${chat.color} rounded-full flex items-center justify-center font-bold text-white shrink-0`}>
                {chat.avatar}
              </div>
              <div className="overflow-hidden">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-semibold text-sm truncate">{chat.name}</h4>
                  {chat.status === 'online' && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                </div>
                <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: ACTIVE CHAT AREA */}
      <div className="flex-1 flex flex-col bg-black">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#1C1C1E]">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 ${activeChat.color} rounded-full flex items-center justify-center font-bold text-white`}>
                {activeChat.avatar}
              </div>
              <div>
                <h3 className="font-bold">{activeChat.name}</h3>
                <p className="text-xs text-gray-400">{activeChat.status === 'online' ? 'Active now' : 'Last seen recently'}</p>
              </div>
          </div>
          <button className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {messages.map((msg, index) => (
             <div 
             key={index} 
             className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
           >
             <div 
               className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm ${
                 msg.sender === 'me' 
                   ? 'bg-blue-600 text-white rounded-br-none' 
                   : msg.sender === 'system'
                   ? 'bg-transparent text-gray-500 text-xs w-full text-center border border-white/10'
                   : 'bg-[#2f2f31] text-[#E5E7EB] rounded-bl-none'
               }`}
             >
               <p>{msg.text}</p>
               {msg.sender !== 'system' && (
                  <p className={`text-[10px] mt-1 text-right ${
                    msg.sender === 'me' ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {msg.timestamp}
                  </p>
               )}
             </div>
           </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#1C1C1E] border-t border-white/5">
           <form onSubmit={sendMessage} className="flex gap-4">
             <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message ${activeChat.name}...`}
                className="flex-1 bg-[#161616] border border-[#2f2f31] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
             />
             <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition text-sm">
               Send
             </button>
           </form>
        </div>
      </div>
    </div>
  );
}