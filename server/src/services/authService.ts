import bcrypt from 'bcryptjs';
import { appStore } from './appStore.js';

export async function registerUser(email: string, password: string, name?: string) {
  if (await appStore.findUserByEmail(email)) throw new Error('Email is already registered');
  const passwordHash = await bcrypt.hash(password, 12);
  return appStore.createUser(email, passwordHash, name);
}
export async function loginUser(email: string, password: string) {
  const user = await appStore.findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new Error('Invalid email or password');
  return user;
}
export function publicUser(user: { passwordHash?: string } & any) { const { passwordHash: _passwordHash, ...safe } = user; return safe; }
