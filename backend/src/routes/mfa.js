import express from 'express';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enable MFA: generates secret and returns QR and secret (user must verify)
router.post('/enable', protect, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const secret = speakeasy.generateSecret({ length: 20, name: `TryMe (${req.user.email})` });
    // store secret but keep mfaEnabled false until verification
    await User.findByIdAndUpdate(userId, {
      mfaEnabled: false,
      mfaSecret: secret.base32,
    });

    const otpAuthUrl = secret.otpauth_url;
    qrcode.toDataURL(otpAuthUrl, (err, dataUrl) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error generating QR code' });
      }
      return res.json({ qrCode: dataUrl, secret: secret.base32 });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Verify MFA token and enable MFA for user
router.post('/verify', protect, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });

    const user = await User.findById(userId);
    if (!user || !user.mfaSecret) return res.status(404).json({ message: 'MFA not initialized' });

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) return res.status(400).json({ message: 'Invalid token' });

    user.mfaEnabled = true;
    await user.save();
    return res.json({ ok: true, mfaEnabled: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
