import test from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken } from '../src/lib/auth/jwt';

test('JWT signing and verification preserves payload', async () => {
  const payload = {
    userId: 42,
    email: 'test@extrack.local',
    name: 'Test User',
  };

  const token = await signToken(payload);
  assert.ok(typeof token === 'string' && token.split('.').length === 3);

  const verified = await verifyToken(token);
  assert.ok(verified !== null);
  assert.equal(verified.userId, payload.userId);
  assert.equal(verified.email, payload.email);
  assert.equal(verified.name, payload.name);
});

test('JWT verification rejects tampered tokens', async () => {
  const token = await signToken({
    userId: 1,
    email: 'admin@extrack.local',
    name: 'Admin',
  });

  const parts = token.split('.');
  // Tamper with payload (middle part)
  const tamperedPayload = Buffer.from(JSON.stringify({ userId: 999, email: 'hacker@evil.com', name: 'Hacker' }))
    .toString('base64url');
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

  const verified = await verifyToken(tamperedToken);
  assert.equal(verified, null, 'Tampered token must return null');
});

test('JWT verification rejects invalid malformed tokens', async () => {
  assert.equal(await verifyToken(''), null);
  assert.equal(await verifyToken('invalid.token'), null);
  assert.equal(await verifyToken('not.a.valid.jwt.token'), null);
});
