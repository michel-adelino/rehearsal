import { jwtVerify } from 'jose';

const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';

// Edge-compatible session verification (no Node.js dependencies)
export async function verifySession(token: string): Promise<{ userId: string } | null> {
  try {
    const secret = new TextEncoder().encode(SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.userId as string };
  } catch (error) {
    return null;
  }
}
