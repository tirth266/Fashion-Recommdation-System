export default function Home() {
  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center py-24 mb-20 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
          
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 glass rounded-full text-sm font-bold text-purple-700 mb-8 border border-purple-200/50 backdrop-blur-md animate-slide-up">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse-glow"></span>
              ✨ AI-Powered Fashion Intelligence
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight animate-slide-up" style={{animationDelay: '0.1s'}}>
              Redefine Your
              <span className="block gradient-text mt-2">Fashion Journey</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
              Discover personalized fashion recommendations powered by cutting-edge AI and advanced computer vision technology
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up" style={{animationDelay: '0.3s'}}>
              <button className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2">
                <span>🚀</span> Get Started Now
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
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
              { icon: '🔍', title: 'Image Search', desc: 'Find similar items using advanced image recognition technology', color: 'from-purple-500 to-purple-600', hoverColor: 'purple' },
              { icon: '💰', title: 'Price Comparison', desc: 'Compare prices across retailers and find the best deals', color: 'from-pink-500 to-pink-600', hoverColor: 'pink' },
              { icon: '✨', title: 'Recommendations', desc: 'Get personalized suggestions tailored to your style', color: 'from-indigo-500 to-indigo-600', hoverColor: 'indigo' },
              { icon: '📋', title: 'Size Estimation', desc: 'Find your perfect fit with smart measurements', color: 'from-teal-500 to-teal-600', hoverColor: 'teal' },
            ].map((feature, idx) => (
              <div key={idx} className="group glass card-hover p-8 rounded-2xl border border-white/20 hover:border-white/40">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center text-purple-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore →</span>
                </div>
              </div>
            ))}
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
        <section className="text-center py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Fashion Experience?</h2>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">Join thousands of users who are already discovering their perfect style with our AI-powered platform</p>
          <button className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-lg">
            Start Your Fashion Journey
          </button>
        </section>
      </div>
    </main>
  )
}

