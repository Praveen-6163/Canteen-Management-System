import jwt from 'jsonwebtoken';
import https from 'https';

/**
 * Fetches the public certificate mapping from Google's Firebase token signature endpoint
 * @returns {Promise<object>} Map of key IDs to PEM certificates
 */
const getFirebasePublicKeys = () => {
  return new Promise((resolve, reject) => {
    https.get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
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

    // Retrieve active public certificates
    const publicKeys = await getFirebasePublicKeys();
    
    // Choose certificate matching the token key ID
    const certificate = publicKeys[decodedToken.header.kid];
    if (!certificate) {
      throw new Error('No matching public certificate found for key ID');
    }

    // Firebase Project ID configured in process.env.GOOGLE_CLIENT_ID
    const projectId = process.env.GOOGLE_CLIENT_ID || 'canteen-management-syste-b19de';

    // Verify token signatures, expiration, issuer, and audience
    const verifiedPayload = jwt.verify(idToken, certificate, {
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
      algorithms: ['RS256'],
    });

    // Return mapped fields matching the expected controller contract
    return {
      name: verifiedPayload.name,
      email: verifiedPayload.email,
      sub: verifiedPayload.sub,
      picture: verifiedPayload.picture,
    };
  } catch (error) {
    console.error('Firebase Token Verification Failed:', error);
    throw new Error(`Firebase token verification failed: ${error.message}`);
  }
};
