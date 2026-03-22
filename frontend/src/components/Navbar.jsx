import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import SettingsMenu from './SettingsMenu'

export default function Navbar() {
  const { currentUser } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md h-[72px] border-b border-black/5 transition-all duration-300 dark:bg-black/80 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* Left: Brand */}
        <div className="flex-shrink-0 w-32">
          <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-primary dark:text-white">
            FashionAI.
          </Link>
        </div>

        {/* Center: Menu */}
        <div className="hidden md:flex items-center justify-center space-x-8">
          {[
            { name: 'Home', href: '/' },
            { name: 'AI Recommendations', href: '#ai-recommendations' },
            { name: 'Smart Size', href: '/size-estimation', icon: (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) },
            { name: 'Wardrobe', href: '#wardrobe' },
            { name: 'Trends', href: '#trends' }
          ].map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm font-medium text-primary hover:text-secondary relative group transition-colors dark:text-gray-300 dark:hover:text-white flex items-center"
            >
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full dark:bg-white"></span>
            </Link>
          ))}
        </div>

        {/* Right: Icons */}
        <div className="flex items-center justify-end space-x-6">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-primary hover:text-secondary transition-colors dark:text-gray-300 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>

          <button className="text-primary hover:text-secondary transition-colors dark:text-gray-300 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>

          {/* Settings Menu */}
          <SettingsMenu />

          <Link to={currentUser ? '/profile' : '/login'} className="text-primary hover:text-secondary transition-colors dark:text-gray-300 dark:hover:text-white">
            {currentUser?.photoURL || currentUser?.picture ? (
              <img src={currentUser.photoURL || currentUser.picture} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            )}
          </Link>

          <button className="text-primary hover:text-secondary transition-colors relative dark:text-gray-300 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full text-[10px] text-white flex items-center justify-center dark:bg-white dark:text-black">0</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
