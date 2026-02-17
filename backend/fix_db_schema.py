import sqlite3
import os

db_path = os.path.join("instance", "fashion.db")
if not os.path.exists(db_path):
    # Try alternate location if instance folder not used or different cwd
    db_path = "fashion.db"

print(f"Checking database at {db_path}...")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check existing columns
    cursor.execute("PRAGMA table_info(users)")
    columns = [info[1] for info in cursor.fetchall()]
    print(f"Existing columns: {columns}")
    
    if "google_id" not in columns:
        print("Adding google_id column...")
        cursor.execute("ALTER TABLE users ADD COLUMN google_id TEXT")
        print("google_id added.")
    else:
        print("google_id already exists.")
        
    if "last_login" not in columns:
        print("Adding last_login column...")
        cursor.execute("ALTER TABLE users ADD COLUMN last_login TIMESTAMP")
        print("last_login added.")
    else:
        print("last_login already exists.")

    conn.commit()
    conn.close()
    print("Database update complete.")

except Exception as e:
    print(f"Error: {e}")
