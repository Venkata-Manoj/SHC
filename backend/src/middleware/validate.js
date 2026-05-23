import { body, validationResult } from 'express-validator';

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
}

function validateRegistrationDomain(value) {
  try {
    const allowed = process.env.ALLOWED_REGISTRATION_DOMAINS;
    if (!allowed) return true;
    const hostname = new URL(value).hostname.replace(/^www\./, '');
    const domains = allowed.split(',').map(d => d.trim().toLowerCase());
    return domains.some(d => hostname === d || hostname.endsWith('.' + d));
  } catch {
    throw new Error('Invalid registration URL');
  }
}

export const validateHackathon = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('registrationLink').isURL().withMessage('Valid registration link required')
    .custom(validateRegistrationDomain),
  body('mode').isIn(['ONLINE', 'OFFLINE', 'HYBRID']).withMessage('Valid mode required'),
  handleValidation,
];

export const validateAuth = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  handleValidation,
];
