# ✅ Deployment Checklist - FactCheck với Firebase Auth

## 📋 Pre-Deployment Checklist

### 1. Firebase Project Setup
- [ ] Tạo Firebase project tại [Firebase Console](https://console.firebase.google.com)
- [ ] Enable **Authentication** với Email/Password provider
- [ ] Enable **Firestore Database**
- [ ] Enable **Cloud Functions**
- [ ] Enable **Hosting**
- [ ] Thêm domain production vào **Authorized domains** trong Authentication

### 2. Local Environment
- [ ] Cài đặt Node.js 16+
- [ ] Cài đặt Firebase CLI: `npm install -g firebase-tools`
- [ ] Login Firebase: `firebase login`
- [ ] Verify login: `firebase projects:list`

### 3. Project Configuration
- [ ] Cập nhật `.firebaserc` với project ID
- [ ] Cập nhật `client/src/config/firebase.js` với Firebase config
- [ ] (Tùy chọn) Tạo `server/.env` cho backend sync

### 4. Code Verification
- [ ] Kiểm tra Firebase Auth đã được thống nhất
- [ ] Frontend sử dụng Firebase Auth methods
- [ ] Backend verify Firebase ID tokens
- [ ] API endpoints sử dụng Firebase Auth middleware

## 🚀 Deployment Steps

### 1. Install Dependencies
```bash
npm run install:all
```
- [ ] Server dependencies installed
- [ ] Client dependencies installed (bao gồm Firebase SDK)
- [ ] Functions dependencies installed

### 2. Build & Test
```bash
# Test locally first
firebase emulators:start
# In another terminal
npm run dev
```
- [ ] Emulators start successfully
- [ ] Authentication works in emulator
- [ ] API calls work with Firebase Auth

### 3. Production Build
```bash
npm run build
```
- [ ] Client builds without errors
- [ ] Build includes Firebase configuration

### 4. Deploy
```bash
npm run deploy
# OR
deploy.bat  # Windows
./deploy.sh # Unix/Linux
```
- [ ] Firestore rules deployed
- [ ] Cloud Functions deployed
- [ ] Hosting deployed
- [ ] No deployment errors

## ✅ Post-Deployment Verification

### 1. Basic Checks
- [ ] Website loads at Firebase Hosting URL
- [ ] No console errors in browser
- [ ] Firebase config is correct

### 2. Authentication Testing
- [ ] **Register**: Tạo tài khoản mới
  - [ ] Email verification được gửi
  - [ ] User được tạo trong Firebase Auth
  - [ ] User data được sync vào Firestore (nếu có backend)
  
- [ ] **Login**: Đăng nhập với tài khoản đã tạo
  - [ ] Login thành công
  - [ ] Firebase ID token được lưu
  - [ ] User data được load
  
- [ ] **Logout**: Đăng xuất
  - [ ] User được đăng xuất
  - [ ] Token được xóa
  - [ ] Redirect về login page

- [ ] **Password Reset**: Test forgot password
  - [ ] Email reset được gửi
  - [ ] Reset link hoạt động

### 3. API Testing
- [ ] API calls include Firebase ID token
- [ ] Backend verify tokens successfully
- [ ] Protected routes require authentication
- [ ] User data sync works (nếu có)

### 4. Firebase Console Checks
- [ ] Users xuất hiện trong Authentication tab
- [ ] Firestore có user documents (nếu có backend sync)
- [ ] Functions logs không có errors
- [ ] Hosting shows correct files

## 🔧 Troubleshooting

### Common Issues & Solutions

**1. Authentication không hoạt động:**
- [ ] Kiểm tra Firebase config trong `client/src/config/firebase.js`
- [ ] Kiểm tra Authorized domains trong Firebase Console
- [ ] Kiểm tra browser console cho errors

**2. API calls fail:**
- [ ] Kiểm tra Firebase ID token trong request headers
- [ ] Kiểm tra backend auth middleware
- [ ] Kiểm tra Functions logs: `firebase functions:log`

**3. Deployment errors:**
- [ ] Kiểm tra Firebase CLI login: `firebase login`
- [ ] Kiểm tra project ID trong `.firebaserc`
- [ ] Kiểm tra dependencies: `npm run install:all`

**4. Build errors:**
- [ ] Kiểm tra Node.js version (16+)
- [ ] Clear cache: `npm cache clean --force`
- [ ] Reinstall dependencies

**5. Functions errors:**
- [ ] Kiểm tra Functions logs
- [ ] Verify environment variables
- [ ] Check Firebase Admin SDK setup

## 📊 Monitoring Setup

### 1. Firebase Console Monitoring
- [ ] Setup alerting cho Authentication errors
- [ ] Monitor Firestore usage
- [ ] Monitor Functions execution

### 2. Performance Monitoring
- [ ] Enable Firebase Performance Monitoring
- [ ] Monitor Core Web Vitals
- [ ] Track API response times

### 3. Error Tracking
- [ ] Monitor browser console errors
- [ ] Setup error reporting
- [ ] Monitor Functions error rates

## 🔐 Security Verification

### 1. Authentication Security
- [ ] Email verification required
- [ ] Strong password policies
- [ ] Secure token handling

### 2. API Security
- [ ] All protected routes require authentication
- [ ] Firebase ID tokens properly verified
- [ ] User data access properly restricted

### 3. Firestore Security
- [ ] Security rules deployed
- [ ] Users can only access own data
- [ ] Admin operations use Admin SDK

## 📝 Final Checklist

- [ ] All features work in production
- [ ] Authentication flow is complete
- [ ] API endpoints are secure
- [ ] Performance is acceptable
- [ ] Error monitoring is setup
- [ ] Documentation is updated
- [ ] Team is notified of deployment

## 🎉 Success Criteria

✅ **Deployment is successful when:**
- Website loads without errors
- Users can register/login/logout
- Email verification works
- Password reset works
- API authentication works
- All features function as expected
- No critical errors in logs

---

**Note**: Với Firebase Auth đã được thống nhất, authentication được xử lý hoàn toàn bởi Firebase, đảm bảo tính bảo mật và reliability cao.
