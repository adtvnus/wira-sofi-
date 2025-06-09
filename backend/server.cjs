const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'wedding-invitation-secret-key-2024';

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('   Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Body logging middleware (after body parsing)
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Specific multer configuration for quotes images
const quotesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const quotesPath = path.join(__dirname, '../public/images/quotes');
    if (!fs.existsSync(quotesPath)) {
      fs.mkdirSync(quotesPath, { recursive: true });
    }
    cb(null, quotesPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `quote-${timestamp}${extension}`;
    cb(null, filename);
  }
});

const quotesUpload = multer({
  storage: quotesStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for quotes
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPG, PNG, GIF, WebP)'));
    }
  }
});

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wedding_invitation'
};

async function getConnection() {
  try {
    console.log('🔄 Attempting database connection...');
    console.log('   Config:', { ...dbConfig, password: '***' });
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful');
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error errno:', error.errno);
    console.error('   Error syscall:', error.syscall);
    console.error('   Error address:', error.address);
    console.error('   Error port:', error.port);

    // Return a more user-friendly error
    const friendlyError = new Error(`Database connection failed: ${error.code || error.message}`);
    friendlyError.originalError = error;
    throw friendlyError;
  }
}

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify session in database
    const connection = await getConnection();
    const [sessions] = await connection.query(`
      SELECT s.*, u.username, u.full_name, u.role, u.is_active
      FROM user_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.session_token = ? AND s.expires_at > NOW() AND s.is_active = TRUE AND u.is_active = TRUE
    `, [token]);
    
    await connection.end();

    if (sessions.length === 0) {
      return res.status(403).json({ error: 'Invalid or expired session' });
    }

    req.user = {
      id: sessions[0].user_id,
      username: sessions[0].username,
      fullName: sessions[0].full_name,
      role: sessions[0].role
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Activity logging middleware
const logActivity = async (userId, action, tableName, recordId, oldValues = null, newValues = null, req) => {
  try {
    const connection = await getConnection();
    await connection.query(`
      INSERT INTO activity_logs (user_id, action_type, table_name, record_id, ip_address, user_agent, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      action,
      tableName,
      recordId,
      req?.ip || req?.connection?.remoteAddress || 'unknown',
      req?.get('User-Agent') || null,
      `${action} ${tableName} record ${recordId}`
    ]);
    await connection.end();
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Health check
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({
    status: 'OK',
    message: 'Wedding Invitation API Server with Authentication',
    timestamp: new Date().toISOString(),
    server: 'http://localhost:3001',
    endpoints: {
      login: '/api/auth/login',
      settings: '/api/wedding-settings',
      dashboard: '/api/dashboard/stats'
    }
  });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('❌ Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    console.log('🔌 Connecting to database...');
    const connection = await getConnection();

    // Get user
    console.log('👤 Looking for user:', username);
    const [users] = await connection.query(`
      SELECT id, username, email, password_hash, full_name, role, is_active
      FROM admin_users
      WHERE (username = ? OR email = ?) AND is_active = TRUE
    `, [username, username]);

    console.log('📊 Found users:', users.length);
    if (users.length === 0) {
      console.log('❌ User not found');
      await connection.end();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    console.log('✅ User found:', user.username);

    // Verify password
    console.log('🔐 Verifying password...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('🔐 Password valid:', isValidPassword);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      await connection.end();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await connection.query(`
      INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `, [user.id, token, expiresAt, req.ip, req.get('User-Agent')]);

    // Update last login
    await connection.query(`
      UPDATE admin_users SET last_login = NOW() WHERE id = ?
    `, [user.id]);

    await connection.end();

    // Log activity
    await logActivity(user.id, 'LOGIN', 'admin_users', user.id, null, null, req);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    
    const connection = await getConnection();
    await connection.query(`
      UPDATE user_sessions SET is_active = FALSE WHERE session_token = ?
    `, [token]);
    await connection.end();

    // Log activity
    await logActivity(req.user.id, 'LOGOUT', 'admin_users', req.user.id, null, null, req);

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Wedding Settings endpoints (using relational structure)
app.get('/api/wedding-settings', authenticateToken, async (req, res) => {
  try {
    const connection = await getConnection();

    // Get active wedding settings with couple data using manual JOIN
    const [rows] = await connection.query(`
      SELECT
        ws.id,
        ws.wedding_date,
        ws.wedding_time,
        ws.wedding_venue,
        ws.wedding_address,
        ws.wedding_maps_url,
        ws.reception_date,
        ws.reception_time,
        ws.reception_venue,
        ws.reception_address,
        ws.reception_maps_url,
        ws.is_active,
        ws.created_by,
        ws.created_at,
        ws.updated_at,

        -- Couple data from relational table
        COALESCE(cs.id, 0) as couple_id,
        COALESCE(cs.groom_first_name, 'Pengantin Pria') as groom_first_name,
        COALESCE(cs.groom_last_name, '') as groom_last_name,
        COALESCE(cs.groom_full_name, 'Nama Pengantin Pria') as groom_full_name,
        COALESCE(cs.groom_parent_names, '') as groom_parent_names,
        COALESCE(cs.bride_first_name, 'Pengantin Wanita') as bride_first_name,
        COALESCE(cs.bride_last_name, '') as bride_last_name,
        COALESCE(cs.bride_full_name, 'Nama Pengantin Wanita') as bride_full_name,
        COALESCE(cs.bride_parent_names, '') as bride_parent_names

      FROM wedding_settings ws
      LEFT JOIN couple_settings cs ON ws.couple_id = cs.id AND cs.is_active = TRUE
      WHERE ws.is_active = TRUE
      ORDER BY ws.created_at DESC
      LIMIT 1
    `);

    await connection.end();

    console.log(`📊 Found active wedding setting with couple data:`, rows[0] ? 'Yes' : 'No');
    res.json({ success: true, data: rows[0] || {} });
  } catch (error) {
    console.error('❌ Error fetching wedding settings:', error);
    res.status(500).json({ error: 'Failed to fetch wedding settings' });
  }
});

// Get all wedding settings for CRUD table (using relational structure)
app.get('/api/wedding-settings/all', authenticateToken, async (req, res) => {
  try {
    const connection = await getConnection();

    // Use manual JOIN instead of view (in case view doesn't exist)
    const [rows] = await connection.query(`
      SELECT
        ws.id,
        ws.wedding_date,
        ws.wedding_time,
        ws.wedding_venue,
        ws.wedding_address,
        ws.wedding_maps_url,
        ws.reception_date,
        ws.reception_time,
        ws.reception_venue,
        ws.reception_address,
        ws.reception_maps_url,
        ws.is_active,
        ws.created_by,
        ws.created_at,
        ws.updated_at,

        -- Couple data from relational table
        COALESCE(cs.id, 0) as couple_id,
        COALESCE(cs.groom_first_name, 'Pengantin Pria') as groom_first_name,
        COALESCE(cs.groom_last_name, '') as groom_last_name,
        COALESCE(cs.groom_full_name, 'Nama Pengantin Pria') as groom_full_name,
        COALESCE(cs.groom_parent_names, '') as groom_parent_names,
        COALESCE(cs.groom_photo, 'public/images/BrideGroom/groom.jpg') as groom_photo,
        COALESCE(cs.bride_first_name, 'Pengantin Wanita') as bride_first_name,
        COALESCE(cs.bride_last_name, '') as bride_last_name,
        COALESCE(cs.bride_full_name, 'Nama Pengantin Wanita') as bride_full_name,
        COALESCE(cs.bride_parent_names, '') as bride_parent_names,
        COALESCE(cs.bride_photo, 'public/images/BrideGroom/bride.jpg') as bride_photo,

        -- Admin user info
        COALESCE(au.full_name, 'Admin') as created_by_name

      FROM wedding_settings ws
      LEFT JOIN couple_settings cs ON ws.couple_id = cs.id AND cs.is_active = TRUE
      LEFT JOIN admin_users au ON ws.created_by = au.id
      ORDER BY ws.created_at DESC
    `);

    await connection.end();

    console.log(`📊 Found ${rows.length} wedding settings with couple data`);
    res.json({ success: true, data: { data: rows } });
  } catch (error) {
    console.error('Error fetching all wedding settings:', error);
    res.status(500).json({ error: 'Failed to fetch wedding settings list' });
  }
});

// Set active wedding setting
app.put('/api/wedding-settings/:id/activate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();

    // Deactivate all settings
    await connection.query('UPDATE wedding_settings SET is_active = FALSE');

    // Activate selected setting
    const [result] = await connection.query(`
      UPDATE wedding_settings SET is_active = TRUE WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Wedding setting not found' });
    }

    await connection.end();

    // Log activity
    await logActivity(req.user.id, 'ACTIVATE', 'wedding_settings', id, null, null, req);

    res.json({ success: true, message: 'Wedding setting activated successfully' });
  } catch (error) {
    console.error('Error activating wedding setting:', error);
    res.status(500).json({ error: 'Failed to activate wedding setting' });
  }
});

