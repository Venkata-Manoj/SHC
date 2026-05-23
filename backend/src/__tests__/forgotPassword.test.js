import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFindOne = vi.hoisted(() => vi.fn());
const mockSendEmail = vi.hoisted(() => vi.fn().mockResolvedValue({ devMode: true }));

vi.mock('../models/User.js', () => ({
  default: { findOne: mockFindOne },
}));

vi.mock('../services/email.js', () => ({
  sendEmail: mockSendEmail,
}));

describe('forgotPassword — user enumeration prevention (H5)', () => {
  beforeEach(() => {
    mockFindOne.mockReset();
    mockSendEmail.mockReset();
    mockSendEmail.mockResolvedValue({ devMode: true });
  });

  it('returns 400 for missing email', async () => {
    const { forgotPassword } = await import('../controllers/auth.js');
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const res = { status };

    await forgotPassword({ body: {} }, res, () => {});
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'Email is required' });
  });

  it('returns generic message when user not found (no enumeration)', async () => {
    const { forgotPassword } = await import('../controllers/auth.js');
    mockFindOne.mockResolvedValue(null);

    const json = vi.fn();
    const res = { json };

    await forgotPassword({ body: { email: 'nobody@test.com' } }, res, () => {});
    expect(json).toHaveBeenCalledWith({
      message: expect.stringMatching(/If an account exists/i),
    });
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('generates token and sends email when user exists', async () => {
    const { forgotPassword } = await import('../controllers/auth.js');
    const mockUser = {
      email: 'exists@test.com',
      save: vi.fn().mockResolvedValue(true),
      resetPasswordToken: null,
      resetPasswordExpires: null,
    };
    mockFindOne.mockResolvedValue(mockUser);

    const json = vi.fn();
    const res = { json };

    await forgotPassword({ body: { email: 'exists@test.com' } }, res, () => {});

    expect(mockUser.save).toHaveBeenCalled();
    expect(mockUser.resetPasswordToken).toBeTruthy();
    expect(mockUser.resetPasswordExpires).toBeInstanceOf(Date);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'exists@test.com' })
    );
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/If an account exists/i) })
    );
  });

  it('includes resetUrl in devMode', async () => {
    const { forgotPassword } = await import('../controllers/auth.js');
    const mockUser = {
      email: 'dev@test.com',
      save: vi.fn().mockResolvedValue(true),
      resetPasswordToken: null,
      resetPasswordExpires: null,
    };
    mockFindOne.mockResolvedValue(mockUser);

    const json = vi.fn();
    const res = { json };

    await forgotPassword({ body: { email: 'dev@test.com' } }, res, () => {});

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ devMode: true, resetUrl: expect.stringContaining('/reset-password?token=') })
    );
  });

  it('handles database error gracefully', async () => {
    const { forgotPassword } = await import('../controllers/auth.js');
    mockFindOne.mockRejectedValue(new Error('DB down'));

    const next = vi.fn();
    const json = vi.fn();
    await forgotPassword({ body: { email: 'err@test.com' } }, { json }, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
