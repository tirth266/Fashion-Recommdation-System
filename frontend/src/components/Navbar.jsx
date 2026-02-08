import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md h-[72px] border-b border-black/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* Left: Brand */}
        <div className="flex-shrink-0 w-32">
          <Link to="/" className="font-serif text-2xl font-bold tracking-tight">
            FashionAI.
          </Link>
        </div>

        {/* Center: Menu */}
        <div className="hidden md:flex items-center justify-center space-x-8">
          {[
            { name: 'Home', href: '/' },
            { name: 'AI Recommendations', href: '#ai-recommendations' },
            { name: 'Smart Sizing', href: '#smart-sizing' },
            { name: 'Wardrobe', href: '#wardrobe' },
            { name: 'Trends', href: '#trends' }
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-primary hover:text-secondary relative group transition-colors"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* Right: Icons */}
        <div className="flex items-center justify-end space-x-6 w-32">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-primary hover:text-secondary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>

          <button className="text-primary hover:text-secondary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>

          <Link to={currentUser ? '/profile' : '/login'} className="text-primary hover:text-secondary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </Link>

          <button className="text-primary hover:text-secondary transition-colors relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full text-[10px] text-white flex items-center justify-center">0</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
