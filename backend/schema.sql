CREATE DATABASE IF NOT EXISTS ccc_smartassist;
USE ccc_smartassist;
-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    system_name VARCHAR(255) DEFAULT 'CCC SmartAssist',
    theme_color VARCHAR(50) DEFAULT 'blue',
    api_key TEXT,
    CONSTRAINT one_row CHECK (id = 1)
);
-- Insert default settings if not exists
INSERT IGNORE INTO settings (id, system_name, theme_color, api_key)
VALUES (1, 'CCC SmartAssist', 'blue', '');
-- Knowledge Base Table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id VARCHAR(50) PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    source VARCHAR(50) DEFAULT 'manual',
    date_added BIGINT
);
-- Manual Rules Table
CREATE TABLE IF NOT EXISTS manual_rules (
    id VARCHAR(50) PRIMARY KEY,
    keyword TEXT NOT NULL,
    response TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE
);
-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'New Inquiry',
    user_id VARCHAR(50),
    last_updated BIGINT
);
-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50),
    role VARCHAR(20),
    content TEXT,
    timestamp BIGINT,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    student_id VARCHAR(50),
    course VARCHAR(100),
    year_level VARCHAR(20)
);
-- Insert default users (Password is 'admin123' and 'student123' hashed with password_hash)
-- admin: $2y$10$8.7.o8.B/V6.v/G1v8W/vO7.v.F.G.0.G.G.G.G.G.G.G.G.G.G.G.G.G
-- For simplicity in this demo environment, I'll use raw values for now but recommend hashing.
-- Actually, let's use a clear insert and handle hashing in PHP if needed, but for the script to be runnable:
INSERT IGNORE INTO users (id, username, password, role, full_name)
VALUES (
        'admin-01',
        'admin',
        'admin123',
        'admin',
        'System Administrator'
    ),
    (
        'student-01',
        'student',
        'student123',
        'student',
        'Joshua Student'
    );