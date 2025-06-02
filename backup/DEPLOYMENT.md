# 🚀 FactCheck Deployment Guide

Hướng dẫn chi tiết để deploy FactCheck application lên Firebase.

## 📋 Prerequisites

### 1. Cài đặt Tools
```bash
# Node.js 16+
node --version

# Firebase CLI
npm install -g firebase-tools
firebase --version

# Git
git --version
```

### 2. Firebase Project Setup
1. Tạo Firebase project tại [Firebase Console](https://console.firebase.google.com)
2. Enable các services:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Cloud Functions**
   - **Hosting**
   - **Cloud Storage** (optional)

### 3. Service Account Setup
1. Vào **Project Settings** > **Service Accounts**
2. Click **Generate new private key**
3. Download JSON file và lưu an toàn
4. Cấu hình environment variables

## 🛠️ Environment Configuration

### 1. Server Environment (.env)
```bash
# Copy example file
cp server/.env.example server/.env
```

Cập nhật `server/.env`:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# JWT Secret (generate strong secret)
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Production URLs
FRONTEND_URL=https://your-project.web.app
```

### 2. Firebase Configuration
Cập nhật `.firebaserc`:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

## 🔧 Pre-deployment Setup

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Test Locally
```bash
# Start emulators
firebase emulators:start

# Test in another terminal
npm run dev
```

### 3. Build Client
```bash
npm run build
```

## 🚀 Deployment Steps

### Option 1: Full Deployment (Recommended)
```bash
npm run deploy
```

### Option 2: Step-by-step Deployment

#### 1. Deploy Firestore Rules & Indexes
```bash
firebase deploy --only firestore
```

#### 2. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

#### 3. Deploy Hosting
```bash
firebase deploy --only hosting
```

#### 4. Deploy Data Connect (if using)
```bash
firebase deploy --only dataconnect
```

## 🔍 Post-deployment Verification

### 1. Check Deployment Status
```bash
firebase hosting:channel:list
firebase functions:list
```

### 2. Test Endpoints
```bash
# Health check
curl https://your-project.web.app/health

# Functions health check
curl https://us-central1-your-project.cloudfunctions.net/healthCheck
```

### 3. Monitor Logs
```bash
# Functions logs
firebase functions:log

# Real-time logs
firebase functions:log --follow
```

## 🔐 Security Configuration

### 1. Firestore Security Rules
Rules are automatically deployed from `firestore.rules`. Key points:
- Users can only access their own data
- Server-side operations use Admin SDK
- Proper validation for all operations

### 2. Environment Variables for Functions
```bash
# Set environment variables for functions
firebase functions:config:set \
  email.host="smtp.gmail.com" \
  email.port="587" \
  email.user="your-email@gmail.com" \
  email.pass="your-app-password"

# Deploy to apply changes
firebase deploy --only functions
```

### 3. CORS Configuration
Update `server/src/app.js` for production domains:
```javascript
app.use(cors({
  origin: [
    'https://your-project.web.app',
    'https://your-project.firebaseapp.com'
  ],
  credentials: true
}));
```

## 📊 Monitoring & Maintenance

### 1. Performance Monitoring
- Enable Firebase Performance Monitoring
- Monitor Core Web Vitals
- Track API response times

### 2. Error Tracking
- Check Firebase Console for errors
- Monitor function execution logs
- Set up alerting for critical errors

### 3. Database Monitoring
- Monitor Firestore usage
- Check query performance
- Optimize indexes as needed

## 🔄 CI/CD Setup (Optional)

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm run install:all
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## 🆘 Troubleshooting

### Common Issues

1. **Functions deployment fails**
   ```bash
   # Check Node.js version in functions/package.json
   # Ensure all dependencies are installed
   cd functions && npm install
   ```

2. **Firestore permission denied**
   ```bash
   # Check security rules
   # Verify user authentication
   # Check document ownership
   ```

3. **Email not sending**
   ```bash
   # Verify Gmail App Password
   # Check SMTP settings
   # Review function logs
   ```

4. **CORS errors**
   ```bash
   # Update CORS origins in server config
   # Redeploy functions
   ```

### Useful Commands
```bash
# View project info
firebase projects:list

# Check quotas and usage
firebase projects:info

# Rollback deployment
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:TARGET_CHANNEL_ID

# Delete old function versions
firebase functions:delete FUNCTION_NAME
```

## 📞 Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- Check project README.md for additional information
