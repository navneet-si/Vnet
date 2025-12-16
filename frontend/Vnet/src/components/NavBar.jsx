import { Search ,BellRing,User} from 'lucide-react'
import { useState,useRef } from 'react'
export default function NavBar({isVisible}){
    return(
        <div className={`
            fixed top-0 left-0 w-full z-100 px-6 py-4 
            flex justify-between items-center
            bg-[#1C1C1E] border-b border-white/5 shadow-xl shadow-black/50
            transition-transform duration-300 ease-in-out
            ${isVisible ? 'translate-y-0' : '-translate-y-full'} 
        `}  >
            <div className='px-2 text-[#1851ec] font-bold text-3xl items-center'>
              Vnet.
            </div>
            <div className='flex justify-between w-fit items-center'>
              <div className='px-2 flex'>
                <Search className='mr-1'/>
                <input type="text" className='ring-2 ring-blue-800 mx-2 px-2 rounded-2xl text-[#E5E7EB]' placeholder='Need Something ?'/>
              </div>
              <div className='px-4 mr-2 '>
                <BellRing/>
              </div>
              <div className='px-1 border rounded-full py-1 m-0'>
                <User/>
              </div>
            </div>
          </div>
    )
}