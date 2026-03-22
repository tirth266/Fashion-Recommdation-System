// src/components/SmartSize/SizeRecommendation.jsx
import { motion } from 'framer-motion';

const SizeRecommendation = ({ size, measurements, confidence }) => {
  const getSizeColor = (size) => {
    const colors = {
      'XS': 'from-purple-400 to-purple-600',
      'S': 'from-blue-400 to-blue-600',
      'M': 'from-green-400 to-green-600',
      'L': 'from-yellow-400 to-yellow-600',
      'XL': 'from-orange-400 to-orange-600',
      'XXL': 'from-red-400 to-red-600',
    };
    return colors[size] || 'from-gray-400 to-gray-600';
  };

  const getSizeAdvice = (size) => {
    const advice = {
      'XS': 'Extra Small - Best for slender builds',
      'S': 'Small - Ideal for athletic or slim frames',
      'M': 'Medium - Perfect for average builds',
      'L': 'Large - Great for broader shoulders',
      'XL': 'Extra Large - Comfortable fit for larger frames',
      'XXL': 'XX Large - Relaxed fit for maximum comfort',
    };
    return advice[size] || 'Size recommendation based on your measurements';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl shadow-2xl p-8 max-w-2xl mx-auto text-white"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2 opacity-90">Your Recommended Size</h3>
        <div className={`inline-block bg-gradient-to-r ${getSizeColor(size)} px-12 py-6 rounded-2xl shadow-lg`}>
          <p className="text-5xl font-bold">{size}</p>
        </div>
      </div>

      <p className="text-center text-lg mb-6 opacity-90">
        {getSizeAdvice(size)}
      </p>

      {/* Confidence Indicator */}
      {confidence && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-80">Confidence Level</span>
            <span className="text-sm font-semibold">{Math.round(confidence * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="opacity-70 mb-1">Chest</p>
          <p className="font-semibold text-lg">{measurements.chestWidth ? Math.round(measurements.chestWidth) : '--'} cm</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="opacity-70 mb-1">Waist</p>
          <p className="font-semibold text-lg">{measurements.waist ? Math.round(measurements.waist) : '--'} cm</p>
        </div>
      </div>

      {/* Fit Tips */}
      <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <h4 className="font-semibold mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Fit Tips
        </h4>
        <ul className="space-y-1 text-sm opacity-90">
          <li>• Choose a smaller size for a tighter fit</li>
          <li>• Choose a larger size for a looser, more comfortable fit</li>
          <li>• Consider fabric type - stretchy materials offer more flexibility</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default SizeRecommendation;
