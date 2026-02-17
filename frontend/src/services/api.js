// API service for the Fashion Recommendation System
const API_BASE_URL = '/api';

class FashionAPI {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  // Profile endpoints
  async updateProfile(profileData) {
    return await this.request('/profile/update', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getPreferences() {
    return await this.request('/profile/preferences');
  }

  async updatePreferences(preferences) {
    return await this.request('/profile/preferences', {
      method: 'POST',
      body: JSON.stringify(preferences)
    });
  }

  async getMeasurements() {
    return await this.request('/profile/measurements');
  }

  async updateMeasurements(measurements) {
    return await this.request('/profile/measurements', {
      method: 'PUT',
      body: JSON.stringify(measurements)
    });
  }

  // Recommendation endpoints
  async getPersonalizedRecommendations() {
    return await this.request('/recommendations/personalized');
  }

  async getRecommendationsByCategory(category) {
    return await this.request(`/recommendations/by-category/${category}`);
  }

  async getTrendingRecommendations() {
    return await this.request('/recommendations/trending');
  }

  async getSimilarProducts(productId) {
    return await this.request(`/recommendations/similar/${productId}`);
  }

  // Search endpoints
  async textSearch(query) {
    return await this.request('/search/text', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  async imageSearch(imageData) {
    return await this.request('/search/image', {
      method: 'POST',
      body: JSON.stringify({ image_data: imageData })
    });
  }

  async priceComparison(productId) {
    return await this.request('/search/price-comparison', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId })
    });
  }

  async filteredSearch(filters) {
    return await this.request('/search/filter', {
      method: 'POST',
      body: JSON.stringify(filters)
    });
  }

  async getCategories() {
    return await this.request('/search/categories');
  }

  async getBrands() {
    return await this.request('/search/brands');
  }

  // Size estimation endpoints
  async calculateSize(measurements) {
    return await this.request('/size/calculate', {
      method: 'POST',
      body: JSON.stringify(measurements)
    });
  }

  async getSizeRecommendations(category, size) {
    return await this.request('/size/recommendations', {
      method: 'POST',
      body: JSON.stringify({ category, size })
    });
  }

  async getSizeChart() {
    return await this.request('/size/chart');
  }

  async getFitAdvice(category, measurements) {
    return await this.request('/size/fit-advice', {
      method: 'POST',
      body: JSON.stringify({ product_category: category, user_measurements: measurements })
    });
  }

  // Initialize mock data
  async initMockData() {
    try {
      return await this.request('/recommendations/init-mock-data', {
        method: 'POST'
      });
    } catch (error) {
      console.log('Mock data already initialized or error:', error.message);
      return null;
    }
  }
}

// Create singleton instance
const fashionAPI = new FashionAPI();

export default fashionAPI;