# 👗 Fashion Recommendation System

An AI-powered fashion recommendation system that suggests visually similar outfits and provides personalized size recommendations using deep learning and user preferences.

---

## 🚀 Features

* 🔍 **Image-based Recommendations**
  Upload an image and get visually similar fashion items using deep learning (CNN + embeddings)

* 👤 **User Authentication (Google + Manual Login)**
  Secure login using Google OAuth and manual signup

* 🧠 **Personalized Recommendations**
  Uses user preferences like:

  * Favorite colors
  * Preferred brands
  * Fit type

* 📏 **Smart Size Estimation**
  Suggests clothing size based on user body measurements

* 🧥 **Wardrobe Management**
  Users can upload and manage their clothing items

* ☁️ **MongoDB Integration**
  Stores user profiles, preferences, and activity in cloud database

---

## 🧱 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS

### Backend

* Flask (Python)
* REST APIs

### Machine Learning

* CNN Feature Extraction (ResNet)
* Image similarity using embeddings (cosine similarity)

### Database

* MongoDB Atlas (Primary)
* SQLite (Fallback during development)

---

## 📁 Project Structure

```
Fashion-Recommdation-System/
│
├── frontend/                # React frontend
│   ├── src/
│   └── public/
│
├── backend/
│   ├── app/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── database/
│   │
│   ├── models/             # ML models & embeddings
│   ├── run.py              # Entry point
│   └── requirements.txt
│
├── data/                   # Dataset (not included in repo)
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```
git clone https://github.com/tirth266/Fashion-Recommdation-System.git
cd Fashion-Recommdation-System
```

---

### 2️⃣ Backend Setup

```
cd backend
pip install -r requirements.txt
```

Create `.env` file:

```
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key
```

Run backend:

```
python run.py
```

---

### 3️⃣ Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## 🔐 Google Authentication Setup

1. Go to Google Cloud Console
2. Create OAuth Client ID
3. Add:

```
http://localhost:5173
http://127.0.0.1:5173
```

to **Authorized JavaScript origins**

---

## 🗄️ MongoDB Setup

* Create cluster in MongoDB Atlas
* Add IP address (0.0.0.0/0 for development)
* Create database user
* Add connection string in `.env`

---

## 🧠 How It Works

1. User uploads an image
2. CNN extracts features (embeddings)
3. Compare with dataset using cosine similarity
4. Return top matching fashion items

Additionally:

* User preferences refine results
* Size estimation uses body measurements

---

## 📊 Dataset

* Based on Fashion Product Images dataset
* Not included due to size
* Can be downloaded from Kaggle

---

## ⚠️ Notes

* Large files (dataset, embeddings) are excluded from GitHub
* MongoDB is used for scalable cloud storage
* SQLite fallback ensures system reliability during development

---

## 👨‍💻 Contributors

* Savan Patel
* Team Members

---

## 📌 Future Improvements

* Improve recommendation accuracy with metadata filtering
* Add outfit pairing suggestions
* Deploy on cloud (AWS / Render)
* Mobile app integration

---

## ⭐ Conclusion

This project demonstrates the integration of **AI + Web Development + Cloud Database** to build a real-world fashion recommendation system with personalization and scalability.
