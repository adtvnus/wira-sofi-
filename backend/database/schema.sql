-- Wedding Invitation Database Schema with Authentication
-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS wedding_invitation;
CREATE DATABASE wedding_invitation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wedding_invitation;

-- 1. Admin Users Table (for authentication)
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'editor') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Wedding Settings Table
CREATE TABLE wedding_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    groom_full_name VARCHAR(100) NOT NULL,
    groom_first_name VARCHAR(50) NOT NULL,
    groom_parents VARCHAR(200),
    bride_full_name VARCHAR(100) NOT NULL,
    bride_first_name VARCHAR(50) NOT NULL,
    bride_parents VARCHAR(200),
    wedding_date DATE NOT NULL,
    wedding_time TIME NOT NULL,
    wedding_venue VARCHAR(200) NOT NULL,
    wedding_address TEXT NOT NULL,
    reception_date DATE,
    reception_time TIME,
    reception_venue VARCHAR(200),
    reception_address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- 3. Wedding Guests Table
CREATE TABLE wedding_guests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wedding_id INT NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(100),
    guest_phone VARCHAR(20),
    invitation_code VARCHAR(20) UNIQUE NOT NULL,
    guest_count INT DEFAULT 1,
    rsvp_status ENUM('pending', 'attending', 'not_attending') DEFAULT 'pending',
    rsvp_message TEXT,
    rsvp_submitted_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
    FOREIGN KEY (created_by) REFERENCES admin_users(id),
    INDEX idx_guest_name (guest_name),
    INDEX idx_invitation_code (invitation_code),
    INDEX idx_rsvp_status (rsvp_status)
);

-- 4. Wedding Stories Table
CREATE TABLE wedding_stories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wedding_id INT NOT NULL,
    story_title VARCHAR(100) NOT NULL,
    story_content TEXT NOT NULL,
    story_date DATE,
    story_image VARCHAR(255),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- 5. Wedding Quotes Table
CREATE TABLE wedding_quotes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wedding_id INT NOT NULL,
    quote_text TEXT NOT NULL,
    quote_author VARCHAR(100),
    quote_source VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- 6. Wedding Images Table
CREATE TABLE wedding_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wedding_id INT NOT NULL,
    image_type ENUM('gallery', 'groom', 'bride', 'couple', 'venue') NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_caption VARCHAR(200),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- 7. Wedding Events Table (for timeline)
CREATE TABLE wedding_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wedding_id INT NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    event_description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    event_venue VARCHAR(200),
    event_address TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- 8. Activity Logs Table (for audit trail)
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

-- 9. User Sessions Table (for authentication)
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at)
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@wedding.com', '$2b$10$rQZ8kHWKtGkVQhzQzQzQzOzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQz', 'Wedding Admin', 'super_admin');

-- Insert sample wedding settings
INSERT INTO wedding_settings (
    groom_full_name, groom_first_name, groom_parents,
    bride_full_name, bride_first_name, bride_parents,
    wedding_date, wedding_time, wedding_venue, wedding_address,
    created_by
) VALUES (
    'Wira Saputra', 'Wira', 'Bapak Agus Saputra & Ibu Siti Saputra',
    'Sofi Andriani', 'Sofi', 'Bapak Budi Andriani & Ibu Rina Andriani',
    '2024-12-25', '10:00:00', 'Gedung Serbaguna', 'Jl. Merdeka No. 123, Jakarta',
    1
);

-- Insert sample quote
INSERT INTO wedding_quotes (wedding_id, quote_text, quote_author, created_by) VALUES 
(1, 'Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.', 'Unknown', 1);

-- Create indexes for better performance
CREATE INDEX idx_wedding_guests_wedding_id ON wedding_guests(wedding_id);
CREATE INDEX idx_wedding_guests_active ON wedding_guests(is_active);
CREATE INDEX idx_wedding_settings_active ON wedding_settings(is_active);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Create views for easier data access
CREATE VIEW v_active_guests AS
SELECT 
    g.*,
    w.groom_first_name,
    w.bride_first_name,
    w.wedding_date,
    w.wedding_venue
FROM wedding_guests g
JOIN wedding_settings w ON g.wedding_id = w.id
WHERE g.is_active = TRUE AND w.is_active = TRUE;

CREATE VIEW v_rsvp_summary AS
SELECT 
    w.id as wedding_id,
    w.groom_first_name,
    w.bride_first_name,
    COUNT(g.id) as total_guests,
    SUM(CASE WHEN g.rsvp_status = 'attending' THEN g.guest_count ELSE 0 END) as attending_count,
    SUM(CASE WHEN g.rsvp_status = 'not_attending' THEN 1 ELSE 0 END) as not_attending_count,
    SUM(CASE WHEN g.rsvp_status = 'pending' THEN 1 ELSE 0 END) as pending_count
FROM wedding_settings w
LEFT JOIN wedding_guests g ON w.id = g.wedding_id AND g.is_active = TRUE
WHERE w.is_active = TRUE
GROUP BY w.id;

-- Show created tables
SHOW TABLES;
