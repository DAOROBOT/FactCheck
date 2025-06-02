@echo off
echo 🚀 Starting FactCheck deployment...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Firebase CLI is not installed. Please install it first:
    echo npm install -g firebase-tools
    pause
    exit /b 1
)

REM Check if logged in to Firebase
firebase projects:list >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Not logged in to Firebase. Please run:
    echo firebase login
    pause
    exit /b 1
)

REM Check if .env file exists for server
if not exist "server\.env" (
    echo [WARNING] Server .env file not found. Creating from example...
    copy "server\.env.example" "server\.env"
    echo [WARNING] Please update server\.env with your actual configuration
)

REM Install server dependencies
echo [INFO] Installing server dependencies...
cd server
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)
cd ..

REM Install client dependencies
echo [INFO] Installing client dependencies...
cd client
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install client dependencies
    pause
    exit /b 1
)

REM Build client for production
echo [INFO] Building client for production...
npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build client
    pause
    exit /b 1
)
cd ..

REM Install functions dependencies
echo [INFO] Installing functions dependencies...
cd functions
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install functions dependencies
    pause
    exit /b 1
)
cd ..

REM Deploy to Firebase
echo [INFO] Deploying to Firebase...

REM Deploy Firestore rules and indexes
echo [INFO] Deploying Firestore rules and indexes...
firebase deploy --only firestore
if errorlevel 1 (
    echo [ERROR] Failed to deploy Firestore rules
    pause
    exit /b 1
)

REM Deploy Functions
echo [INFO] Deploying Cloud Functions...
firebase deploy --only functions
if errorlevel 1 (
    echo [ERROR] Failed to deploy functions
    pause
    exit /b 1
)

REM Deploy Hosting
echo [INFO] Deploying to Firebase Hosting...
firebase deploy --only hosting
if errorlevel 1 (
    echo [ERROR] Failed to deploy hosting
    pause
    exit /b 1
)

REM Deploy Data Connect (if configured)
if exist "dataconnect" (
    echo [INFO] Deploying Data Connect...
    firebase deploy --only dataconnect
)

echo [SUCCESS] 🎉 Deployment completed successfully!
echo [INFO] Your app should be available at your Firebase Hosting URL

REM Show deployment info
echo [INFO] Getting deployment info...
firebase hosting:channel:list

echo.
echo [SUCCESS] ✅ FactCheck has been deployed successfully!
echo.
echo [INFO] Next steps:
echo 1. Update your environment variables in Firebase Functions config
echo 2. Test all features in the deployed environment
echo 3. Monitor logs: firebase functions:log
echo 4. Check hosting: firebase hosting:channel:list

pause
