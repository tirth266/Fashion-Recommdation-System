<<<<<<< HEAD
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/image-search', label: 'Image Search', icon: '🔍' },
    { path: '/price-comparison', label: 'Price', icon: '💰' },
    { path: '/recommendations', label: 'Recommend', icon: '✨' },
    { path: '/size-estimation', label: 'Size', icon: '📋' },
  ]

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${
      scrolled 
        ? 'glass shadow-lg backdrop-blur-xl border-b border-white/20' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo with Icon */}
          <Link to="/" className="flex-shrink-0 flex items-center group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
              <div className="relative bg-white rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-lg font-bold gradient-text">✨</span>
              </div>
            </div>
            <h1 className="ml-3 text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              FashionAI
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    isActive(item.path)
                      ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                  {!isActive(item.path) && (
                    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-purple-50/50 focus:outline-none transition"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            <Link to="/profile" className="p-2 rounded-lg text-gray-700 hover:bg-purple-50/50 transition">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 space-y-2 animate-slide-up">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-purple-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
=======
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import SettingsMenu from './SettingsMenu'

export default function Navbar() {
  const { currentUser } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md h-[72px] border-b border-black/5 transition-all duration-300 dark:bg-gray-900/80 dark:border-white/10">
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
            { name: 'Smart Sizing', href: '#smart-sizing' },
            { name: 'Wardrobe', href: '#wardrobe' },
            { name: 'Trends', href: '#trends' }
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-primary hover:text-secondary relative group transition-colors dark:text-gray-300 dark:hover:text-white"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full dark:bg-white"></span>
            </a>
          ))}
        </div>

        {/* Right: Icons */}
        <div className="flex items-center justify-end space-x-6 w-32">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-primary hover:text-secondary transition-colors dark:text-gray-300 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>

          <button className="text-primary hover:text-secondary transition-colors dark:text-gray-300 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>

          {/* Settings Menu */}
          <SettingsMenu />

          <Link to={currentUser ? '/profile' : '/login'} className="text-primary hover:text-secondary transition-colors dark:text-gray-300 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </Link>

          <button className="text-primary hover:text-secondary transition-colors relative dark:text-gray-300 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full text-[10px] text-white flex items-center justify-center dark:bg-white dark:text-black">0</span>
          </button>
        </div>
>>>>>>> origin/main
      </div>
    </nav>
  )
}
