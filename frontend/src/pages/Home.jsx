import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import MainLayout from '../components/MainLayout'
import { useAuth } from '../context/AuthContext'

// Mock Data for Occasion Styling
const occasionOutfits = {
  Casual: [
    { id: 1, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop", name: "Weekend Brunch" },
    { id: 2, image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2005&auto=format&fit=crop", name: "City Walk" },
  ],
  Office: [
    { id: 3, image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1995&auto=format&fit=crop", name: "Executive Meeting" },
    { id: 4, image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=1957&auto=format&fit=crop", name: "Workday Chic" },
  ],
  Party: [
    { id: 5, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=2108&auto=format&fit=crop", name: "Evening Gala" },
    { id: 6, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2083&auto=format&fit=crop", name: "Cocktail Hour" },
  ],
};

export default function Home() {
  const [activeOccasion, setActiveOccasion] = useState('Casual');
  const { currentUser } = useAuth();
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    if (currentUser) {
      fetch('/api/wardrobe/', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.items) setWardrobeItems(data.items);
        })
        .catch(err => console.error("Failed to fetch wardrobe:", err));
    }
  }, [currentUser]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size too large (max 5MB)");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/wardrobe/', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setWardrobeItems([data.item, ...wardrobeItems]);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteWardrobeItem = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this wardrobe item?")) return;
    try {
      const res = await fetch(`/api/wardrobe/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setWardrobeItems(wardrobeItems.filter(item => item.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete item");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Error deleting item");
    }
  };

  return (
    <MainLayout>

      {/* SECTION 1: HERO SECTION */}
      <section className="relative px-6 lg:px-8 py-12 lg:py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold tracking-wide uppercase text-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
              ✨ AI-Powered Fashion
            </span>
            <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tight text-primary dark:text-white">
              Personalized Fashion <br /> Recommendations <br /> Using AI
            </h1>
            <p className="text-lg text-secondary max-w-md leading-relaxed dark:text-gray-400">
              Experience the future of style with our Deep Learning engine. Get outfit suggestions tailored to your body type, occasion, and current trends.
            </p>
            <div className="flex space-x-4 pt-4">
              <Link to="/recommendation">
                <button className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                  Get Recommendation
                </button>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-[650px] rounded-[2.5rem] overflow-hidden group shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=2187&auto=format&fit=crop"
              alt="Male Fashion Model in Studio"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* SECTION 1.5: AI SIZE ESTIMATION OVERVIEW */}
      <section className="px-6 lg:px-8 py-20 bg-gray-50 dark:bg-black/40 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-square group bg-white dark:bg-gray-800">
              <img
                src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2000&auto=format&fit=crop"
                alt="AI Body Measurement Visualization"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                 <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-xl flex items-center shadow-lg">
                    <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center mr-4">
                      <span className="text-white dark:text-black">✨</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Precision Mapping</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Advanced body shape detection</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-4xl lg:text-5xl font-serif font-bold text-primary dark:text-white mb-4">
                  AI Size Estimation
                </h2>
                <p className="text-lg text-secondary dark:text-gray-400 leading-relaxed">
                  Upload a full-body photo and let AI estimate your body measurements and recommend the perfect clothing size.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { step: 1, title: 'Upload Photo', desc: 'Upload a full-body photo from your device.' },
                  { step: 2, title: 'AI Analysis', desc: 'The AI model analyzes body proportions and measurements.' },
                  { step: 3, title: 'Size Prediction', desc: 'The system estimates your clothing size (S, M, L, XL).' },
                  { step: 4, title: 'Perfect Fit', desc: 'FashionAI recommends clothing that fits your body.' }
                ].map((item) => (
                  <div key={item.step} className="flex flex-row items-stretch group">
                    <div className="mr-6 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center font-bold text-lg text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 group-hover:border-black dark:group-hover:border-white transition-colors duration-300">
                        {item.step}
                      </div>
                      {item.step !== 4 && (
                        <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-3"></div>
                      )}
                    </div>
                    <div className="pb-6 pt-2">
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link to="/recommendation">
                  <button className="bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition-transform active:scale-95 duration-300 flex items-center gap-3 shadow-xl dark:bg-white dark:text-black dark:hover:bg-gray-200">
                    Try Size Estimation
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION EX-2: HERO FEATURE GRID */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:mt-12">
          {[
            { title: "AI Outfit Recs", desc: "Deep learning algorithms match your style.", icon: "🧥" },
            { title: "Size Estimation", desc: "AI-powered body measurement using an uploaded photo.", icon: "📏", link: "/size-estimation" },
            { title: "Occasion Styling", desc: "Perfect looks for work, party, or casual.", icon: "📅" },
            { title: "Trend Awareness", desc: "Real-time analysis of global fashion trends.", icon: "📈" },
          ].map((feature, idx) => (
            <div key={idx} className="bg-background border border-gray-100 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group dark:bg-gray-800/50 dark:border-gray-700 flex flex-col items-start h-full">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm mb-6 group-hover:scale-110 transition-transform dark:bg-gray-700 dark:text-white">
                {feature.icon}
              </div>
              <h3 className="font-serif text-lg font-bold mb-2 text-primary dark:text-white">{feature.title}</h3>
              <p className="text-secondary text-sm leading-relaxed dark:text-gray-400 flex-grow w-full">{feature.desc}</p>
              
              {feature.link && (
                <Link to={feature.link} className="mt-6 w-full hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-full bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all active:scale-95 shadow-md dark:bg-white dark:text-black dark:hover:bg-gray-200">
                    Get Recommendation
                  </button>
                </Link>
              )}
              {feature.link && (
                <Link to={feature.link} className="mt-6 w-full block md:hidden">
                  <button className="w-full bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all active:scale-95 shadow-md dark:bg-white dark:text-black dark:hover:bg-gray-200">
                    Get Recommendation
                  </button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: OCCASION-BASED STYLING */}
      <section className="px-6 lg:px-8 py-24 bg-background dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4 dark:text-white">Style For Every Occasion</h2>
            <div className="flex justify-center space-x-2 md:space-x-4 overflow-x-auto pb-4">
              {Object.keys(occasionOutfits).map((occasion) => (
                <button
                  key={occasion}
                  onClick={() => setActiveOccasion(occasion)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${activeOccasion === occasion
                    ? 'bg-black text-white shadow-lg dark:bg-white dark:text-black'
                    : 'bg-white border border-gray-200 text-secondary hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                  {occasion}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {occasionOutfits[activeOccasion].map((outfit) => (
              <div key={outfit.id} className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
                <img src={outfit.image} alt={outfit.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-80">{activeOccasion}</span>
                  <h3 className="text-2xl font-serif font-bold">{outfit.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: VIRTUAL WARDROBE MOCKUP */}
      <section id="wardrobe" className="px-6 lg:px-8 py-24 bg-white border-y border-gray-100 dark:bg-black dark:border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-serif font-bold dark:text-white">Virtual Wardrobe</h2>
            <button className="text-sm font-medium border-b border-black hover:opacity-70 transition-opacity dark:text-gray-300 dark:border-white">View My Closet</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {/* Upload Card */}
            <div
              onClick={() => currentUser ? fileInputRef.current?.click() : alert("Please login to add items")}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-white dark:hover:text-white"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
              />
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              ) : (
                <>
                  <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-sm font-medium">Add Item</span>
                </>
              )}
            </div>

            {/* Wardrobe Items - Dynamic or Mock */}
            {currentUser ? (
              wardrobeItems.length > 0 ? (
                wardrobeItems.map((item) => (
                  <div key={item.id} className="aspect-square rounded-2xl overflow-hidden relative group bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={item.image_url.startsWith('/uploads') ? `/api${item.image_url}` : item.image_url} 
                      alt="Wardrobe item" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&auto=format&fit=crop'; }}
                    />
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold ring-2 ring-white/50">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                    </div>
                    {/* Delete Option Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <button 
                        onClick={(e) => handleDeleteWardrobeItem(item.id, e)}
                        className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-red-600 shadow-xl flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 md:col-span-4 flex items-center justify-center text-gray-400 italic">
                  Your wardrobe is empty. Add some items!
                </div>
              )
            ) : (
              // Show Mock items if not logged in
              [
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1936&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1897&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1964&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935&auto=format&fit=crop"
              ].map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group">
                  <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                  {/* Overlay prompting login */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold border border-white px-2 py-1 rounded">Login to View</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SECTION 7: LATEST TRENDS */}
      <section id="trends" className="px-6 lg:px-8 py-24 bg-background dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-serif font-bold mb-12 dark:text-white">Latest Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "The Return of Y2K", desc: "Why early 2000s fashion is dominating the runway again.", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop" },
              { title: "Sustainable Footwear", desc: "Top brands pivoting to mushroom leather and recycled plastics.", img: "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?q=80&w=2098&auto=format&fit=crop" },
              { title: "Color of the Year", desc: "How to style 'Digital Lavender' for maximum impact.", img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1976&auto=format&fit=crop" },
            ].map((trend, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4">
                  <img src={trend.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Trend Report</p>
                <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-secondary transition-colors dark:text-white dark:group-hover:text-gray-300">{trend.title}</h3>
                <p className="text-secondary text-sm leading-relaxed mb-3 dark:text-gray-400">{trend.desc}</p>
                <span className="text-xs font-bold uppercase border-b border-black pb-0.5 dark:text-white dark:border-white">Read Article</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </MainLayout >
  )
}
