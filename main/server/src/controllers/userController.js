const { db, collections } = require('../config/firebase');

class UserController {
  /**
   * Get user profile
   * @desc Retrieves the authenticated user's profile information from database
   * @param {Object} req - Express request object (should contain user info from auth middleware)
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Object} User profile data without sensitive information
   */
  async getProfile(req, res, next) {
    try {
      // TODO: Extract user ID from authenticated request
      // const userId = req.user.userId;

      // TODO: Query database for user document
      // const userDoc = await db.collection(collections.USERS).doc(userId).get();

      // TODO: Check if user exists
      // if (!userDoc.exists) {
      //   return res.status(404).json({
      //     error: 'User not found',
      //     code: 'USER_NOT_FOUND'
      //   });
      // }

      // TODO: Extract user data and remove sensitive information
      // const userData = userDoc.data();
      // const { password, ...userProfile } = userData;

      // TODO: Return user profile
      res.json({
        message: 'Sample response - implement actual profile retrieval',
        user: {
          id: 'sample-user-id',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * @desc Updates user profile information in database
   * @param {Object} req - Express request object with profile data in body
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Object} Updated user profile data
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.userId;

      // Extract profile data from request body
      const { firstName, lastName, bio, avatar } = req.body;

      // Prepare update data with timestamp
      const updateData = {
        updatedAt: new Date().toISOString()
      };
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (bio !== undefined) updateData['profile.bio'] = bio;
      if (avatar !== undefined) updateData['profile.avatar'] = avatar;

      // Update user document in database
      await db.collection(collections.USERS).doc(userId).update(updateData);

      // Fetch and return updated user data (excluding sensitive info)
      const userDoc = await db.collection(collections.USERS).doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      const userData = userDoc.data();
      const { password, ...userProfile } = userData;

      res.json({
        message: 'Profile updated successfully',
        success: true,
        data: {
          user: userProfile
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user dashboard data
   * @desc Retrieves dashboard statistics, recent activity, and user metrics
   * @param {Object} req - Express request object (should contain user info from auth middleware)
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Object} Dashboard data including stats, recent links, and user info
   */
  async getDashboard(req, res, next) {
    try {
      const userId = req.user.userId; // Assumes authentication middleware sets req.user

      // Fetch user document
      const userDoc = await db.collection(collections.USERS).doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      const userData = userDoc.data();

      // Fetch user's recent link checks (last 10)
      const linksSnapshot = await db.collection(collections.LINKS)
        .where('userId', '==', userId)
        .orderBy('checkedAt', 'desc')
        .limit(10)
        .get();

      const recentLinks = linksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate statistics
      const totalLinksChecked = userData.stats?.linksChecked || 0;
      const avgCredibility = recentLinks.length
        ? (recentLinks.reduce((sum, l) => sum + (l.credibilityScore || 0), 0) / recentLinks.length)
        : 0;

      // Weekly statistics for the last 7 days (including today)
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 6);

      // Fetch all links in the last 7 days
      const weekLinksSnapshot = await db.collection(collections.LINKS)
        .where('userId', '==', userId)
        .where('checkedAt', '>=', weekAgo.toISOString())
        .get();

      // Prepare weekly stats structure
      const weeklyStats = {};
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekAgo);
        day.setDate(weekAgo.getDate() + i);
        const key = day.toISOString().slice(0, 10); // YYYY-MM-DD
        weeklyStats[key] = {
          count: 0,
          avgCredibility: 0,
          maliciousCount: 0,
          safeCount: 0,
          percentMalicious: 0,
          percentSafe: 0
        };
      }

      // Aggregate stats per day
      weekLinksSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const dayKey = data.checkedAt?.slice(0, 10);
        if (weeklyStats[dayKey]) {
          weeklyStats[dayKey].count += 1;
          weeklyStats[dayKey].avgCredibility += data.credibilityScore || 0;
          if (data.isMalicious) {
            weeklyStats[dayKey].maliciousCount += 1;
          } else {
            weeklyStats[dayKey].safeCount += 1;
          }
        }
      });

      // Finalize averages and percentages
      Object.keys(weeklyStats).forEach(key => {
        const day = weeklyStats[key];
        if (day.count > 0) {
          day.avgCredibility = +(day.avgCredibility / day.count).toFixed(2);
          day.percentMalicious = +(day.maliciousCount / day.count * 100).toFixed(2);
          day.percentSafe = +(day.safeCount / day.count * 100).toFixed(2);
        } else {
          day.avgCredibility = 0;
          day.percentMalicious = 0;
          day.percentSafe = 0;
        }
      });

      // Login times (assuming lastLoginAt and createdAt are tracked)
      const loginTimes = {
        lastLoginAt: userData.lastLoginAt || null,
        createdAt: userData.createdAt || null
      };

      // Feature usage
      const featureUsage = userData.stats?.featureUsage || {};

      // Settings changes
      const settingsChanges = userData.settingsHistory || [];

      res.json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
          stats: {
            totalLinksChecked,
            avgCredibilityScore: avgCredibility
          },
          weeklyStats,
          loginTimes,
          featureUsage,
          settingsChanges,
          recentLinks
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   * @desc Permanently removes user account and all associated data
   * @param {Object} req - Express request object (should contain user info from auth middleware)
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Object} Confirmation message
   */
  async deleteAccount(req, res, next) {
    try {
      // TODO: Extract user ID from authenticated request
      // const userId = req.user.userId;

      // TODO: Implement confirmation mechanism (e.g., require password or confirmation token)

      // TODO: Delete user's links using batch operation
      // const userLinksQuery = await db.collection(collections.LINKS)
      //   .where('userId', '==', userId)
      //   .get();

      // TODO: Create batch operation for atomic deletion
      // const batch = db.batch();
      // userLinksQuery.docs.forEach(doc => {
      //   batch.delete(doc.ref);
      // });

      // TODO: Add user document to batch deletion
      // batch.delete(db.collection(collections.USERS).doc(userId));

      // TODO: Execute batch operation
      // await batch.commit();

      // TODO: Invalidate user sessions/tokens (if using session-based auth)

      res.json({
        message: 'Sample response - implement actual account deletion',
        note: 'Account deletion would remove all user data permanently'
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