// Delete wedding setting
app.delete('/api/wedding-settings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();

    // Check if this is the active setting
    const [activeCheck] = await connection.query(`
      SELECT is_active FROM wedding_settings WHERE id = ?
    `, [id]);

    if (activeCheck.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Wedding setting not found' });
    }

    if (activeCheck[0].is_active) {
      await connection.end();
      return res.status(400).json({ error: 'Cannot delete active wedding setting' });
    }

    // Delete the setting
    await connection.query('DELETE FROM wedding_settings WHERE id = ?', [id]);
    await connection.end();

    // Log activity
    await logActivity(req.user.id, 'DELETE', 'wedding_settings', id, null, null, req);

    res.json({ success: true, message: 'Wedding setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting wedding setting:', error);
    res.status(500).json({ error: 'Failed to delete wedding setting' });
  }
});

app.post('/api/wedding-settings', authenticateToken, async (req, res) => {
  try {
    const settingsData = req.body;

    // Validate required fields
    const requiredFields = [
      'weddingDate', 'weddingTime', 'weddingVenue', 'weddingAddress'
    ];

    const missingFields = requiredFields.filter(field =>
      !settingsData[field] || settingsData[field].toString().trim() === ''
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Required fields missing: ${missingFields.join(', ')}`,
        missingFields: missingFields
      });
    }

    const connection = await getConnection();

    // Get or create couple_settings for this wedding
    let coupleId;
    const [existingCouple] = await connection.query(`
      SELECT id FROM couple_settings WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1
    `);

    if (existingCouple.length > 0) {
      coupleId = existingCouple[0].id;
      console.log('🔗 Using existing couple_settings ID:', coupleId);
    } else {
      // Create default couple_settings if none exists
      console.log('➕ Creating default couple_settings...');
      const [coupleResult] = await connection.query(`
        INSERT INTO couple_settings (
          wedding_id, groom_first_name, groom_full_name,
          bride_first_name, bride_full_name, created_by
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [1, 'Pengantin Pria', 'Nama Pengantin Pria', 'Pengantin Wanita', 'Nama Pengantin Wanita', req.user.id]);
      coupleId = coupleResult.insertId;
      console.log('✅ Created couple_settings ID:', coupleId);
    }

    // Get current settings for logging (skip if view doesn't exist)
    let currentSettings = [];
    try {
      const [settings] = await connection.query(`
        SELECT * FROM wedding_settings WHERE is_active = TRUE LIMIT 1
      `);
      currentSettings = settings;
    } catch (error) {
      console.log('⚠️ Could not fetch current settings for logging:', error.message);
    }

    // Deactivate existing settings
    await connection.query('UPDATE wedding_settings SET is_active = FALSE');

    // Insert new settings with couple relation
    const [result] = await connection.query(`
      INSERT INTO wedding_settings (
        couple_id, wedding_date, wedding_time, wedding_venue, wedding_address,
        reception_date, reception_time, reception_venue, reception_address,
        created_by, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `, [
      coupleId,
      settingsData.weddingDate,
      settingsData.weddingTime,
      settingsData.weddingVenue,
      settingsData.weddingAddress,
      settingsData.receptionDate,
      settingsData.receptionTime,
      settingsData.receptionVenue,
      settingsData.receptionAddress,
      req.user.id
    ]);

    await connection.end();

    console.log('✅ Wedding settings created with relational structure');
    console.log('   Wedding ID:', result.insertId);
    console.log('   Couple ID:', coupleId);

    // Log activity
    await logActivity(
      req.user.id,
      'UPDATE',
      'wedding_settings',
      result.insertId,
      currentSettings[0] || null,
      settingsData,
      req
    );

    res.json({ success: true, id: result.insertId, message: 'Wedding settings updated successfully' });
  } catch (error) {
    console.error('Error updating wedding settings:', error);
    res.status(500).json({ error: 'Failed to update wedding settings' });
  }
});

