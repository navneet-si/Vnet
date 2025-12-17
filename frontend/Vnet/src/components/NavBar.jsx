import { Search, BellRing, User } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NavBar({ isVisible }) {
  return (
    <div className={`
      fixed top-0 left-0 w-full z-100 px-6 py-4
      flex justify-between items-center
      bg-[#1C1C1E] border-b border-white/5 shadow-xl shadow-black/50
      transition-transform duration-300 ease-in-out
      ${isVisible ? 'translate-y-0' : '-translate-y-full'}
    `}>
      
      <div className="px-2 text-[#1851ec] font-bold text-3xl">
        Vnet.
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <Search className="mr-1" />
          <input
            type="text"
            className="ring-2 ring-blue-800 px-3 py-1 rounded-2xl text-[#E5E7EB] bg-transparent outline-none"
            placeholder="Need Something?"
          />
        </div>

        <BellRing className="cursor-pointer" />

        <Link to="/Dashboard" className="border rounded-full p-2 hover:bg-white/10">
          <User className="cursor-pointer" />
        </Link>
      </div>
    </div>
  )
}
