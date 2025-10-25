import crypto from 'crypto';

const base64UrlEncode = (buffer) =>
  buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export const generateCodeVerifier = (length = 64) => {
  const bytes = crypto.randomBytes(length);
  return base64UrlEncode(bytes);
};

export const generateCodeChallenge = (verifier) => {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64UrlEncode(hash);
};

export const generateRandomState = (length = 32) => {
  const bytes = crypto.randomBytes(length);
  return base64UrlEncode(bytes);
};

export const generatePkcePair = () => {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  return { verifier, challenge };
};

export default {
  generateCodeVerifier,
  generateCodeChallenge,
  generateRandomState,
  generatePkcePair
};