// Guest Management endpoints
app.get('/api/guests', authenticateToken, async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.query(`
      SELECT id, guest_name, guest_email, guest_phone, guest_count,
             rsvp_status, invitation_code, rsvp_message, rsvp_submitted_at,
             created_at, updated_at
      FROM wedding_guests
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `);
    await connection.end();

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
});

app.post('/api/guests', authenticateToken, async (req, res) => {
  console.log('🚀 ADD GUEST FUNCTION STARTED');
  try {
    console.log('🔍 Add Guest Request:');
    console.log('   Body:', req.body);
    console.log('   User:', req.user);

    const { guestName, guestEmail, guestPhone, guestCount } = req.body;

    if (!guestName) {
      console.log('❌ Validation failed: Guest name is required');
      return res.status(400).json({ error: 'Guest name is required' });
    }

    // Generate invitation code
    const invitationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    console.log('✅ Generated invitation code:', invitationCode);

    const connection = await getConnection();
    console.log('✅ Database connection established');

    // Get active wedding ID
    const [weddings] = await connection.query('SELECT id FROM wedding_settings WHERE is_active = TRUE LIMIT 1');
    let weddingId = 1;

    if (weddings.length > 0) {
      weddingId = weddings[0].id;
    }
    console.log('✅ Wedding ID:', weddingId);

    console.log('🔄 Inserting guest into database...');
    const [result] = await connection.query(`
      INSERT INTO wedding_guests (
        wedding_id, guest_name, guest_email, guest_phone,
        invitation_code, guest_count, rsvp_status, created_by, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, TRUE)
    `, [weddingId, guestName, guestEmail, guestPhone, invitationCode, guestCount || 1, req.user.id]);

    console.log('✅ Guest inserted with ID:', result.insertId);

    // Get the inserted guest
    console.log('🔄 Fetching inserted guest data...');
    const [newGuest] = await connection.query(`
      SELECT id, guest_name, guest_email, guest_phone, guest_count,
             rsvp_status, invitation_code, created_at, updated_at
      FROM wedding_guests
      WHERE id = ?
    `, [result.insertId]);

    await connection.end();
    console.log('✅ Database connection closed');

    // Log activity
    console.log('🔄 Logging activity...');
    await logActivity(req.user.id, 'CREATE', 'wedding_guests', result.insertId, null, newGuest[0], req);
    console.log('✅ Activity logged');

    console.log('✅ Returning guest data:', newGuest[0]);
    res.status(201).json({ success: true, data: newGuest[0] });
  } catch (error) {
    console.error('❌ Error adding guest:', error);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to add guest',
      details: error.message
    });
  }
});

