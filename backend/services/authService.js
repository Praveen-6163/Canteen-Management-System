import { OAuth2Client } from 'google-auth-library';

const getClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured in backend .env');
  }
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
};

/**
 * Verifies a Google ID Token (credential) sent by the frontend
 * @param {string} idToken - The Google ID token
 * @returns {Promise<object>} The ticket payload (user details)
 */
export const verifyGoogleToken = async (idToken) => {
  try {
    const client = getClient();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error(`Google token verification failed: ${error.message}`);
  }
};
