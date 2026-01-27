export default function Home() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <section className="text-center py-12 mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Welcome to Fashion Recommendation System</h2>
          <p className="text-xl text-gray-600">Discover personalized fashion recommendations based on your style</p>
        </section>

        {/* Features Grid */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Image Search</h3>
              <p className="text-gray-600 leading-relaxed">Find similar items using image recognition technology</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Price Comparison</h3>
              <p className="text-gray-600 leading-relaxed">Compare prices across different retailers easily</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Recommendations</h3>
              <p className="text-gray-600 leading-relaxed">Get personalized product recommendations tailored for you</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Size Estimation</h3>
              <p className="text-gray-600 leading-relaxed">Find your perfect fit with our smart size estimation tool</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

