import sqlite3
import bcrypt

# Connect to the database
conn = sqlite3.connect('networking_app.db')
cursor = conn.cursor()

# Check if is_admin column exists, add it if not
cursor.execute("PRAGMA table_info(users)")
columns = [row[1] for row in cursor.fetchall()]

if 'is_admin' not in columns:
    cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0")
    print("Added is_admin column to users table")

# Check if admin user exists
try:
    cursor.execute("SELECT id FROM users WHERE is_admin = 1")
    admin_exists = cursor.fetchone()
except:
    admin_exists = None

if admin_exists:
    print("Admin user already exists")
else:
    # Hash the password
    password = "admin123"
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # is_admin column already checked above
    
    # Insert admin user
    cursor.execute("""
        INSERT INTO users (
            email, username, password_hash, first_name, last_name,
            is_active, is_verified, is_admin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "admin@networkingapp.com",
        "admin",
        hashed_password,
        "Admin",
        "User",
        1,  # is_active
        1,  # is_verified
        1   # is_admin
    ))
    
    conn.commit()
    print("Created admin user successfully!")
    print("Username: admin")
    print("Password: admin123")

conn.close()