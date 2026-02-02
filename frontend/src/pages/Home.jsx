export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center py-16 mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-3xl transform rotate-1"></div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-purple-700 mb-6 border border-purple-200">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              AI-Powered Fashion Intelligence
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to Fashion
              <span className="block mt-2">Recommendation System</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover personalized fashion recommendations powered by AI and computer vision
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Get Started
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transform hover:scale-105 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to revolutionize your fashion experience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Image Search</h3>
              <p className="text-gray-600 leading-relaxed">Find similar items using advanced image recognition technology and computer vision</p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-pink-200">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">Price Comparison</h3>
              <p className="text-gray-600 leading-relaxed">Compare prices across different retailers and find the best deals instantly</p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-indigo-200">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">Recommendations</h3>
              <p className="text-gray-600 leading-relaxed">Get personalized product recommendations tailored to your unique style and preferences</p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-teal-200">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">Size Estimation</h3>
              <p className="text-gray-600 leading-relaxed">Find your perfect fit with our smart size estimation tool using body measurements</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">10K+</div>
              <div className="text-purple-100">Products</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">50K+</div>
              <div className="text-purple-100">Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
              <div className="text-purple-100">Accuracy</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-purple-100">Support</div>
            </div>
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

