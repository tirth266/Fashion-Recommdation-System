// src/components/SmartSize/RecommendedProducts.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const RecommendedProducts = ({ products, size }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No products available for this size yet.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="max-w-7xl mx-auto"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Recommended Products in Size {size}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Curated selection based on your measurements
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Product Image */}
            <Link to={`/product/${product.id}`} className="block">
              <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={product.image_url || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
              </div>
            </Link>

            {/* Product Info */}
            <div className="p-4">
              <Link to={`/product/${product.id}`}>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {product.name}
                </h4>
              </Link>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                {product.brand}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  ${product.price?.toFixed(2) || '0.00'}
                </span>
                
                {product.size_availability?.includes(size) && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    In Stock
                  </span>
                )}
              </div>

              {/* Size Badge */}
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                  Size {size}
                </span>
                
                <button
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
                  onClick={() => console.log('Add to cart:', product.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>


    </motion.div>
  );
};

export default RecommendedProducts;
