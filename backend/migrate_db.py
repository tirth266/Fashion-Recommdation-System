"""
Database Migration Script - Add google_id column
Run this to update existing database for Google OAuth support
"""

import sqlite3
import os

def migrate_database():
    db_path = os.path.join(os.path.dirname(__file__), '..', '..', 'instance', 'fashion.db')
    
    if not os.path.exists(db_path):
        print("❌ Database not found. It will be created automatically when you run the app.")
        return
    
    print(f"📁 Found database at: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if google_id column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'google_id' in columns:
            print("✅ google_id column already exists!")
        else:
            print("➕ Adding google_id column...")
            cursor.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_users_google_id ON users (google_id)")
            conn.commit()
            print("✅ google_id column added successfully!")
        
        # Check if profile_picture column exists
        if 'profile_picture' not in columns:
            print("➕ Adding profile_picture column...")
            cursor.execute("ALTER TABLE users ADD COLUMN profile_picture TEXT")
            conn.commit()
            print("✅ profile_picture column added!")
        
        print("\n✅ Database migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("DATABASE MIGRATION - Adding Google OAuth Support")
    print("=" * 60)
    print()
    migrate_database()
    print()
    print("=" * 60)
    print("You can now restart the backend server!")
    print("=" * 60)
