import sqlite3
import os

# Path to database
db_path = os.path.join('instance', 'fashion.db')

print(f"Checking database at {db_path}...")

if not os.path.exists(db_path):
    print("Database file NOT found.")
    import sys
    sys.exit(0)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    with open('verify_log.txt', 'w') as f:
        def log(msg):
            print(msg)
            f.write(msg + '\n')

        # Get columns
        cursor.execute("PRAGMA table_info(users)")
        columns_info = cursor.fetchall()
        columns = [info[1] for info in columns_info]
            
        log(f"Current columns in 'users': {columns}")
        
        if 'google_id' in columns:
            log("PASS: google_id column exists.")
        else:
            log("FAIL: google_id column MISSING. Attempting to fix...")
            try:
                conn.execute('ALTER TABLE users ADD COLUMN google_id VARCHAR(255)')
                log("FIXED: Added google_id column.")
                conn.commit()
            except Exception as e:
                log(f"ERROR: Could not add column: {e}")
                
        if 'profile_image' in columns:
            log("PASS: profile_image column exists.")
        else:
             # Note: init_db.py defines it as 'profile_image'
            log("FAIL: profile_image column MISSING. Attempting to fix...")
            try:
                conn.execute('ALTER TABLE users ADD COLUMN profile_image VARCHAR(200)')
                log("FIXED: Added profile_image column.")
                conn.commit()
            except Exception as e:
                 log(f"ERROR: Could not add column: {e}")

        if 'last_login' in columns:
            log("PASS: last_login column exists.")
        else:
            log("FAIL: last_login column MISSING. Attempting to fix...")
            try:
                # Add last_login as nullable datetime (TEXT in SQLite)
                conn.execute('ALTER TABLE users ADD COLUMN last_login TIMESTAMP')
                log("FIXED: Added last_login column.")
                conn.commit()
            except Exception as e:
                 log(f"ERROR: Could not add column: {e}")

    conn.close()

except Exception as e:
    print(f"Critical Error: {e}")
