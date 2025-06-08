-- Clean Wedding Invitation Database Schema
-- Organized with separate tables for better management

DROP DATABASE IF EXISTS wedding_invitation;
CREATE DATABASE wedding_invitation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wedding_invitation;

-- =====================================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- =====================================================

-- Admin Users Table
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'editor') DEFAULT 'editor',
    avatar_url VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- User Sessions Table
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_token (token_hash),
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at),
    INDEX idx_active (is_active)
);

-- =====================================================
-- 2. WEDDING CONFIGURATION
-- =====================================================

-- Wedding Settings Table (Main Configuration)
CREATE TABLE wedding_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wedding_title VARCHAR(200) DEFAULT 'Wedding Invitation',
    wedding_subtitle VARCHAR(200) NULL,
    
    -- Groom Information
    groom_full_name VARCHAR(100) NOT NULL,
    groom_first_name VARCHAR(50) NOT NULL,
    groom_parents TEXT NULL,
    groom_photo_url VARCHAR(255) NULL,
    
    -- Bride Information  
    bride_full_name VARCHAR(100) NOT NULL,
    bride_first_name VARCHAR(50) NOT NULL,
    bride_parents TEXT NULL,
    bride_photo_url VARCHAR(255) NULL,
    
    -- Wedding Event Details
    wedding_date DATE NOT NULL,
    wedding_time TIME NOT NULL,
    wedding_venue VARCHAR(200) NOT NULL,
    wedding_address TEXT NOT NULL,
    wedding_maps_url TEXT NULL,
    
    -- Reception Details (Optional)
    reception_date DATE NULL,
    reception_time TIME NULL,
    reception_venue VARCHAR(200) NULL,
    reception_address TEXT NULL,
    reception_maps_url TEXT NULL,
    
    -- System Fields
    created_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES admin_users(id),
    INDEX idx_active (is_active),
    INDEX idx_wedding_date (wedding_date)
);

-- Wedding Story Table
CREATE TABLE wedding_stories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wedding_id INT NOT NULL,
    story_title VARCHAR(100) NOT NULL,
    story_content TEXT NOT NULL,
    story_date DATE NULL,
    story_image_url VARCHAR(255) NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES admin_users(id),
    INDEX idx_wedding_id (wedding_id),
    INDEX idx_order (display_order),
    INDEX idx_active (is_active)
);

-- Wedding Quotes Table
CREATE TABLE wedding_quotes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wedding_id INT NOT NULL,
    quote_text TEXT NOT NULL,
    quote_author VARCHAR(100) NULL,
    quote_category ENUM('love', 'marriage', 'blessing', 'general') DEFAULT 'general',
    quote_image_url VARCHAR(255) NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES admin_users(id),
    INDEX idx_wedding_id (wedding_id),
    INDEX idx_category (quote_category),
    INDEX idx_order (display_order),
    INDEX idx_active (is_active)
);

-- =====================================================
-- 3. GUEST MANAGEMENT
-- =====================================================

-- Wedding Guests Table
CREATE TABLE wedding_guests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wedding_id INT NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(100) NULL,
    guest_phone VARCHAR(20) NULL,
    guest_address TEXT NULL,
    invitation_code VARCHAR(20) UNIQUE NOT NULL,
    guest_count INT DEFAULT 1,
    guest_category ENUM('family', 'friend', 'colleague', 'other') DEFAULT 'other',
    
    -- RSVP Information
    rsvp_status ENUM('pending', 'attending', 'not_attending') DEFAULT 'pending',
    rsvp_message TEXT NULL,
    rsvp_date TIMESTAMP NULL,
    attendance_count INT DEFAULT 0,
    
    -- System Fields
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES admin_users(id),
    UNIQUE KEY unique_invitation (invitation_code),
    INDEX idx_wedding_id (wedding_id),
    INDEX idx_guest_name (guest_name),
    INDEX idx_rsvp_status (rsvp_status),
    INDEX idx_category (guest_category),
    INDEX idx_active (is_active)
);

-- =====================================================
-- 4. MEDIA MANAGEMENT
-- =====================================================

-- Wedding Gallery Table
CREATE TABLE wedding_gallery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wedding_id INT NOT NULL,
    image_title VARCHAR(100) NULL,
    image_description TEXT NULL,
    image_url VARCHAR(255) NOT NULL,
    image_thumbnail_url VARCHAR(255) NULL,
    image_category ENUM('couple', 'family', 'friends', 'ceremony', 'reception', 'other') DEFAULT 'other',
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES admin_users(id),
    INDEX idx_wedding_id (wedding_id),
    INDEX idx_category (image_category),
    INDEX idx_order (display_order),
    INDEX idx_featured (is_featured),
    INDEX idx_active (is_active)
);

-- =====================================================
-- 5. SYSTEM LOGGING & MONITORING
-- =====================================================

-- Activity Logs Table
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    action_type ENUM('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'RSVP') NOT NULL,
    table_name VARCHAR(50) NULL,
    record_id INT NULL,
    description TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 6. VIEWS FOR EASY DATA ACCESS
-- =====================================================

-- Active Guests View
CREATE VIEW v_active_guests AS
SELECT 
    g.*,
    w.groom_first_name,
    w.bride_first_name,
    w.wedding_date,
    w.wedding_venue,
    CASE 
        WHEN g.rsvp_status = 'attending' THEN 'Hadir'
        WHEN g.rsvp_status = 'not_attending' THEN 'Tidak Hadir'
        ELSE 'Belum Konfirmasi'
    END as rsvp_status_text
FROM wedding_guests g
JOIN wedding_settings w ON g.wedding_id = w.id
WHERE g.is_active = TRUE AND w.is_active = TRUE;

-- RSVP Summary View
CREATE VIEW v_rsvp_summary AS
SELECT 
    w.id as wedding_id,
    w.groom_first_name,
    w.bride_first_name,
    COUNT(g.id) as total_guests,
    SUM(g.guest_count) as total_invitations,
    COUNT(CASE WHEN g.rsvp_status = 'attending' THEN 1 END) as attending_count,
    COUNT(CASE WHEN g.rsvp_status = 'not_attending' THEN 1 END) as not_attending_count,
    COUNT(CASE WHEN g.rsvp_status = 'pending' THEN 1 END) as pending_count,
    SUM(CASE WHEN g.rsvp_status = 'attending' THEN g.attendance_count ELSE 0 END) as total_attendance
FROM wedding_settings w
LEFT JOIN wedding_guests g ON w.id = g.wedding_id AND g.is_active = TRUE
WHERE w.is_active = TRUE
GROUP BY w.id;

-- =====================================================
-- 7. SAMPLE DATA (MINIMAL)
-- =====================================================

-- Insert default admin user only
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@wedding.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'super_admin');

-- Insert default wedding settings template
INSERT INTO wedding_settings (
    groom_full_name, groom_first_name, groom_parents,
    bride_full_name, bride_first_name, bride_parents,
    wedding_date, wedding_time, wedding_venue, wedding_address,
    created_by
) VALUES (
    'Nama Pengantin Pria', 'Pria', 'Orang Tua Pengantin Pria',
    'Nama Pengantin Wanita', 'Wanita', 'Orang Tua Pengantin Wanita',
    '2024-12-31', '10:00:00', 'Tempat Pernikahan', 'Alamat Lengkap Pernikahan',
    1
);
