import { useState } from 'react'

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: 'March 2024',
    avatar: null
  })

  const [preferences, setPreferences] = useState({
    style: 'Casual Elegance',
    budget: '$$',
    favoriteColors: ['Navy', 'White', 'Black'],
    categories: ['Denim', 'Blazers', 'Sneakers', 'Dresses'],
    brands: ['Urban Outfitters', 'Zara', 'H&M', 'Nike'],
    occasions: ['Work', 'Casual', 'Party', 'Sports']
  })

  const [measurements, setMeasurements] = useState({
    chest: '38',
    waist: '32',
    hips: '40',
    height: '70',
    size: 'M'
  })

  const handleUserUpdate = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }))
  }

  const handlePreferenceUpdate = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
  }

  const handleMeasurementUpdate = (field, value) => {
    setMeasurements(prev => ({ ...prev, [field]: value }))
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'preferences', label: 'Preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.544-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.544-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.544.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.544.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'measurements', label: 'Measurements', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Your Profile</span>
          </h1>
          <p className="text-lg text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600">Member since {user.joinDate}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => handleUserUpdate('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => handleUserUpdate('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={user.phone}
                      onChange={(e) => handleUserUpdate('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                    <input
                      type="text"
                      value={user.location}
                      onChange={(e) => handleUserUpdate('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Style Preference</label>
                    <select
                      value={preferences.style}
                      onChange={(e) => handlePreferenceUpdate('style', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option>Casual Elegance</option>
                      <option>Streetwear</option>
                      <option>Business Professional</option>
                      <option>Bohemian</option>
                      <option>Minimalist</option>
                      <option>Athleisure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Budget Range</label>
                    <select
                      value={preferences.budget}
                      onChange={(e) => handlePreferenceUpdate('budget', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option>$ (Budget)</option>
                      <option>$$ (Mid-range)</option>
                      <option>$$$ (Premium)</option>
                      <option>$$$$ (Luxury)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Favorite Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {['Navy', 'White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Gray', 'Brown'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          const newColors = preferences.favoriteColors.includes(color)
                            ? preferences.favoriteColors.filter(c => c !== color)
                            : [...preferences.favoriteColors, color]
                          handlePreferenceUpdate('favoriteColors', newColors)
                        }}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          preferences.favoriteColors.includes(color)
                            ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Preferred Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {['Denim', 'Blazers', 'Sneakers', 'Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Footwear'].map(category => (
                      <button
                        key={category}
                        onClick={() => {
                          const newCategories = preferences.categories.includes(category)
                            ? preferences.categories.filter(c => c !== category)
                            : [...preferences.categories, category]
                          handlePreferenceUpdate('categories', newCategories)
                        }}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          preferences.categories.includes(category)
                            ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Favorite Brands</label>
                  <div className="flex flex-wrap gap-2">
                    {['Urban Outfitters', 'Zara', 'H&M', 'Nike', 'Adidas', 'Uniqlo', 'COS', 'Everlane', 'Madewell'].map(brand => (
                      <button
                        key={brand}
                        onClick={() => {
                          const newBrands = preferences.brands.includes(brand)
                            ? preferences.brands.filter(b => b !== brand)
                            : [...preferences.brands, brand]
                          handlePreferenceUpdate('brands', newBrands)
                        }}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          preferences.brands.includes(brand)
                            ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Occasions</label>
                  <div className="flex flex-wrap gap-2">
                    {['Work', 'Casual', 'Party', 'Sports', 'Formal', 'Travel', 'Weekend', 'Date Night'].map(occasion => (
                      <button
                        key={occasion}
                        onClick={() => {
                          const newOccasions = preferences.occasions.includes(occasion)
                            ? preferences.occasions.filter(o => o !== occasion)
                            : [...preferences.occasions, occasion]
                          handlePreferenceUpdate('occasions', newOccasions)
                        }}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          preferences.occasions.includes(occasion)
                            ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {occasion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'measurements' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Chest (inches)</label>
                    <input
                      type="number"
                      value={measurements.chest}
                      onChange={(e) => handleMeasurementUpdate('chest', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Waist (inches)</label>
                    <input
                      type="number"
                      value={measurements.waist}
                      onChange={(e) => handleMeasurementUpdate('waist', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Hips (inches)</label>
                    <input
                      type="number"
                      value={measurements.hips}
                      onChange={(e) => handleMeasurementUpdate('hips', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Height (inches)</label>
                    <input
                      type="number"
                      value={measurements.height}
                      onChange={(e) => handleMeasurementUpdate('height', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <div className="text-6xl font-bold text-purple-600 mb-2">{measurements.size}</div>
                  <div className="text-lg font-semibold text-purple-800 mb-1">Your Size</div>
                  <p className="text-purple-600">Based on your current measurements</p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => window.location.href = '/size-estimation'}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Recalculate Size
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Save Measurements
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-1">Security Notice</h3>
                      <p className="text-yellow-700 text-sm">For security reasons, password changes must be done through our secure authentication system.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}