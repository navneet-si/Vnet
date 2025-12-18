import { useNavigate } from 'react-router-dom';

export default function EditProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 text-white min-h-full">
      
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/profile')} className="p-2 hover:bg-white/10 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-2xl p-6 space-y-6">
        
        {/* Photo Upload */}
        <div className="flex flex-col items-center gap-4 py-4 border-b border-[#2f2f31]">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white relative">
                JS
                <div className="absolute bottom-0 right-0 bg-white text-black p-1.5 rounded-full cursor-pointer border-2 border-[#1C1C1E]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
            </div>
            <button className="text-blue-400 text-sm font-medium hover:text-blue-300">Change Profile Photo</button>
        </div>

        {/* Form Fields */}
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); navigate('/profile'); }}>
            <div>
                <label className="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">Display Name</label>
                <input type="text" defaultValue="John Smith" className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition placeholder-gray-600" />
            </div>

            <div>
                <label className="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">Role / Job</label>
                <input type="text" defaultValue="Full Stack Developer" className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition placeholder-gray-600" />
            </div>

            <div>
                <label className="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">Bio</label>
                <textarea rows="4" defaultValue="Building things for the web." className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition placeholder-gray-600 resize-none"></textarea>
            </div>

            <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition">
                    Save Changes
                </button>
            </div>
        </form>

      </div>
    </div>
  );
}