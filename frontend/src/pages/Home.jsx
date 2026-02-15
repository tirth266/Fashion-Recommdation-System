import { Link } from 'react-router-dom'
import MainLayout from '../components/MainLayout' // Might not exist or be needed if we don't use it, but keeping if main used it. Actually I will NOT use MainLayout to avoid Navbar duplication.

export default function Home() {
  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center py-24 mb-20 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>

          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 glass rounded-full text-sm font-bold text-purple-700 mb-8 border border-purple-200/50 backdrop-blur-md animate-slide-up">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse-glow"></span>
              ✨ AI-Powered Fashion Intelligence
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Redefine Your
              <span className="block gradient-text mt-2">Fashion Journey</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Discover personalized fashion recommendations powered by cutting-edge AI and advanced computer vision technology
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/recommendations">
                <button className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2">
                  <span>🚀</span> Get Started Now
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </Link>
              <button className="group px-10 py-5 glass text-gray-900 font-bold rounded-2xl border-2 border-gray-200 hover:border-purple-400 transform hover:scale-105 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2">
                <span>📚</span> Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-28">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">Everything you need to revolutionize your fashion experience with cutting-edge technology</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🔍', title: 'Image Search', desc: 'Find similar items using advanced image recognition technology', color: 'from-purple-500 to-purple-600', link: '/image-search' },
              { icon: '💰', title: 'Price Comparison', desc: 'Compare prices across retailers and find the best deals', color: 'from-pink-500 to-pink-600', link: '/price-comparison' },
              { icon: '✨', title: 'Recommendations', desc: 'Get personalized suggestions tailored to your style', color: 'from-indigo-500 to-indigo-600', link: '/recommendations' },
              { icon: '📋', title: 'Size Estimation', desc: 'Find your perfect fit with smart measurements', color: 'from-teal-500 to-teal-600', link: '/size-estimation' },
            ].map((feature, idx) => (
              <Link key={idx} to={feature.link} className="block">
                <div className="group glass card-hover p-8 rounded-2xl border border-white/20 hover:border-white/40 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  <div className="mt-6 pt-6 border-t border-white/10 flex items-center text-purple-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SMART SIZE PREDICTION (From Main) */}
        <section id="smart-sizing" className="px-6 lg:px-8 py-24 bg-white border-y border-gray-100 rounded-3xl mb-20 shadow-sm">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block px-3 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                Computer Vision
              </div>
              <h2 className="text-4xl font-serif font-black leading-tight text-gray-900">
                Smart Size <br /> Prediction
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Say goodbye to returns. Our computer vision technology analyzes your body measurements from a single photo to predict your perfect size with 99.5% accuracy.
              </p>
              <ul className="space-y-4 pt-4">
                {['Camera-based body landmark detection', 'Height & shoulder width analysis', 'Brand-specific size mapping'].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-gray-700 font-medium">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/size-estimation">
                <button className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-teal-700 transform hover:scale-105 transition-all shadow-lg">Try Size Estimation</button>
              </Link>
            </div>

            {/* Visual Mock of Body Scanning */}
            <div className="relative h-[550px] bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden flex items-center justify-center">
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

        {/* Stats Section */}
        <section className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-12 md:p-16 text-white mb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40"></div>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10K+', label: 'Fashion Items', icon: '👔' },
              { number: '50K+', label: 'Active Users', icon: '👥' },
              { number: '98%', label: 'Accuracy Rate', icon: '🎯' },
              { number: '24/7', label: 'Premium Support', icon: '🎧' },
            ].map((stat, idx) => (
              <div key={idx} className="group card-hover">
                <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-black mb-2">{stat.number}</div>
                <div className="text-white/80 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center pb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Fashion Experience?</h2>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">Join thousands of users who are already discovering their perfect style with our AI-powered platform</p>
          <Link to="/recommendations">
            <button className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-lg">
              Start Your Fashion Journey
            </button>
          </Link>
        </section>
      </div>
    </main>
  )
}
