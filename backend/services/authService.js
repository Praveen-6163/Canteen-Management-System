import jwt from 'jsonwebtoken';
import https from 'https';

let cachedKeys = null;
let keysExpiry = 0;

/**
 * Fetches the public certificate mapping from Google's Firebase token signature endpoint
 * Caches keys in memory for 1 hour to optimize performance and prevent rate limiting.
 * @returns {Promise<object>} Map of key IDs to PEM certificates
 */
const getFirebasePublicKeys = () => {
  return new Promise((resolve, reject) => {
    if (cachedKeys && Date.now() < keysExpiry) {
      return resolve(cachedKeys);
    }

    https.get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          cachedKeys = parsed;
          keysExpiry = Date.now() + 3600 * 1000; // cache 1 hour
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

/**
 * Verifies a Firebase ID Token (JWT) sent by the frontend
 * @param {string} idToken - The Firebase ID token
 * @returns {Promise<object>} The verified token payload
 */
export const verifyGoogleToken = async (idToken) => {
  try {
    // Decode token to inspect the header and get the Key ID (kid)
    const decodedToken = jwt.decode(idToken, { complete: true });
    if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
      throw new Error('Invalid token structure');
    }

    // Choose certificate matching the token key ID
    let certificate = publicKeys[decodedToken.header.kid];
    if (!certificate) {
      // Force refresh cached keys in case Google rotated public certificates
      cachedKeys = null;
      const refreshedKeys = await getFirebasePublicKeys();
      certificate = refreshedKeys[decodedToken.header.kid];
    }

    if (!certificate) {
      throw new Error('No matching public certificate found for key ID');
    }

    // Firebase Project ID resolution
    let projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes('googleusercontent.com')) {
        projectId = process.env.GOOGLE_CLIENT_ID;
      } else {
        projectId = 'canteen-management-syste-b19de';
      }
    }

    // Verify token signatures, expiration, issuer, and audience
    const verifiedPayload = jwt.verify(idToken, certificate, {
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
      algorithms: ['RS256'],
    });

    // Return mapped fields matching the expected controller contract
    return {
      name: verifiedPayload.name || '',
      email: verifiedPayload.email,
      uid: verifiedPayload.sub,
      photoURL: verifiedPayload.picture || '',
      provider: verifiedPayload.firebase?.sign_in_provider === 'password' ? 'email' : 'google',
    };
  } catch (error) {
    console.error('Firebase Token Verification Failed:', error);
    throw new Error(`Firebase token verification failed: ${error.message}`);
  }
};