app.put('/api/guests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { guestName, guestEmail, guestPhone, guestCount, rsvpStatus } = req.body;

    const connection = await getConnection();

    // Get current guest data for logging
    const [currentGuest] = await connection.query(`
      SELECT * FROM wedding_guests WHERE id = ? AND is_active = TRUE
    `, [id]);

    if (currentGuest.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Guest not found' });
    }

    await connection.query(`
      UPDATE wedding_guests
      SET guest_name = ?, guest_email = ?, guest_phone = ?,
          guest_count = ?, rsvp_status = ?, updated_at = NOW()
      WHERE id = ? AND is_active = TRUE
    `, [guestName, guestEmail, guestPhone, guestCount, rsvpStatus, id]);

    // Get updated guest
    const [updatedGuest] = await connection.query(`
      SELECT id, guest_name, guest_email, guest_phone, guest_count,
             rsvp_status, invitation_code, created_at, updated_at
      FROM wedding_guests
      WHERE id = ?
    `, [id]);

    await connection.end();

    // Log activity
    await logActivity(req.user.id, 'UPDATE', 'wedding_guests', id, currentGuest[0], updatedGuest[0], req);

    res.json({ success: true, data: updatedGuest[0] });
  } catch (error) {
    console.error('Error updating guest:', error);
    res.status(500).json({ error: 'Failed to update guest' });
  }
});

app.delete('/api/guests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await getConnection();

    // Get current guest data for logging
    const [currentGuest] = await connection.query(`
      SELECT * FROM wedding_guests WHERE id = ? AND is_active = TRUE
    `, [id]);

    if (currentGuest.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Guest not found' });
    }

    // Soft delete
    const [result] = await connection.query(`
      UPDATE wedding_guests
      SET is_active = FALSE, updated_at = NOW()
      WHERE id = ?
    `, [id]);

    await connection.end();

    // Log activity
    await logActivity(req.user.id, 'DELETE', 'wedding_guests', id, currentGuest[0], null, req);

    res.json({ success: true, message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Error deleting guest:', error);
    res.status(500).json({ error: 'Failed to delete guest' });
  }
});

