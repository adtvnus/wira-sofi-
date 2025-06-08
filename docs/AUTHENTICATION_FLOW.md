# 🔐 Authentication Flow - Wedding Invitation System

## 📋 **OVERVIEW**

Wedding Invitation System menggunakan **mandatory login flow** untuk semua halaman admin dashboard. User **HARUS** login terlebih dahulu sebelum dapat mengakses fitur admin.

---

## 🛡️ **AUTHENTICATION ARCHITECTURE**

### **1. Protected Routes (Require Login):**
```
✅ /admin                    → Dashboard
✅ /admin/dashboard          → Dashboard  
✅ /admin/guest-management   → Guest Management
✅ /admin/wedding-settings   → Wedding Settings
✅ /admin/quotes-management  → Quotes Management
✅ /admin/bride-groom-management → Bride/Groom Management
✅ /admin/story-management   → Story Management
✅ /admin/gallery-management → Gallery Management
✅ /admin/rsvp-management    → RSVP Management
✅ /admin/thanks-management  → Thanks Management
✅ /admin/invited-management → Invited Management
```

### **2. Public Routes (No Login Required):**
```
🔓 /                         → Wedding Homepage
🔓 /main/{guest-name}        → Personal Invitation
🔓 /rsvp/{guest-name}        → RSVP Form
🔓 /thanks/{guest-name}      → Thanks Page
🔓 /admin/portal             → Admin Portal (Landing)
🔓 /admin/login              → Login Form
```

---

## 🔄 **AUTHENTICATION FLOW**

### **Step 1: Access Protected Route**
```
User tries to access: /admin/guest-management
↓
withAuth HOC checks: isAuthenticated?
↓
If NOT authenticated → Show LoginRequired component
If authenticated → Show requested component
```

### **Step 2: LoginRequired Component**
```
LoginRequired component displays:
✅ Beautiful "Access Denied" page
✅ Clear message about login requirement
✅ Auto-redirect countdown (5 seconds)
✅ Manual "GO TO LOGIN PAGE" button
✅ Quick credentials display
✅ Back to Admin Portal option
```

### **Step 3: Login Process**
```
User clicks "GO TO LOGIN PAGE" or waits for auto-redirect
↓
Redirected to: /admin/login
↓
User enters credentials (admin/admin)
↓
AuthContext.login() called
↓
JWT token stored in localStorage
↓
User state updated
↓
Redirect to originally requested page or dashboard
```

### **Step 4: Authenticated Access**
```
User now has valid token
↓
All protected routes accessible
↓
withAuth HOC allows access
↓
User can navigate freely in admin area
```

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **1. AuthContext Provider:**
```typescript
// Provides authentication state globally
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // isAuthenticated = !!user && !!token
  const isAuthenticated = !!user && !!token;
}
```

### **2. withAuth Higher-Order Component:**
```typescript
export const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) return <LoadingSpinner />;
    if (!isAuthenticated) return <LoginRequired />;
    return <Component {...props} />;
  };
};
```

### **3. Route Protection:**
```typescript
// All admin routes use withAuth
const adminRoutes = [
  { path: "/admin", component: withAuth(Dashboard) },
  { path: "/admin/guest-management", component: withAuth(GuestManagement) },
  // ... other protected routes
];
```

---

## 🎯 **LOGIN CREDENTIALS**

### **Default Admin Accounts:**
```
┌─────────────────────────────────────────────────────────┐
│                    LOGIN CREDENTIALS                    │
├─────────────────────────────────────────────────────────┤
│ Username: admin     | Password: admin     | Super Admin │
│ Username: wira      | Password: wira123   | Admin       │
│ Username: sofi      | Password: sofi123   | Admin       │
│ Username: demo      | Password: 123       | Demo User   │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 **TESTING AUTHENTICATION FLOW**

### **Test 1: Unauthorized Access**
1. **Clear browser storage** (or use incognito)
2. **Direct access**: http://localhost:5173/admin
3. **Expected**: LoginRequired page with countdown
4. **Action**: Wait 5 seconds or click "GO TO LOGIN PAGE"
5. **Expected**: Redirect to /admin/login

### **Test 2: Login Process**
1. **Access**: http://localhost:5173/admin/login
2. **Enter**: admin / admin
3. **Click**: Login button
4. **Expected**: Redirect to dashboard
5. **Verify**: Can access all admin routes

### **Test 3: Session Persistence**
1. **Login** successfully
2. **Refresh** browser
3. **Expected**: Still logged in
4. **Access**: Any protected route
5. **Expected**: Direct access without login

### **Test 4: Logout Process**
1. **Click**: Logout button (in admin layout)
2. **Expected**: Redirect to login page
3. **Try access**: Any protected route
4. **Expected**: LoginRequired page again

---

## 🛠️ **AUTHENTICATION TOOLS**

### **Clear Authentication Tool:**
```
File: tools/clear-auth.html
Purpose: Clear all authentication data for testing
Usage: Open in browser, click "Clear Authentication"
```

### **Test Authentication Flow:**
```bash
# Run authentication flow test
node tools/test-auth-flow.cjs
```

---

## 🔒 **SECURITY FEATURES**

### **1. JWT Token Management:**
- ✅ Secure token storage in localStorage
- ✅ Token expiration handling
- ✅ Automatic token verification
- ✅ Session cleanup on logout

### **2. Route Protection:**
- ✅ All admin routes protected by withAuth HOC
- ✅ Automatic redirect to login for unauthorized access
- ✅ Graceful loading states during auth check
- ✅ Clear error messages for access denied

### **3. User Experience:**
- ✅ Beautiful LoginRequired page with countdown
- ✅ Quick access to login credentials
- ✅ Smooth redirect flow
- ✅ Persistent login state across browser refresh

---

## 📋 **AUTHENTICATION CHECKLIST**

### **✅ Implementation Status:**
- ✅ AuthContext provider configured
- ✅ withAuth HOC protecting all admin routes
- ✅ LoginRequired component with auto-redirect
- ✅ JWT token management
- ✅ Login/logout functionality
- ✅ Session persistence
- ✅ Beautiful UI for access denied
- ✅ Clear user feedback
- ✅ Testing tools available

### **✅ User Flow:**
- ✅ Unauthorized access → LoginRequired page
- ✅ Auto-redirect to login (5 seconds)
- ✅ Manual redirect button available
- ✅ Login form with validation
- ✅ Successful login → Dashboard access
- ✅ Protected routes accessible after login
- ✅ Logout → Clear session & redirect

---

## 🎉 **CONCLUSION**

**Authentication flow sudah fully implemented dan mandatory!**

### **Key Points:**
1. **🔒 MANDATORY LOGIN**: Semua admin routes require authentication
2. **🎨 BEAUTIFUL UX**: LoginRequired page dengan countdown dan clear messaging
3. **🔄 SMOOTH FLOW**: Auto-redirect dan manual options
4. **🛡️ SECURE**: JWT token management dan proper session handling
5. **🧪 TESTABLE**: Tools tersedia untuk testing authentication flow

**User HARUS login sebelum dapat mengakses dashboard atau fitur admin apapun!** ✅
