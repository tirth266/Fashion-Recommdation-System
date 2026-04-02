# 🗄️ Team Database Setup Guide

> **Goal:** Ensure every teammate connects to the **SAME** MongoDB database — no confusion, no conflicts.

---

## 1. Why the Database is NOT Shared via GitHub

| What GitHub stores | What GitHub does NOT store |
|---|---|
| Source code, HTML, CSS, JS | Database data (user accounts, profiles) |
| Configuration templates | Passwords, API keys, connection strings |
| README, documentation | Your local MongoDB data files |

**Your MongoDB data lives on a server (local or cloud) — NOT inside the Git repo.**

When you `git push`, your code goes to GitHub. But the actual user records, profile data, and measurements stay in MongoDB wherever it's running. Each developer running `mongodb://localhost` has their **own separate local database** — they do NOT share data.

> ⚠️ **This means:** If Developer A creates a user on their local MongoDB, Developer B will NOT see that user on their machine. That's why you need a **shared cloud database**.

---

## 2. Why MongoDB Atlas (Cloud DB) is Required for Team Collaboration

| Local MongoDB | MongoDB Atlas (Cloud) |
|---|---|
| Data stays on YOUR machine only | Data is shared across ALL teammates |
| Each dev has different users | Everyone sees the same users |
| Works offline | Requires internet |
| Good for solo testing | **Required for team projects** |

**MongoDB Atlas** is a free cloud-hosted MongoDB service. All team members connect to the **same cluster** using the **same connection string**, so everyone reads and writes to the same database.

---

## 3. Step-by-Step: MongoDB Atlas Setup

Follow these steps **once** (one team member sets it up, then shares the connection string).

### Step 1: Create a MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"**
3. Sign up with Google or email
4. Choose the **FREE (M0)** tier

### Step 2: Create a Cluster

1. After signup, click **"Build a Database"**
2. Select **M0 FREE** tier
3. Choose a cloud provider (AWS recommended) and region closest to your team
4. Name your cluster (e.g., `FashionAI-Cluster`)
5. Click **"Create Cluster"** — wait 1-3 minutes

### Step 3: Set Up Database Access

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Set a username (e.g., `fashionai_admin`)
5. Set a strong password — **save this password!**
6. Set permissions to **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Set Up Network Access

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - ⚠️ This is fine for development. Restrict IPs in production.
4. Click **"Confirm"**

### Step 5: Get Your Connection String

1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Choose **Driver: Python** and **Version: 3.12 or later**
5. Copy the connection string. It looks like:

```
mongodb+srv://fashionai_admin:<password>@fashionai-cluster.abc123.mongodb.net/fashion_ai?retryWrites=true&w=majority
```

6. **Replace `<password>`** with your actual database user password
7. The database name in the URI should be `fashion_ai` (or `fashiondb`)

### Step 6: Create Database & Collection (Automatic)

The database and `users` collection are **created automatically** when the first user logs in via Google Auth. No manual setup needed!

If you want to verify manually:
1. In Atlas, go to **Database → Browse Collections**
2. You should see a database (e.g., `fashion_ai`) with a `users` collection

---

## 4. Environment Setup

### Create `.env` file in the `backend/` folder

```bash
# backend/.env

# Flask Configuration
SECRET_KEY=fashion-recommendation-system-secret-key-2026
FLASK_ENV=development

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB Configuration (Atlas)
MONGO_URI=mongodb+srv://fashionai_admin:YOUR_PASSWORD@fashionai-cluster.abc123.mongodb.net/fashion_ai?retryWrites=true&w=majority
```

> Replace the `MONGO_URI` value with YOUR actual Atlas connection string from Step 5.

---

## 5. Important Rules

### 🔴 Rule 1: NEVER Push `.env` to GitHub

The `.env` file contains passwords and secrets. **It must NEVER be committed.**

Verify `.env` is in `.gitignore`:

```gitignore
# Already in our .gitignore:
.env
backend/.env
```

### 🔴 Rule 2: Share MONGO_URI Securely

Share the connection string with teammates via:
- ✅ Private WhatsApp/Telegram message
- ✅ Google Drive (restricted access)
- ✅ In-person / verbal
- ❌ **NEVER** via GitHub, public channels, or email

### 🔴 Rule 3: Same URI for Everyone

Every team member must use the **exact same** `MONGO_URI` in their `.env` file. This ensures all developers read/write to the same database.

