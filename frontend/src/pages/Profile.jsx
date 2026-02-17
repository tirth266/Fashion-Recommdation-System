import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../components/MainLayout'

// --- ICONS (Lucide style for premium feel) ---
const SaveIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
const UploadIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
const InfoIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>

// --- SUB-COMPONENTS ---

// 1. MEASUREMENT INPUT
const MeasurementInput = ({ label, value, onChange, placeholder, unit = "cm" }) => (
  <div className="group">
    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
      {label}
      <div className="relative group/tooltip cursor-help">
        <InfoIcon />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
          Measure around the widest part
        </span>
      </div>
    </label>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all font-medium placeholder:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-white dark:focus:bg-gray-800"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium dark:text-gray-500">{unit}</span>
    </div>
  </div>
)

// 2. COLOR SWATCH
const ColorSwatch = ({ name, hex, selected, onClick }) => (
  <button
    onClick={() => onClick(name)}
    className={`group relative w-12 h-12 rounded-full border border-gray-100 shadow-sm transition-transform hover:scale-110 focus:outline-none ${selected ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-900' : 'dark:border-gray-700'}`}
    title={name}
  >
    <span
      className="absolute inset-1 rounded-full border border-black/5"
      style={{ backgroundColor: hex }}
    />
    {selected && (
      <span className="absolute inset-0 flex items-center justify-center text-white/90 drop-shadow-md">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </span>
    )}
  </button>
)

// 3. BRAND TAG
const BrandTag = ({ name, active, onClick }) => (
  <button
    onClick={() => onClick(name)}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${active
      ? 'bg-gray-900 text-white border-gray-900 shadow-md transform -translate-y-0.5 dark:bg-white dark:text-black dark:border-white'
      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
      }`}
  >
    {name}
  </button>
)

// 4. FIT CARD
const FitCard = ({ type, description, active, onClick }) => (
  <div
    onClick={() => onClick(type)}
    className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 ${active
      ? 'border-gray-900 bg-gray-50 shadow-md ring-1 ring-gray-900 dark:border-white dark:bg-gray-800 dark:ring-white'
      : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-600'
      }`}
  >
    <div className="flex items-center justify-between mb-2">
      <h4 className={`font-serif font-bold text-lg ${active ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{type}</h4>
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${active ? 'border-gray-900 bg-gray-900 dark:border-white dark:bg-white' : 'border-gray-300 dark:border-gray-600'}`}>
        {active && <div className="w-2 h-2 rounded-full bg-white dark:bg-black" />}
      </div>
    </div>
    <p className="text-xs text-gray-500 leading-relaxed max-w-[80%]">{description}</p>
  </div>
)

