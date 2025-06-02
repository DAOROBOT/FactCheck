const { auth, db, collections } = require('../config/firebase-emulator');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);

    // Check if user exists in Firestore
    const userDoc = await db.collection(collections.USERS).doc(decodedToken.uid).get();

    let userData = null;
    if (userDoc.exists) {
      userData = userDoc.data();
    } else {
      // Create user document if it doesn't exist
      userData = {
        email: decodedToken.email,
        firstName: decodedToken.name?.split(' ')[0] || '',
        lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
        isVerified: decodedToken.email_verified,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      await db.collection(collections.USERS).doc(decodedToken.uid).set(userData);
    }

    // Add user info to request
    req.user = {
      userId: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      ...userData
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Token revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    return res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);

    // Check if user exists in Firestore
    const userDoc = await db.collection(collections.USERS).doc(decodedToken.uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      req.user = {
        userId: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        ...userData
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
