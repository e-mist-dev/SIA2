// controllers/authController.js
const { auth, db } = require('../config/firebase');
const { sendOtpEmail, verifyOtp } = require('../services/otpService');

/**
 * Google sign-in:
 * Frontend sends Firebase ID token after Google sign-in.
 */
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken required' });

    const decoded = await auth.verifyIdToken(idToken);

    // Create / update user doc (optional)
    const userRef = db.collection('users').doc(decoded.uid);
    await userRef.set(
      {
        email: decoded.email,
        name: decoded.name || decoded.displayName || '',
        photoURL: decoded.picture || '',
        provider: 'google',
        updatedAt: new Date(),
      },
      { merge: true }
    );

    const customToken = await auth.createCustomToken(decoded.uid);

    res.json({
      message: 'Google auth success',
      uid: decoded.uid,
      customToken,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Request OTP: send email with code, store in Firestore
 */
exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });

    await sendOtpEmail(email);
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

/**
 * Verify OTP and create/login user in Firebase Auth.
 * Frontend sends email + otp; backend returns custom token.
 */
exports.verifyOtpAuth = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'email and otp required' });
    }

    const result = await verifyOtp(email, otp);

    if (!result.valid) {
      return res.status(400).json({ message: `OTP invalid (${result.reason})` });
    }

    // Get or create user in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email,
          emailVerified: true,
        });
      } else {
        throw err;
      }
    }

    // Optional: store user data in Firestore
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set(
      {
        email: userRecord.email,
        provider: 'otp',
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // Issue custom token for frontend to sign in with Firebase
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.json({
      message: 'OTP verified',
      uid: userRecord.uid,
      customToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};
