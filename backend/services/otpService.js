// services/otpService.js
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { db } = require('../config/firebase');

const OTP_COLLECTION = 'otpCodes';
const OTP_EXP_MINUTES = parseInt(process.env.OTP_EXP_MINUTES || '10', 10);
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6', 10);

function generateOtp(length = OTP_LENGTH) {
  let otp = '';
  for (let i = 0; i < length; i += 1) {
    otp += crypto.randomInt(0, 10); // 0–9
  }
  return otp;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,    // your Gmail address
    pass: process.env.GMAIL_PASS,    // app password / OAuth2
  },
});

/**
 * Generate OTP, save to Firestore, and send via Gmail.
 */
async function sendOtpEmail(email) {
  const otp = generateOtp();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXP_MINUTES * 60 * 1000);

  await db.collection(OTP_COLLECTION).doc(email).set({
    email,
    otp,
    createdAt: now,
    expiresAt,
  });

  const mailOptions = {
    from: `"My App" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in ${OTP_EXP_MINUTES} minutes.`,
    html: `<p>Your OTP code is <b>${otp}</b>. It will expire in ${OTP_EXP_MINUTES} minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Verify OTP from Firestore.
 * Returns { valid: boolean, reason?: string }
 */
async function verifyOtp(email, otp) {
  const docRef = db.collection(OTP_COLLECTION).doc(email);
  const snap = await docRef.get();

  if (!snap.exists) {
    return { valid: false, reason: 'not_found' };
  }

  const data = snap.data();
  const now = new Date();

  // Firestore timestamp -> JS Date if needed
  const expiresAt = data.expiresAt.toDate ? data.expiresAt.toDate() : data.expiresAt;

  if (expiresAt < now) {
    await docRef.delete();
    return { valid: false, reason: 'expired' };
  }

  if (data.otp !== otp) {
    return { valid: false, reason: 'mismatch' };
  }

  // Success: delete the OTP so it can't be reused
  await docRef.delete();
  return { valid: true };
}

module.exports = {
  sendOtpEmail,
  verifyOtp,
};
