# 🔗 BRIDE & GROOM RELATIONS ANALYSIS

## 📊 **KOMPONEN YANG HARUS TERHUBUNG DENGAN NAMA BRIDE & GROOM:**

### **🎯 FRONTEND COMPONENTS:**

1. **✅ Hero Section** - `src/pages/user/Hero.tsx`
   - Main title: "Wiras & Sofi"
   - Subtitle dengan nama lengkap

2. **✅ Couple Section** - `src/pages/user/Couple.tsx`
   - Individual bride/groom cards
   - Full names dan parent names

3. **❌ Story Management** - `src/pages/admin/StoryManagement.tsx`
   - Timeline items should use dynamic names
   - Story content should reference bride/groom names

4. **❌ Story Display** - `src/pages/user/Story.tsx`
   - Timeline content should show personalized names
   - Story descriptions with couple names

5. **❌ Quotes Management** - `src/pages/admin/QuotesManagement.tsx`
   - Quotes should reference bride/groom names
   - Personalized quote content

6. **❌ Quotes Display** - `src/pages/user/Quotes.tsx`
   - Display quotes with couple names
   - Personalized quote headers

7. **❌ Thanks Management** - `src/pages/admin/ThanksManagement.tsx`
   - Thank you messages with couple names
   - Personalized closing messages

8. **❌ Thanks Display** - `src/pages/user/Thanks.tsx`
   - Thank you content with bride/groom names
   - Personalized gratitude messages

9. **❌ Gallery Management** - `src/pages/admin/GalleryManagement.tsx`
   - Gallery titles with couple names
   - Photo descriptions with names

10. **❌ Gallery Display** - `src/pages/user/Gallery.tsx`
    - Gallery headers with couple names
    - Photo captions with names

11. **❌ RSVP Form** - `src/pages/user/RSVP.tsx`
    - RSVP messages with couple names
    - Personalized invitation text

12. **❌ Invitation Pages** - `src/pages/user/Invitation.tsx`
    - Guest-specific invitations
    - Personalized content with names

### **🗄️ DATABASE TABLES YANG HARUS TERHUBUNG:**

1. **✅ bride_groom** - Source data utama
2. **❌ story_settings** - Story headers dengan nama
3. **❌ story_timeline_items** - Timeline content dengan nama
4. **❌ quotes_settings** - Quote headers dengan nama
5. **❌ gallery** - Gallery titles dengan nama
6. **❌ thanks_settings** - Thank you messages dengan nama
7. **❌ rsvp_settings** - RSVP content dengan nama
8. **❌ invited_settings** - Invitation content dengan nama

### **🔌 API ENDPOINTS YANG PERLU UPDATE:**

1. **✅ /api/wedding-settings** - Already connected
2. **❌ /api/story-settings** - Need bride/groom integration
3. **❌ /api/quotes** - Need bride/groom integration
4. **❌ /api/gallery** - Need bride/groom integration
5. **❌ /api/thanks-settings** - Need bride/groom integration
6. **❌ /api/rsvp-settings** - Need bride/groom integration
7. **❌ /api/invited-settings** - Need bride/groom integration

---

## 🎯 **IMPLEMENTATION PLAN:**

### **PHASE 1: STORY MANAGEMENT INTEGRATION**
- Update story_settings table dengan bride/groom references
- Update StoryManagement.tsx untuk use dynamic names
- Update Story.tsx untuk display personalized content

### **PHASE 2: QUOTES MANAGEMENT INTEGRATION**
- Update quotes_settings table dengan bride/groom references
- Update QuotesManagement.tsx untuk use dynamic names
- Update Quotes.tsx untuk display personalized content

### **PHASE 3: THANKS MANAGEMENT INTEGRATION**
- Update thanks_settings table dengan bride/groom references
- Update ThanksManagement.tsx untuk use dynamic names
- Update Thanks.tsx untuk display personalized content