export default function Profile() {
  const { currentUser, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pendingColor, setPendingColor] = useState(null)

  // -- STATE --
  const [profile, setProfile] = useState({
    name: 'Fashionista User',
    email: 'user@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    measurements: {
      shoulder: '',
      chest: '',
      height: '',
      wrist: ''
    },
    preferences: {
      colors: ['Black', 'Navy'],
      brands: ['Nike', 'Zara'],
      fit: 'Regular Fit'
    }
  })

  // Initialize with Auth Data and Fetch Profile
  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;

      try {
        const response = await fetch('/api/profile/', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          const backendProfile = data.profile;

          setProfile(prev => ({
            ...prev,
            name: backendProfile.name || currentUser.displayName || currentUser.name || prev.name,
            email: currentUser.email || prev.email,
            avatar: backendProfile.avatar || currentUser.photoURL || currentUser.picture || prev.avatar,
            measurements: { ...prev.measurements, ...backendProfile.measurements },
            preferences: { ...prev.preferences, ...backendProfile.preferences }
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    }
    fetchProfile();
  }, [currentUser]);

  // -- HANDLERS --
  const handleMeasurementChange = (key, val) => {
    setProfile(prev => ({ ...prev, measurements: { ...prev.measurements, [key]: val } }))
  }

  const toggleColor = (color) => {
    setProfile(prev => {
      const colors = prev.preferences.colors?.includes(color)
        ? prev.preferences.colors.filter(c => c !== color)
        : [...(prev.preferences.colors || []), color]
      return { ...prev, preferences: { ...prev.preferences, colors } }
    })
  }

  const toggleBrand = (brand) => {
    setProfile(prev => {
      const brands = prev.preferences.brands?.includes(brand)
        ? prev.preferences.brands.filter(b => b !== brand)
        : [...(prev.preferences.brands || []), brand]
      return { ...prev, preferences: { ...prev.preferences, brands } }
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          measurements: profile.measurements,
          preferences: profile.preferences,
          completed_onboarding: true
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          updateUser(data.user); // Sync global user state
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        console.error("Failed to save");
        alert("Failed to save profile");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving profile");
    } finally {
      setLoading(false)
    }
  }

  // -- DATA CONSTANTS --
  const AVAILABLE_COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Olive', hex: '#556B2F' },
    { name: 'Red', hex: '#8B0000' }
  ]

  const AVAILABLE_BRANDS = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s', 'Gucci', 'Prada']

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F9F9F9] py-12 lg:py-20 dark:bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* PAGE HEADER */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-[#1A1A1A] mb-4 dark:text-white">Your Profile</h1>
            <p className="text-[#6B6B6B] text-lg max-w-lg mx-auto dark:text-gray-400">Manage your measurements and style preferences for AI-powered recommendations.</p>
          </div>

          <div className="space-y-8">

            {/* SECTION 1: PROFILE HEADER */}
            <section className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-center gap-8 text-center md:text-left dark:bg-gray-800 dark:border-gray-700">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <UploadIcon />
                </div>
                <div className="absolute bottom-0 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-600 p-1.5">
                  <UploadIcon />
                </div>
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                      // Show temporary loading state or preview if desired
                      const response = await fetch('/api/profile/upload-avatar', {
                        method: 'POST',
                        body: formData,
                        credentials: 'include'
                      });

                      if (response.ok) {
                        const data = await response.json();
                        setProfile(prev => ({ ...prev, avatar: data.avatar_url }));
                        // Update Auth Context to ensure persistence
                        if (currentUser) {
                          updateUser({ ...currentUser, photoURL: data.avatar_url });
                        }
                      } else {
                        alert("Failed to upload image");
                      }
                    } catch (err) {
                      console.error("Upload failed", err);
                      alert("Error uploading image");
                    }
                  }}
                />
              </div>

              <div className="flex-1 w-full max-w-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Display Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full text-2xl font-serif font-bold text-gray-900 bg-transparent border-b border-gray-200 focus:border-gray-900 focus:outline-none pb-1 transition-colors text-center md:text-left dark:text-white dark:border-gray-600 dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full text-gray-400 bg-transparent border-none p-0 text-center md:text-left focus:ring-0 cursor-not-allowed"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 2: BODY MEASUREMENTS */}
            <section className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Body Measurements</h2>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide dark:bg-green-900/30 dark:text-green-300">For AI Sizing</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <MeasurementInput
                  label="Shoulder Width"
                  value={profile.measurements.shoulder}
                  onChange={(v) => handleMeasurementChange('shoulder', v)}
                  placeholder="45"
                />
                <MeasurementInput
                  label="Height"
                  value={profile.measurements.height}
                  onChange={(v) => handleMeasurementChange('height', v)}
                  placeholder="180"
                />
                <MeasurementInput
                  label="Chest Size"
                  value={profile.measurements.chest}
                  onChange={(v) => handleMeasurementChange('chest', v)}
                  placeholder="100"
                />
                <MeasurementInput
                  label="Wrist Size"
                  value={profile.measurements.wrist}
                  onChange={(v) => handleMeasurementChange('wrist', v)}
                  placeholder="18"
                />
              </div>
            </section>

            {/* SECTION 3: STYLE PREFERENCES */}
            <section className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-10 dark:bg-gray-800 dark:border-gray-700">

              {/* COLORS */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Favorite Colors</h3>
                <div className="flex flex-wrap gap-4">
                  {AVAILABLE_COLORS.map((color) => (
                    <ColorSwatch
                      key={color.name}
                      {...color}
                      selected={profile.preferences.colors.includes(color.name)}
                      onClick={toggleColor}
                    />
                  ))}

                  {/* Custom Selected Colors */}
                  {profile.preferences.colors
                    ?.filter(c => !AVAILABLE_COLORS.some(ac => ac.name === c))
                    .map(hex => (
                      <ColorSwatch
                        key={hex}
                        name={hex}
                        hex={hex}
                        selected={true}
                        onClick={toggleColor}
                      />
                    ))
                  }

                  {/* Custom Color Area: Picker + Pending Save */}
                  <div className="flex items-center gap-3">

                    {/* 1. Picker Button */}
                    <div className="relative group">
                      <button
                        className="w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center bg-white hover:bg-gray-50 transition-colors focus:outline-none text-gray-400 hover:text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-300 dark:hover:text-white"
                        title="Pick Custom Color"
                        onClick={() => document.getElementById('custom-color-input').click()}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 22a8 8 0 0 0 8-8c0-3.144-2.52-5.5-6-5.5A6 6 0 0 0 6 12.5c0 .16.012.316.035.47l.465 3.03z"></path><path d="M12 22a5 5 0 0 0 5-5v-.5"></path></svg>
                      </button>
                      <input
                        type="color"
                        id="custom-color-input"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => setPendingColor(e.target.value)}
                      />
                    </div>

                    {/* 2. Pending Color Actions */}
                    {pendingColor && (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* Preview */}
                        <div className="w-10 h-10 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: pendingColor }} />

                        {/* Save Button */}
                        <button
                          onClick={() => {
                            setProfile(prev => {
                              const colors = prev.preferences.colors?.includes(pendingColor)
                                ? prev.preferences.colors
                                : [...(prev.preferences.colors || []), pendingColor];
                              return { ...prev, preferences: { ...prev.preferences, colors } }
                            });
                            setPendingColor(null);
                          }}
                          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                          title="Save Color"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        </button>

                        {/* Cancel Button */}
                        <button
                          onClick={() => setPendingColor(null)}
                          className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-red-500 transition-colors shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                          title="Cancel"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BRANDS */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Preferred Brands</h3>
                <div className="flex flex-wrap gap-3">
                  {AVAILABLE_BRANDS.map((brand) => (
                    <BrandTag
                      key={brand}
                      name={brand}
                      active={profile.preferences.brands.includes(brand)}
                      onClick={toggleBrand}
                    />
                  ))}
                  <button className="px-4 py-2 rounded-full text-sm font-medium border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors">
                    + Add Brand
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 4: FIT PREFERENCE */}
            <section className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8 dark:text-white">Fit Preference</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { type: 'Slim Fit', desc: 'Closer to the body with tailored lines.' },
                  { type: 'Regular Fit', desc: 'Classic comfortable cut with room to move.' },
                  { type: 'Loose Fit', desc: 'Relaxed and oversized silhouette.' }
                ].map((fit) => (
                  <FitCard
                    key={fit.type}
                    {...fit}
                    active={profile.preferences.fit === fit.type}
                    onClick={(t) => setProfile(prev => ({ ...prev, preferences: { ...prev.preferences, fit: t } }))}
                  />
                ))}
              </div>
            </section>

            {/* SECTION 5: ACTIONS */}
            <div className="sticky bottom-6 z-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between max-w-xl mx-auto dark:bg-gray-900/80 dark:border-gray-700">
              <button
                className="text-gray-500 font-medium px-6 py-3 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white"
                onClick={() => window.location.reload()}
              >
                Reset Changes
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#1A1A1A] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Saved!
                  </>
                ) : (
                  <>
                    <SaveIcon />
                    Save Profile
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  )
}