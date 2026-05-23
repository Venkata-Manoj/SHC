import jwt from 'jsonwebtoken';

const PLACEHOLDER_SECRETS = ['dev-secret', 'change-this-to-a-strong-secret'];

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || PLACEHOLDER_SECRETS.includes(secret)) {
    throw new Error(
      'JWT_SECRET is not set or is a known placeholder. Generate a strong random secret (e.g., openssl rand -hex 64) and set it in .env'
    );
  }
  return secret;
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, getJwtSecret());
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
