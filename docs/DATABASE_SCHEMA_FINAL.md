# 🗄️ Wedding Invitation Database Schema (Final Clean Version)

## 📊 **Database Overview**

**Database Name**: `wedding_invitation`  
**Total Tables**: 16  
**Character Set**: `utf8mb4`  
**Collation**: `utf8mb4_unicode_ci`

## 🎯 **Schema Design Principles**

1. **Single Source of Truth** - No duplicate data across tables
2. **Relational Integrity** - Proper foreign key constraints
3. **Admin Page Mapping** - Each table corresponds to admin functionality
4. **Optimized Performance** - Indexed columns for fast queries
5. **Audit Trail** - Activity logging for all changes

## 📋 **Table Structure by Category**

### **🔐 1. AUTHENTICATION & SECURITY**

#### **admin_users** (1 row)
```sql
- id (PK, AUTO_INCREMENT)
- username (UNIQUE, VARCHAR(50))
- email (UNIQUE, VARCHAR(100))
- password_hash (VARCHAR(255))
- full_name (VARCHAR(100))
- role (ENUM: super_admin, admin, editor)
- is_active (BOOLEAN)
- last_login (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: Login, Authentication

#### **user_sessions** (10 rows)
```sql
- id (PK, AUTO_INCREMENT)
- user_id (FK → admin_users.id)
- session_token (UNIQUE, VARCHAR(255))
- expires_at (TIMESTAMP, INDEXED)
- ip_address (VARCHAR(45))
- user_agent (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```
**Used by**: Session management

#### **activity_logs** (0 rows)
```sql
- id (PK, AUTO_INCREMENT)
- user_id (FK → admin_users.id)
- action (VARCHAR(50))
- table_name (VARCHAR(50))
- record_id (INT)
- old_values, new_values (LONGTEXT)
- ip_address (VARCHAR(45))
- user_agent (TEXT)
- created_at (TIMESTAMP)
```
**Used by**: Audit trail

### **💒 2. CORE WEDDING DATA**

#### **wedding_settings** (2 rows)
```sql
- id (PK, AUTO_INCREMENT)
- couple_id (FK → couple_settings.id)
- wedding_title, wedding_subtitle (VARCHAR)
- wedding_date (DATE, INDEXED)
- wedding_time (TIME)
- wedding_venue (VARCHAR(200))
- wedding_address (TEXT)
- wedding_maps_url (TEXT)
- reception_date, reception_time (DATE, TIME)
- reception_venue, reception_address (VARCHAR, TEXT)
- reception_maps_url (TEXT)
- is_active (BOOLEAN, INDEXED)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: WeddingSettings, Dashboard

#### **couple_settings** (1 row)
```sql
- id (PK, AUTO_INCREMENT)
- wedding_id (FK → wedding_settings.id)
- groom_first_name, groom_last_name (VARCHAR(50))
- groom_full_name (VARCHAR(100))
- groom_parent_names (VARCHAR(200))
- groom_photo (VARCHAR(255))
- bride_first_name, bride_last_name (VARCHAR(50))
- bride_full_name (VARCHAR(100))
- bride_parent_names (VARCHAR(200))
- bride_photo (VARCHAR(255))
- is_active (BOOLEAN)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: BrideGroomManagement

#### **wedding_guests** (3 rows)
```sql
- id (PK, AUTO_INCREMENT)
- wedding_id (FK → wedding_settings.id)
- guest_name (VARCHAR(100), INDEXED)
- guest_email (VARCHAR(100))
- guest_phone (VARCHAR(20))
- invitation_code (UNIQUE, VARCHAR(20))
- guest_count (INT)
- rsvp_status (ENUM: pending, attending, not_attending, INDEXED)
- rsvp_message (TEXT)
- rsvp_submitted_at (TIMESTAMP)
- is_active (BOOLEAN)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: GuestManagement

### **📝 3. CONTENT MANAGEMENT**

#### **quotes_settings** (1 row)
```sql
- id (PK, AUTO_INCREMENT)
- wedding_id (FK → wedding_settings.id)
- header_title (VARCHAR(100))
- header_subtitle (TEXT)
- bottom_message (TEXT)
- quotes_image (VARCHAR(255))
- is_active (BOOLEAN)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: QuotesManagement

#### **story_settings** (1 row)
```sql
- id (PK, AUTO_INCREMENT)
- wedding_id (FK → wedding_settings.id)
- header_title (VARCHAR(100))
- header_subtitle (TEXT)
- is_active (BOOLEAN)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: StoryManagement

#### **story_timeline_items** (4 rows)
```sql
- id (PK, AUTO_INCREMENT)
- wedding_id (FK → wedding_settings.id)
- year (VARCHAR(10))
- title (VARCHAR(100))
- date (VARCHAR(100))
- description (TEXT)
- icon (VARCHAR(10))
- color, bg_color (VARCHAR(100))
- display_order (INT)
- is_active (BOOLEAN)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: StoryManagement

#### **gallery_settings** (0 rows)
```sql
- id (PK, AUTO_INCREMENT)
- wedding_id (FK → wedding_settings.id)
- header_title (VARCHAR(100))
- header_subtitle (TEXT)
- bottom_quote (TEXT)
- is_active (BOOLEAN)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: GalleryManagement

#### **gallery_images** (0 rows)
```sql
- id (PK, AUTO_INCREMENT)
- wedding_id (FK → wedding_settings.id)
- image_src (VARCHAR(255))
- image_alt (VARCHAR(200))
- image_type (ENUM: landscape, square, portrait)
- display_order (INT)
- is_active (BOOLEAN)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: GalleryManagement

### **📄 4. PAGE SETTINGS**

#### **invited_settings** (0 rows)
```sql
- id (PK, AUTO_INCREMENT)
- wedding_id (FK → wedding_settings.id)
- header_title, header_subtitle (VARCHAR, TEXT)
- event_title, event_name (VARCHAR(100))
- event_date, event_time (VARCHAR)
- venue_name (VARCHAR(200))
- venue_address (TEXT)
- google_maps_url (TEXT)
- save_the_date_title (VARCHAR(100))
- save_the_date_message (TEXT)
- is_enabled (BOOLEAN)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: InvitedManagement

#### **rsvp_settings** (0 rows)
```sql
- id (PK, AUTO_INCREMENT)
- wedding_id (FK → wedding_settings.id)
- header_title, header_subtitle (VARCHAR, TEXT)
- description (TEXT)
- deadline_date (VARCHAR(100))
- contact_phone (VARCHAR(20))
- contact_email (VARCHAR(100))
- ceremony_time, reception_time (VARCHAR(100))
- is_enabled (BOOLEAN)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: RsvpManagement

#### **thanks_settings** (0 rows)
```sql
- id (PK, AUTO_INCREMENT)
- wedding_id (FK → wedding_settings.id)
- header_title, header_subtitle (VARCHAR)
- main_message, sub_message (TEXT)
- couple_names (VARCHAR(100))
- blessing_quote_arabic, blessing_quote_translation (TEXT)
- background_image (VARCHAR(255))
- show_social_media (BOOLEAN)
- instagram, facebook, twitter (VARCHAR(100))
- contact_phone, contact_email (VARCHAR)
- contact_address (TEXT)
- is_enabled (BOOLEAN)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: ThanksManagement

### **🎨 5. DETAILED SETTINGS**

#### **bride_groom_detail_settings** (1 row)
```sql
- id (PK, AUTO_INCREMENT)
- wedding_id (FK → wedding_settings.id)
- bride_header_title, bride_header_subtitle (VARCHAR, TEXT)
- bride_label, bride_parent_label (VARCHAR(100))
- bride_father_name, bride_mother_name (VARCHAR(100))
- bride_quote (TEXT)
- bride_photo (VARCHAR(255))
- groom_header_title, groom_header_subtitle (VARCHAR, TEXT)
- groom_label, groom_parent_label (VARCHAR(100))
- groom_father_name, groom_mother_name (VARCHAR(100))
- groom_quote (TEXT)
- groom_photo (VARCHAR(255))
- is_active (BOOLEAN)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: BrideGroomManagement

#### **event_settings** (1 row)
```sql
- id (PK, AUTO_INCREMENT)
- wedding_id (FK → wedding_settings.id)
- event_name (VARCHAR(100))
- event_date, event_time (VARCHAR)
- venue_name (VARCHAR(200))
- venue_address (TEXT)
- map_url (TEXT)
- display_order (INT)
- is_active (BOOLEAN)
- created_by (FK → admin_users.id)
- created_at, updated_at (TIMESTAMP)
```
**Used by**: WeddingSettings

## 🔗 **Foreign Key Relationships**

```
admin_users (1) ←→ (N) user_sessions
admin_users (1) ←→ (N) activity_logs
admin_users (1) ←→ (N) wedding_settings
admin_users (1) ←→ (N) [all content tables]

wedding_settings (1) ←→ (N) couple_settings
wedding_settings (1) ←→ (N) wedding_guests
wedding_settings (1) ←→ (N) [all content tables]
```

## ✅ **Cleanup Summary**

### **Removed Tables:**
- ❌ `bride_groom_settings` (duplicate of couple_settings)
- ❌ `wedding_quotes` (duplicate of quotes_settings)
- ❌ `wedding_stories` (duplicate of story_settings)
- ❌ `wedding_settings_backup` (migration backup)

### **Removed Views:**
- ❌ `v_active_guests` (invalid references)
- ❌ `v_wedding_settings_with_couple` (invalid references)

### **Fixed:**
- ✅ All foreign keys point to correct tables
- ✅ Cascade delete/update configured
- ✅ Referential integrity maintained
- ✅ All tables optimized

## 🎯 **Admin Page Mapping**

| Admin Page | Primary Tables | Secondary Tables |
|------------|---------------|------------------|
| Dashboard | wedding_settings | couple_settings, wedding_guests |
| GuestManagement | wedding_guests | wedding_settings |
| InvitedManagement | invited_settings | wedding_settings |
| RsvpManagement | rsvp_settings | wedding_settings |
| ThanksManagement | thanks_settings | couple_settings |
| QuotesManagement | quotes_settings | wedding_settings |
| BrideGroomManagement | couple_settings, bride_groom_detail_settings | wedding_settings |
| StoryManagement | story_settings, story_timeline_items | wedding_settings |
| GalleryManagement | gallery_settings, gallery_images | wedding_settings |
| WeddingSettings | wedding_settings, event_settings | couple_settings |

## 🚀 **Performance Optimizations**

- ✅ Indexed foreign keys
- ✅ Indexed frequently queried columns
- ✅ Optimized table structure
- ✅ Removed duplicate data
- ✅ Proper data types for storage efficiency

---

**Database Schema Version**: Final Clean v1.0  
**Last Updated**: 2025-01-09  
**Total Tables**: 16  
**Status**: ✅ Production Ready
