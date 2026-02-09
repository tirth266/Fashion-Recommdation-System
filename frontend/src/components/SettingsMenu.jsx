import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsMenu() {
     const { logout } = useAuth();
     const { theme, toggleTheme } = useTheme();
     const [isOpen, setIsOpen] = useState(false);
     const menuRef = useRef(null);

     // Close when clicking outside
     useEffect(() => {
          function handleClickOutside(event) {
               if (menuRef.current && !menuRef.current.contains(event.target)) {
                    setIsOpen(false);
               }
          }
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
               document.removeEventListener("mousedown", handleClickOutside);
          };
     }, [menuRef]);

     return (
          <div className="relative" ref={menuRef}>
               <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-primary hover:text-secondary transition-colors focus:outline-none p-1"
                    title="Settings"
               >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
               </button>

               {isOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                         <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</p>
                         </div>

                         <div className="py-1">
                              {/* Dark Mode Toggle */}
                              <button
                                   onClick={toggleTheme}
                                   className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                   <div className="flex items-center gap-2">
                                        {theme === 'dark' ? (
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        ) : (
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                        )}
                                        <span>Dark Mode</span>
                                   </div>
                                   <div className={`w-8 h-4 flex items-center bg-gray-300 dark:bg-green-500 rounded-full p-0.5 transition-colors duration-300 ${theme === 'dark' ? 'justify-end' : 'justify-start'}`}>
                                        <div className="bg-white w-3 h-3 rounded-full shadow-sm" />
                                   </div>
                              </button>

                              {/* Profile Link */}
                              <Link
                                   to="/profile"
                                   className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                   onClick={() => setIsOpen(false)}
                              >
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                   <span>Profile</span>
                              </Link>
                         </div>

                         <div className="border-t border-gray-100 dark:border-gray-700 mt-1 py-1">
                              <button
                                   onClick={() => {
                                        logout();
                                        setIsOpen(false);
                                   }}
                                   className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                              >
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                   <span>Sign Out</span>
                              </button>
                         </div>
                    </div>
               )}
          </div>
     );
}
