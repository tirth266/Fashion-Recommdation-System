# 👗 AI-Powered Fashion Recommendation & Smart Sizing System

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)](https://flask.palletsprojects.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.13+-orange.svg)](https://www.tensorflow.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent fashion recommendation system that delivers personalized outfit suggestions using machine learning and computer vision. The system analyzes user preferences, browsing history, and fashion trends to provide context-aware recommendations for various occasions (office, party, casual, formal, sports). Additionally, it features camera-based body measurement estimation to predict accurate clothing sizes, reducing size mismatch issues in online shopping.

It focuses on personalized styling, smart sizing, and occasion-based recommendations, making it ideal for e-commerce platforms, fashion startups, academic projects, and personal wardrobe management.

---

## 🚀 Key Features

* **Hybrid Recommendation Engine**
   * Combines collaborative filtering and content-based filtering
   * Learns from user behavior and product similarities
   * Delivers highly personalized outfit suggestions

* **Occasion-Based Styling**
   * Specific recommendations for office, party, casual, formal, sports wear
   * Context-aware suggestions based on event type
   * Supports multiple style categories

* **Smart Size Prediction (Computer Vision)**
   * Camera-based body measurement estimation
   * Detects height, shoulder width, and body shape
   * Recommends accurate clothing sizes to reduce returns

* **Virtual Wardrobe Management**
   * Upload and organize existing clothes
   * AI-powered color extraction and analysis
   * Generates outfit combinations from your wardrobe

* **Weather-Based Recommendations**
   * Integrates real-time weather data
   * Suggests appropriate outfits for current conditions
   * Location-aware clothing suggestions

* **Trend Analysis**
   * Tracks current fashion trends
   * Recommends trending items based on user style
   * Combines personal taste with popular styles

* **User Profile & Preferences**
   * Customizable style preferences
   * Browsing history tracking
   * Color and budget preferences

---

## 🧩 System Architecture

```
+-----------------+      API      +-----------------+      API      +-----------------+
|   Frontend UI   | <-----------> |  Flask Backend  | <-----------> |   ML Services   |
| (User Interface)|               | (API + Logic)   |               | (Recommendation)|
+-----------------+               +-----------------+               +-----------------+
                                          |
                                          | Database Access
                                          ▼
                                  +-----------------+
                                  |   PostgreSQL    |
                                  |   (User Data)   |
                                  +-----------------+
```

**Frontend** (HTML/CSS/JS) ↔ **Backend** (Flask API) ↔ **ML Engine** (Scikit-learn/TensorFlow) ↔ **Database** (SQLite/PostgreSQL)

---

## 🔄 Recommendation Lifecycle

1. **User Registration** - User creates account and sets style preferences
2. **Browse Products** - User explores fashion items, system tracks behavior
3. **ML Model Training** - Collaborative filtering learns from user interactions
4. **Recommendation Generation** - Hybrid model combines CF + content-based filtering
5. **Personalized Display** - User sees tailored outfit suggestions by occasion
6. **Feedback Loop** - User likes/purchases items → model improves over time

---

## 📸 Body Measurement Workflow

1. **Camera Activation** - User allows camera access on sizing page
2. **Pose Detection** - MediaPipe identifies 33 body landmarks
3. **Measurement Calculation** - Algorithms compute height, shoulder width, body shape
4. **Size Recommendation** - System maps measurements to standard clothing sizes
5. **Product Filtering** - Shows only items that fit user's size

---


## 💻 Technologies Used

**Backend & ML:**
- Python 3.9+ (Core language)
- Flask (Web framework & REST API)
- Scikit-learn (Collaborative filtering, clustering)
- TensorFlow/Keras (Deep learning for image features)
- Pandas & NumPy (Data processing)

**Computer Vision:**
- OpenCV (Image processing)
- MediaPipe (Pose detection & body landmarks)
- PIL/Pillow (Image handling)

**Frontend:**
- HTML5, CSS3, JavaScript
- Bootstrap 5 (Responsive UI)
- Axios (API calls)

**Database:**
- SQLite (Development)
- PostgreSQL (Production - optional)

**Additional Tools:**
- BeautifulSoup4 (Web scraping fashion data)
- OpenWeather API (Weather-based recommendations)
- Git & GitHub (Version control)

---

## 🎯 Project Goals

* Deliver personalized fashion recommendations using hybrid ML approach
* Reduce online shopping return rates through accurate size prediction
* Provide occasion-specific outfit suggestions for diverse scenarios
* Enable users to maximize their existing wardrobe with AI-powered combinations
* Create a learning-focused yet industry-aligned recommendation system
* Demonstrate practical applications of ML and computer vision in e-commerce

---

## 📚 Use Cases

* **E-commerce Platforms** - Integrate smart recommendations and sizing
* **Fashion Startups** - Build personalized shopping experiences
* **Personal Styling Apps** - AI-powered wardrobe management
* **Academic Projects** - ML & CV demonstration for students
* **Fashion Retail** - Reduce returns and improve customer satisfaction
* **Wardrobe Planning Tools** - Occasion-based outfit suggestions

