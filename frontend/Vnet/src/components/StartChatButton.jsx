import axios from "axios";
import { useNavigate } from "react-router-dom";

// Pass the 'targetUserId' (the ID of the person you want to chat with)
const StartChatButton = ({ targetUserId }) => {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  const handleStartChat = async () => {
    if (!currentUserId || !targetUserId) return alert("Please log in first");

    try {
      // 1. Create or Get conversation via the new POST route
      const res = await axios.post("http://localhost:5000/api/chat", {
        senderId: currentUserId,
        receiverId: targetUserId
      });
      
      // 2. Redirect to messages page and pass the new conversation object
      // We use 'state' so MessagesPage knows which chat to open immediately
      navigate("/messages", { state: { chat: res.data } }); 
      
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  return (
    <button 
      onClick={handleStartChat} 
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
    >
      Message
    </button>
  );
};

export default StartChatButton;