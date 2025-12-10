/**
 * Generate a random 32-character string for SESSION_SECRET
 * Run with: npx tsx scripts/generate-session-secret.ts
 */

import crypto from 'crypto';

const secret = crypto.randomBytes(16).toString('hex');
console.log('\n✅ Generated SESSION_SECRET:');
console.log(secret);
console.log('\n📋 Copy this value to Vercel environment variables.\n');

