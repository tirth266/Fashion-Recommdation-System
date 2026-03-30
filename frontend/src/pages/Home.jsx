import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import MainLayout from '../components/MainLayout'
import { useAuth } from '../context/AuthContext'



export default function Home() {
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

    // Validation (optional)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size too large (max 5MB)");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    // formData.append('category', 'Top'); // Could add a selector later

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
              <Link to="/get-recommendations">
                <button className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                  Get Recommendations
                </button>
              </Link>
              <button className="border border-gray-300 text-primary px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-all duration-300 dark:border-gray-600 dark:text-white dark:hover:bg-white/10">
                Explore Styles
              </button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 lg:mt-24">
          {[
            { title: "AI Outfit Recs", desc: "Deep learning algorithms match your style.", icon: "🧥" },
            { title: "Smart Sizing", desc: "Computer vision body measurement analysis.", icon: "📏" },
            { title: "Occasion Styling", desc: "Perfect looks for work, party, or casual.", icon: "📅" },
            { title: "Trend Awareness", desc: "Real-time analysis of global fashion trends.", icon: "📈" },
          ].map((feature, idx) => (
            <div key={idx} className="bg-background border border-gray-100 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group dark:bg-gray-800/50 dark:border-gray-700">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm mb-6 group-hover:scale-110 transition-transform dark:bg-gray-700 dark:text-white">
                {feature.icon}
              </div>
              <h3 className="font-serif text-lg font-bold mb-2 text-primary dark:text-white">{feature.title}</h3>
              <p className="text-secondary text-sm leading-relaxed dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: RECOMMENDED OUTFITS */}
      <section className="px-6 lg:px-8 py-24 bg-background dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-2 dark:text-white">Recommended For You</h2>
              <p className="text-secondary text-sm dark:text-gray-400">Based on your recent uploads and preferences.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {[
              { name: "Urban Chic Set", score: "98%", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop" },
              { name: "Minimalist Coat", score: "95%", img: "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1974&auto=format&fit=crop" },
              { name: "Evening Elegance", score: "92%", img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=2108&auto=format&fit=crop" },
              { name: "Weekend Casual", score: "89%", img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2005&auto=format&fit=crop" },
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer relative">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 bg-gray-200 relative">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                  {/* Similarity Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm text-green-700 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {item.score} Match
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="bg-white text-black px-6 py-2 rounded-full font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      View Details
                    </button>
                  </div>
                </div>
                <h3 className="font-serif text-lg font-bold text-primary dark:text-white">{item.name}</h3>
                <p className="text-secondary text-xs uppercase tracking-wider mt-1 dark:text-gray-400">AI Suggestion</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SMART SIZE PREDICTION */}
      <section id="smart-sizing" className="px-6 lg:px-8 py-24 bg-white border-y border-gray-100 dark:bg-black dark:border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block px-3 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider dark:bg-blue-900/40 dark:text-blue-200">
              Computer Vision
            </div>
            <h2 className="text-4xl font-serif font-bold leading-tight dark:text-white">
              Smart Size <br /> Prediction
            </h2>
            <p className="text-secondary leading-relaxed text-lg dark:text-gray-300">
              Say goodbye to returns. Our computer vision technology analyzes your body measurements from a single photo to predict your perfect size with 99.5% accuracy.
            </p>
            <ul className="space-y-4 pt-4">
              {['Camera-based body landmark detection', 'Height & shoulder width analysis', 'Brand-specific size mapping'].map((item, i) => (
                <li key={i} className="flex items-center space-x-3 text-primary font-medium">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/smart-size-estimation">
              <button className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 mt-8 dark:bg-white dark:text-black dark:hover:bg-gray-200">Try Body Measurement</button>
            </Link>
          </div>

          {/* Visual Mock of Body Scanning */}
          <div className="relative h-[550px] bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden flex items-center justify-center dark:bg-gray-800 dark:border-gray-700">
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" alt="Size scanning" />

            {/* Abstract Skeleton Overlay */}
            <div className="relative z-10 w-64 h-[400px] border-2 border-blue-500/50 rounded-xl flex flex-col items-center justify-between py-8 animate-pulse">
              <div className="w-20 h-20 border-2 border-blue-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="w-40 h-1 border-t-2 border-dashed border-blue-400 relative">
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs bg-black text-white px-2 py-0.5 rounded">42cm</span>
              </div>
              <div className="w-32 h-1 border-t-2 border-dashed border-blue-400 relative">
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs bg-black text-white px-2 py-0.5 rounded">28cm</span>
              </div>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded px-3 py-2 shadow-lg">
                <p className="text-xs text-gray-500 uppercase">Estimated Size</p>
                <p className="text-lg font-bold text-gray-900">Medium (US 6)</p>
              </div>
            </div>
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
                  <div key={item.id} className="aspect-square rounded-2xl overflow-hidden relative group bg-gray-100">
                    <img src={item.image_url} alt="Wardrobe item" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
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



    </MainLayout >
  )
}