---

## 6. How Teammates Should Use This

### For each teammate — do this ONCE:

```bash
# 1. Pull the latest code
git pull origin main

# 2. Go to backend folder
cd backend

# 3. Create .env file (if it doesn't exist)
#    Copy from the template or create manually:
cp .env.example .env    # if template exists, OR create manually

# 4. Open .env and paste the MONGO_URI shared by your team lead
#    Edit the MONGO_URI line:
MONGO_URI=mongodb+srv://fashionai_admin:REAL_PASSWORD@fashionai-cluster.abc123.mongodb.net/fashion_ai?retryWrites=true&w=majority

# 5. Install dependencies
pip install -r requirements.txt

# 6. Run the backend
python run.py
```

### What you should see on startup:

```
✅ MongoDB connection successful
SQLite database tables created.
Server configured with Session (Filesystem) + MongoDB (PyMongo)
 * Running on http://0.0.0.0:5000
```

If MongoDB fails to connect, you'll see:
```
⚠️  MongoDB connection failed: ...
   The app will still start, but profile data won't persist.
   Set MONGO_URI in your .env file to fix this.
```

---

## 7. Troubleshooting

### ❌ Error: "IP not whitelisted"

```
ServerSelectionTimeoutError: connection closed
```

**Fix:**
1. Go to MongoDB Atlas → **Network Access**
2. Check if your IP is listed
3. Click **"Add IP Address"** → **"Allow Access from Anywhere"** (`0.0.0.0/0`)
4. Wait 1 minute, then try again

### ❌ Error: "Authentication failed"

```
OperationFailure: Authentication failed
```

**Fix:**
1. Double-check the **password** in your `MONGO_URI`
2. Make sure there are no extra spaces or special characters that need URL-encoding
3. Go to Atlas → **Database Access** → verify the username/password
4. If password contains special characters (`@`, `#`, `%`), URL-encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`

### ❌ Error: "Connection refused" / "ServerSelectionTimeoutError"

```
ServerSelectionTimeoutError: No servers found
```

**Fix:**
1. Check your **internet connection**
2. Verify the cluster name in your URI is correct
3. Make sure the Atlas cluster is **not paused** (free clusters pause after 60 days of inactivity)
4. Go to Atlas → **Database** → check cluster status is "Active"

### ❌ Error: "pymongo not found"

```
ModuleNotFoundError: No module named 'pymongo'
```

**Fix:**
```bash
pip install pymongo>=4.6.0
# or
pip install -r requirements.txt
```

### ❌ Error: "dnspython not found" (with `mongodb+srv://`)

```
ConfigurationError: The "dnspython" module must be installed
```

**Fix:**
```bash
pip install dnspython
```

---

## 8. Users Collection Schema

Every Google-authenticated user is stored in MongoDB with this structure:

```json
{
  "_id": "google_id_string",
  "name": "John Doe",
  "email": "john@gmail.com",
  "profile_pic": "https://lh3.googleusercontent.com/...",
  "body_measurements": {
    "height": "180",
    "chest": "100",
    "shoulder": "45",
    "wrist": "18"
  },
  "preferences": {
    "colors": ["Black", "Navy"],
    "brands": ["Nike", "Zara"],
    "fit": "Regular Fit"
  },
  "created_at": "2026-03-31T12:00:00Z",
  "updated_at": "2026-03-31T12:30:00Z"
}
```

- `_id` = Google ID (guarantees no duplicate users)
- Body measurements and preferences start empty and get filled when the user saves their profile

---

## 9. API Endpoints (Quick Reference)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/google` | Google login → finds or creates user in MongoDB |
| `GET` | `/api/profile/` | Fetch logged-in user's profile from MongoDB |
| `POST` | `/api/profile/` | Update measurements & preferences (used by frontend) |
| `POST` | `/api/profile/update` | Explicit update with `body_measurements` & `preferences` keys |
| `GET` | `/api/health` | Health check with MongoDB connection status |

---

## Quick Checklist for New Team Members

- [ ] Get the `MONGO_URI` from the team lead
- [ ] Create `backend/.env` file with the URI
- [ ] Run `pip install -r requirements.txt`
- [ ] Run `python run.py` and verify "MongoDB connection successful"
- [ ] Test by logging in via Google Auth
- [ ] Verify your user appears in Atlas → Browse Collections → users

---

*Last updated: March 2026*