### **PHASE 4: GALLERY MANAGEMENT INTEGRATION**
- Update gallery table dengan bride/groom references
- Update GalleryManagement.tsx untuk use dynamic names
- Update Gallery.tsx untuk display personalized content

### **PHASE 5: RSVP & INVITATION INTEGRATION**
- Update rsvp_settings table dengan bride/groom references
- Update RSVP.tsx untuk use dynamic names
- Update Invitation.tsx untuk personalized content

---

## 🔧 **TECHNICAL APPROACH:**

### **1. DATABASE SCHEMA UPDATES:**
```sql
-- Add bride/groom reference fields to related tables
ALTER TABLE story_settings ADD COLUMN use_couple_names BOOLEAN DEFAULT TRUE;
ALTER TABLE quotes_settings ADD COLUMN use_couple_names BOOLEAN DEFAULT TRUE;
ALTER TABLE thanks_settings ADD COLUMN use_couple_names BOOLEAN DEFAULT TRUE;
ALTER TABLE gallery ADD COLUMN use_couple_names BOOLEAN DEFAULT TRUE;
```

### **2. API RESPONSE ENHANCEMENT:**
```javascript
// Include bride/groom data in all relevant API responses
const brideGroomData = await getBrideGroomData();
response.data.couple = {
  brideFirstName: brideGroomData.bride_first_name,
  groomFirstName: brideGroomData.groom_first_name,
  brideFullName: brideGroomData.bride_full_name,
  groomFullName: brideGroomData.groom_full_name
};
```

### **3. FRONTEND COMPONENT UPDATES:**
```javascript
// Use dynamic names in all components
const { weddingData } = useWedding();
const { brideFirstName, groomFirstName } = weddingData.couple;

// Replace hardcoded names with dynamic values
<h1>{groomFirstName} & {brideFirstName}</h1>
```

### **4. TEMPLATE SYSTEM:**
```javascript
// Create template replacement system
const replaceTemplateVars = (text, couple) => {
  return text
    .replace(/\{bride_first_name\}/g, couple.brideFirstName)
    .replace(/\{groom_first_name\}/g, couple.groomFirstName)
    .replace(/\{bride_full_name\}/g, couple.brideFullName)
    .replace(/\{groom_full_name\}/g, couple.groomFullName);
};
```

---

## 🎯 **EXPECTED RESULTS:**

### **BEFORE (Static/Hardcoded):**
- Story: "Pertemuan Pertama Kami"
- Quotes: "Kata-kata Indah tentang Cinta"
- Thanks: "Terima kasih atas kehadiran Anda"
- Gallery: "Galeri Foto Pernikahan"

### **AFTER (Dynamic/Personalized):**
- Story: "Pertemuan Pertama Wiras & Sofi"
- Quotes: "Kata-kata Indah untuk Wiras & Sofi"
- Thanks: "Terima kasih dari Wiras & Sofi"
- Gallery: "Galeri Foto Pernikahan Wiras & Sofi"

---

## 🚀 **BENEFITS:**

1. **✅ Personalized Experience** - Semua content menggunakan nama asli
2. **✅ Professional Look** - Konsisten di semua halaman
3. **✅ Easy Management** - Update nama di satu tempat, semua berubah
4. **✅ Dynamic Content** - Content otomatis ter-personalisasi
5. **✅ Better UX** - User experience yang lebih personal

---

## 📋 **IMPLEMENTATION PRIORITY:**

### **HIGH PRIORITY:**
1. **Story Management** - Timeline dengan nama couple
2. **Thanks Management** - Thank you messages personal
3. **Quotes Display** - Quote headers dengan nama

### **MEDIUM PRIORITY:**
4. **Gallery Management** - Gallery titles dengan nama
5. **RSVP Form** - RSVP content personal

### **LOW PRIORITY:**
6. **Invitation Pages** - Guest-specific content
7. **Admin Dashboard** - Statistics dengan nama

**Ready to implement comprehensive bride & groom relations!** 🎊💑✨