// RSVP endpoints
app.post('/api/rsvp', async (req, res) => {
  try {
    const { guestName, guestEmail, guestPhone, attendanceStatus, guestCount, message } = req.body;

    if (!guestName || !attendanceStatus) {
      return res.status(400).json({ error: 'Guest name and attendance status are required' });
    }

    const connection = await getConnection();

    // Find guest by name
    const [existingGuest] = await connection.query(`
      SELECT id FROM wedding_guests
      WHERE guest_name = ? AND is_active = TRUE
    `, [guestName]);

    if (existingGuest.length > 0) {
      // Update existing guest
      await connection.query(`
        UPDATE wedding_guests
        SET rsvp_status = ?, guest_email = COALESCE(?, guest_email),
            guest_phone = COALESCE(?, guest_phone), guest_count = ?,
            rsvp_message = ?, rsvp_submitted_at = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [attendanceStatus, guestEmail, guestPhone, guestCount, message, existingGuest[0].id]);
    }

    await connection.end();

    res.json({ success: true, message: 'RSVP submitted successfully' });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    res.status(500).json({ error: 'Failed to submit RSVP' });
  }
});

app.get('/api/rsvp', authenticateToken, async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.query(`
      SELECT guest_name, guest_email, guest_phone, guest_count,
             rsvp_status, rsvp_message, rsvp_submitted_at, created_at, updated_at
      FROM wedding_guests
      WHERE is_active = TRUE AND rsvp_status != 'pending'
      ORDER BY rsvp_submitted_at DESC
    `);
    await connection.end();

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching RSVP responses:', error);
    res.status(500).json({ error: 'Failed to fetch RSVP responses' });
  }
});

// Wedding Quotes endpoints
app.get('/api/quotes', authenticateToken, async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.query(`
      SELECT q.*, c.groom_first_name, c.bride_first_name
      FROM quotes_settings q
      JOIN wedding_settings w ON q.wedding_id = w.id
      LEFT JOIN couple_settings c ON w.id = c.wedding_id AND c.is_active = TRUE
      WHERE q.is_active = TRUE AND w.is_active = TRUE
      ORDER BY q.created_at DESC
    `);
    await connection.end();

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

app.post('/api/quotes', authenticateToken, async (req, res) => {
  try {
    const { quoteText, quoteAuthor, quoteCategory, displayOrder, quoteImage } = req.body;

    if (!quoteText) {
      return res.status(400).json({ error: 'Quote text is required' });
    }

    const connection = await getConnection();

    // Get active wedding ID
    const [weddings] = await connection.query('SELECT id FROM wedding_settings WHERE is_active = TRUE LIMIT 1');
    let weddingId = 1;

    if (weddings.length > 0) {
      weddingId = weddings[0].id;
    }

    const [result] = await connection.query(`
      INSERT INTO quotes_settings (
        wedding_id, header_title, header_subtitle, bottom_message,
        quotes_image, is_active, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, TRUE, ?, NOW(), NOW())
    `, [weddingId, quoteText, quoteAuthor || '', quoteCategory || '', quoteImage || '', req.user.id]);

    // Get the inserted quote settings
    const [newQuote] = await connection.query(`
      SELECT * FROM quotes_settings WHERE id = ?
    `, [result.insertId]);

    await connection.end();

    // Log activity
    await logActivity(req.user.id, 'CREATE', 'quotes_settings', result.insertId, null, newQuote[0], req);

    res.status(201).json({ success: true, data: newQuote[0] });
  } catch (error) {
    console.error('Error adding quote:', error);
    res.status(500).json({ error: 'Failed to add quote' });
  }
});

app.put('/api/quotes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quoteText, quoteAuthor, quoteCategory, displayOrder, quoteImage, isActive } = req.body;

    const connection = await getConnection();

    // Get current quote data for logging
    const [currentQuote] = await connection.query(`
      SELECT * FROM quotes_settings WHERE id = ? AND is_active = TRUE
    `, [id]);

    if (currentQuote.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Quote settings not found' });
    }

    await connection.query(`
      UPDATE quotes_settings
      SET header_title = ?, header_subtitle = ?, bottom_message = ?,
          quotes_image = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [quoteText, quoteAuthor, quoteCategory, quoteImage, isActive, id]);

    // Get updated quote settings
    const [updatedQuote] = await connection.query(`
      SELECT * FROM quotes_settings WHERE id = ?
    `, [id]);

    await connection.end();

    // Log activity
    await logActivity(req.user.id, 'UPDATE', 'quotes_settings', id, currentQuote[0], updatedQuote[0], req);

    res.json({ success: true, data: updatedQuote[0] });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

app.delete('/api/quotes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await getConnection();

    // Get current quote data for logging
    const [currentQuote] = await connection.query(`
      SELECT * FROM quotes_settings WHERE id = ? AND is_active = TRUE
    `, [id]);

    if (currentQuote.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Quote settings not found' });
    }

    // Soft delete
    await connection.query(`
      UPDATE quotes_settings
      SET is_active = FALSE, updated_at = NOW()
      WHERE id = ?
    `, [id]);

    await connection.end();

    // Log activity
    await logActivity(req.user.id, 'DELETE', 'quotes_settings', id, currentQuote[0], null, req);

    res.json({ success: true, message: 'Quote settings deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

// Quotes Image Upload endpoint
app.post('/api/quotes/upload-image', authenticateToken, (req, res, next) => {
  console.log('🔍 Upload request received:', {
    headers: req.headers,
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    body: req.body
  });
  next();
}, quotesUpload.single('image'), async (req, res) => {
  try {
    console.log('🔍 After multer processing:', {
      file: req.file,
      body: req.body,
      hasFile: !!req.file
    });

    if (!req.file) {
      console.log('❌ No file received in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate the public URL for the uploaded image
    const imageUrl = `/images/quotes/${req.file.filename}`;

    console.log('📁 Quote image uploaded successfully:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      path: req.file.path,
      url: imageUrl
    });

    // Log activity
    await logActivity(req.user.id, 'CREATE', 'quote_image_upload', null, null, { filename: req.file.filename, url: imageUrl }, req);

    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('❌ Error uploading quote image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Thanks Settings endpoints
app.get('/api/thanks-settings', async (req, res) => {
  try {
    console.log('📊 Thanks settings requested');

    const connection = await getConnection();

    // Check if thanks_settings table exists
    const [tableExists] = await connection.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = 'thanks_settings'
    `);

    if (tableExists[0].count === 0) {
      console.log('⚠️ thanks_settings table does not exist, returning default settings');
      await connection.end();

      // Return default settings if table doesn't exist
      const defaultSettings = {
        id: 0,
        headerTitle: 'Thank You',
        headerSubtitle: 'Terima Kasih',
        mainMessage: 'Atas kehadiran, doa, dan restu yang telah diberikan dalam hari bahagia kami, kami mengucapkan terima kasih yang sebesar-besarnya.',
        subMessage: 'Semoga keberkahan dan kebahagiaan senantiasa menyertai kita semua.',
        coupleNames: 'Wira & Sofi',
        blessingQuoteArabic: 'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fi khair',
        blessingQuoteTranslation: 'Semoga Allah memberkati kalian dan menyatukan kalian dalam kebaikan',
        backgroundImage: '',
        showSocialMedia: false,
        socialMediaInstagram: '',
        socialMediaFacebook: '',
        socialMediaTwitter: ''
      };

      return res.json({
        success: true,
        data: defaultSettings
      });
    }

    const [rows] = await connection.query(
      'SELECT * FROM thanks_settings ORDER BY created_at DESC LIMIT 1'
    );

    if (rows.length === 0) {
      // Return default settings if none found
      const defaultSettings = {
        id: 0,
        headerTitle: 'Thank You',
        headerSubtitle: 'Terima Kasih',
        mainMessage: 'Atas kehadiran, doa, dan restu yang telah diberikan dalam hari bahagia kami, kami mengucapkan terima kasih yang sebesar-besarnya.',
        subMessage: 'Semoga keberkahan dan kebahagiaan senantiasa menyertai kita semua.',
        coupleNames: 'Wira & Sofi',
        blessingQuoteArabic: 'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fi khair',
        blessingQuoteTranslation: 'Semoga Allah memberkati kalian dan menyatukan kalian dalam kebaikan',
        backgroundImage: '',
        showSocialMedia: false,
        socialMediaInstagram: '',
        socialMediaFacebook: '',
        socialMediaTwitter: ''
      };

      return res.json({
        success: true,
        data: defaultSettings
      });
    }

    const settings = rows[0];
    const responseData = {
      id: settings.id,
      headerTitle: settings.header_title,
      headerSubtitle: settings.header_subtitle,
      mainMessage: settings.main_message,
      subMessage: settings.sub_message,
      coupleNames: settings.couple_names,
      blessingQuoteArabic: settings.blessing_quote_arabic,
      blessingQuoteTranslation: settings.blessing_quote_translation,
      backgroundImage: settings.background_image,
      showSocialMedia: settings.show_social_media,
      socialMediaInstagram: settings.social_media_instagram,
      socialMediaFacebook: settings.social_media_facebook,
      socialMediaTwitter: settings.social_media_twitter
    };

    console.log('✅ Thanks settings retrieved:', responseData);
    await connection.end();

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error fetching thanks settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch thanks settings'
    });
  }
});

app.put('/api/thanks-settings', authenticateToken, async (req, res) => {
  try {
    console.log('📝 Thanks settings update requested:', req.body);

    const {
      headerTitle,
      headerSubtitle,
      mainMessage,
      subMessage,
      coupleNames,
      blessingQuoteArabic,
      blessingQuoteTranslation,
      backgroundImage,
      showSocialMedia,
      socialMediaInstagram,
      socialMediaFacebook,
      socialMediaTwitter
    } = req.body;

    const connection = await getConnection();

    // Check if thanks_settings table exists
    const [tableExists] = await connection.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = 'thanks_settings'
    `);

    if (tableExists[0].count === 0) {
      console.log('⚠️ thanks_settings table does not exist, cannot save settings');
      await connection.end();
      return res.status(500).json({
        success: false,
        error: 'Thanks settings table not found. Please run database migration.'
      });
    }

    // Check if settings exist
    const [existingRows] = await connection.query(
      'SELECT id FROM thanks_settings LIMIT 1'
    );

    if (existingRows.length > 0) {
      // Update existing settings
      await connection.query(`
        UPDATE thanks_settings SET
          header_title = ?,
          header_subtitle = ?,
          main_message = ?,
          sub_message = ?,
          couple_names = ?,
          blessing_quote_arabic = ?,
          blessing_quote_translation = ?,
          background_image = ?,
          show_social_media = ?,
          social_media_instagram = ?,
          social_media_facebook = ?,
          social_media_twitter = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        headerTitle, headerSubtitle, mainMessage, subMessage, coupleNames,
        blessingQuoteArabic, blessingQuoteTranslation, backgroundImage,
        showSocialMedia, socialMediaInstagram, socialMediaFacebook, socialMediaTwitter,
        existingRows[0].id
      ]);

      console.log('✅ Thanks settings updated successfully');
    } else {
      // Insert new settings
      await connection.query(`
        INSERT INTO thanks_settings (
          header_title, header_subtitle, main_message, sub_message, couple_names,
          blessing_quote_arabic, blessing_quote_translation, background_image,
          show_social_media, social_media_instagram, social_media_facebook, social_media_twitter,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        headerTitle, headerSubtitle, mainMessage, subMessage, coupleNames,
        blessingQuoteArabic, blessingQuoteTranslation, backgroundImage,
        showSocialMedia, socialMediaInstagram, socialMediaFacebook, socialMediaTwitter,
        req.user.userId
      ]);

      console.log('✅ Thanks settings created successfully');
    }

    await connection.end();

    res.json({
      success: true,
      message: 'Thanks settings saved successfully'
    });

  } catch (error) {
    console.error('❌ Error saving thanks settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save thanks settings'
    });
  }
});

// Dashboard statistics
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const connection = await getConnection();

    // Get guest statistics
    const [guestStats] = await connection.query(`
      SELECT
        COUNT(*) as total_guests,
        SUM(CASE WHEN rsvp_status = 'attending' THEN guest_count ELSE 0 END) as attending_count,
        SUM(CASE WHEN rsvp_status = 'not_attending' THEN 1 ELSE 0 END) as not_attending_count,
        SUM(CASE WHEN rsvp_status = 'pending' THEN 1 ELSE 0 END) as pending_count
      FROM wedding_guests
      WHERE is_active = TRUE
    `);

    // Get recent activity
    const [recentActivity] = await connection.query(`
      SELECT a.*, u.full_name as user_name
      FROM activity_logs a
      JOIN admin_users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    await connection.end();

    res.json({
      success: true,
      data: {
        guestStats: guestStats[0],
        recentActivity: recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Bride Groom Management endpoints
app.get('/api/bride-groom', authenticateToken, async (req, res) => {
  try {
    const connection = await getConnection();

    // Get bride groom data from couple_settings table
    const [rows] = await connection.query(`
      SELECT * FROM couple_settings
      WHERE wedding_id = 1 AND is_active = TRUE
      ORDER BY created_at DESC
      LIMIT 1
    `);

    await connection.end();

    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      // Return default structure if no data found
      res.json({
        success: true,
        data: {
          groom_first_name: '',
          groom_last_name: '',
          groom_full_name: '',
          groom_parent_names: '',
          bride_first_name: '',
          bride_last_name: '',
          bride_full_name: '',
          bride_parent_names: ''
        }
      });
    }
  } catch (error) {
    console.error('Error fetching bride groom data:', error);
    res.status(500).json({ error: 'Failed to fetch bride groom data' });
  }
});

app.put('/api/bride-groom/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      groomFirstName, groomLastName, groomFullName, groomParentNames,
      brideFirstName, brideLastName, brideFullName, brideParentNames
    } = req.body;

    console.log('🔍 Bride Groom Update Request:');
    console.log('   ID:', id);
    console.log('   Groom:', { groomFirstName, groomLastName, groomFullName, groomParentNames });
    console.log('   Bride:', { brideFirstName, brideLastName, brideFullName, brideParentNames });
    console.log('   🔐 Token validation passed');

    // Validate required fields
    if (!groomFirstName || !brideFirstName) {
      return res.status(400).json({ error: 'Groom and bride first names are required' });
    }

    const connection = await getConnection();

    // Check if record exists
    const [existing] = await connection.query(`
      SELECT id FROM couple_settings WHERE wedding_id = ? AND is_active = TRUE
    `, [id]);

    if (existing.length > 0) {
      // Update existing record
      console.log('   📝 Updating existing record...');
      await connection.query(`
        UPDATE couple_settings SET
          groom_first_name = ?, groom_last_name = ?, groom_full_name = ?, groom_parent_names = ?,
          bride_first_name = ?, bride_last_name = ?, bride_full_name = ?, bride_parent_names = ?,
          updated_at = NOW()
        WHERE wedding_id = ? AND is_active = TRUE
      `, [
        groomFirstName, groomLastName, groomFullName, groomParentNames,
        brideFirstName, brideLastName, brideFullName, brideParentNames,
        id
      ]);
    } else {
      // Insert new record
      console.log('   ➕ Creating new record...');
      await connection.query(`
        INSERT INTO couple_settings (
          wedding_id, groom_first_name, groom_last_name, groom_full_name, groom_parent_names,
          bride_first_name, bride_last_name, bride_full_name, bride_parent_names,
          groom_photo, bride_photo, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, groomFirstName, groomLastName, groomFullName, groomParentNames,
        brideFirstName, brideLastName, brideFullName, brideParentNames,
        'public/images/BrideGroom/groom.jpg', 'public/images/BrideGroom/bride.jpg', 1
      ]);
    }

    await connection.end();

    console.log('   ✅ Bride groom data saved successfully');
    const response = { success: true, message: 'Bride groom data updated successfully' };
    console.log('   📤 Sending response:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error updating bride groom data:', error);
    console.error('   Error details:', error.message);
    console.error('   Stack trace:', error.stack);
    res.status(500).json({
      error: 'Failed to update bride groom data',
      details: error.message
    });
  }
});

// Global error handler for multer and other errors
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name. Use "image" field.' });
    }
    if (error.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({ error: 'Too many parts in multipart data.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files.' });
    }
    if (error.code === 'LIMIT_FIELD_KEY') {
      return res.status(400).json({ error: 'Field name too long.' });
    }
    if (error.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({ error: 'Field value too long.' });
    }
    if (error.code === 'LIMIT_FIELD_COUNT') {
      return res.status(400).json({ error: 'Too many fields.' });
    }
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  }

  if (error.message && error.message.includes('Only image files are allowed')) {
    return res.status(400).json({ error: error.message });
  }

  // Default error response
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Invitation API Server with Authentication running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Guests API: http://localhost:${PORT}/api/guests`);
  console.log(`📝 RSVP API: http://localhost:${PORT}/api/rsvp`);
  console.log(`⚙️ Settings API: http://localhost:${PORT}/api/wedding-settings`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard/stats`);
  console.log('\n🔐 Default Admin Credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin');
  console.log('\n🔄 Server running with NODEMON - Auto-restart enabled!');
  console.log('💡 Edit any file in backend/ or src/ to see auto-restart in action!');
});
