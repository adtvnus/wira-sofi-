# 🚨 DATABASE STATIC TABLES ANALYSIS REPORT

## 📊 SUMMARY OF FINDINGS

### ❌ CRITICAL ISSUES FOUND:

1. **MISSING MAIN TABLES**: `bride_groom` table doesn't exist but API endpoints expect it
2. **MULTIPLE STATIC TABLES**: Many tables lack CRUD endpoints
3. **TEST DATA**: Several tables contain placeholder/test data
4. **INCONSISTENT NAMING**: Table names don't match API endpoint expectations

---

## 🔍 DETAILED ANALYSIS

### 🚨 **CRITICAL MISSING TABLE:**
- **`bride_groom`** - API expects this table but it doesn't exist
- **Current tables**: `couple_settings`, `bride_groom_detail_settings`
- **Impact**: Bride-Groom Management page may fail

### 📋 **TABLES WITHOUT CRUD ENDPOINTS:**

| Table Name | Status | Issue | Priority |
|------------|--------|-------|----------|
| `bride_groom_detail_settings` | ❌ No CRUD | Single row config | HIGH |
| `couple_settings` | ❌ No CRUD | Single row config | HIGH |
| `event_settings` | ❌ No CRUD | Single row config | HIGH |
| `gallery_images` | ❌ No CRUD | Contains test data | HIGH |
| `gallery_settings` | ❌ No CRUD | Contains sample data | HIGH |
| `gallery_text_settings` | ❌ No CRUD | Single row config | MEDIUM |
| `story_settings` | ❌ No CRUD | Single row config | MEDIUM |
| `story_timeline_items` | ❌ No CRUD | Multiple rows | MEDIUM |
| `quotes_settings` | ❌ No CRUD | Multiple rows | HIGH |
| `rsvp_settings` | ❌ No CRUD | Empty table | LOW |
| `wedding_guests` | ❌ No CRUD | Contains test data | HIGH |

### 🧪 **TABLES WITH TEST/PLACEHOLDER DATA:**

1. **`gallery_images`**: "Test Large Image", "Test Small Image", "genshin impact"
2. **`gallery_settings`**: "sample-L-1.jpg", "sample-S-1.jpg" 
3. **`thanks_settings`**: "Thank You Tests", "Test Groom & Test Bride"
4. **`wedding_guests`**: "Test Guest 1749385156097", "API Test Guest"

### ✅ **TABLES WITH PROPER CRUD:**

1. **`invited_settings`** - ✅ Has CRUD endpoints
2. **`thanks_settings`** - ✅ Has CRUD endpoints  
3. **`wedding_settings`** - ✅ Has CRUD endpoints

---

## 🔧 RECOMMENDED SOLUTIONS

### 1. **FIX TABLE NAMING MISMATCH**

**Problem**: API expects `bride_groom` but table is `couple_settings`

**Solution A - Rename Table** (Recommended):
```sql
RENAME TABLE couple_settings TO bride_groom;
```

**Solution B - Update API endpoints** to use `couple_settings`

### 2. **ADD MISSING CRUD ENDPOINTS**

**High Priority Tables** (need immediate CRUD):
- `bride_groom_detail_settings` → `/api/bride-groom-detail`
- `gallery_images` → `/api/gallery`
- `quotes_settings` → `/api/quotes`
- `wedding_guests` → `/api/guests`

### 3. **CLEAN TEST DATA**

**Replace test data with proper defaults**:
- Remove "Test" prefixed entries
- Replace sample images with proper placeholders
- Update placeholder text to production-ready content

### 4. **STANDARDIZE SINGLE-ROW TABLES**

**Configuration tables** that should have CRUD for editing:
- `event_settings`
- `gallery_text_settings` 
- `story_settings`

---

## 🎯 IMMEDIATE ACTION ITEMS

### **PHASE 1 - CRITICAL FIXES** (Do First):

1. **Fix bride_groom table mismatch**:
   ```sql
   RENAME TABLE couple_settings TO bride_groom;
   ```

2. **Add missing CRUD for bride_groom_detail**:
   - Table exists: `bride_groom_detail_settings`
   - API expects: `/api/bride-groom-detail`
   - Action: Verify API endpoints match table name

### **PHASE 2 - ADD MISSING CRUD** (Next):

1. **Gallery Management**:
   - `gallery_images` → Full CRUD
   - `gallery_settings` → Full CRUD
   - `gallery_text_settings` → Settings CRUD

2. **Quotes Management**:
   - `quotes_settings` → Full CRUD

3. **Guest Management**:
   - `wedding_guests` → Full CRUD (rename from guests)

### **PHASE 3 - CLEAN DATA** (Final):

1. **Remove test data** from all tables
2. **Add proper default data** for production
3. **Standardize naming conventions**

---

## 🚀 IMPLEMENTATION PRIORITY

### **🔥 URGENT** (Fix Today):
- [ ] Fix `bride_groom` table name mismatch
- [ ] Verify `bride_groom_detail_settings` API mapping

### **⚡ HIGH** (Fix This Week):
- [ ] Add CRUD for `gallery_images`
- [ ] Add CRUD for `quotes_settings` 
- [ ] Add CRUD for `wedding_guests`
- [ ] Clean test data

### **📋 MEDIUM** (Fix Next Week):
- [ ] Add CRUD for configuration tables
- [ ] Standardize table naming
- [ ] Add proper default data

---

## 💡 NOTES

1. **Current Working**: `invited_settings`, `thanks_settings`, `wedding_settings` have proper CRUD
2. **Main Issue**: Table naming inconsistency between database and API expectations
3. **Data Quality**: Many tables contain test/placeholder data that should be cleaned
4. **Missing Features**: Several admin pages may not work due to missing CRUD endpoints

**Next Step**: Start with Phase 1 critical fixes to ensure basic functionality works.
