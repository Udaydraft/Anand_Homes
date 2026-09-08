export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  return { isValid: true };
}

export function validateName(name: string): { isValid: boolean; message?: string } {
  if (!name || name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  return { isValid: true };
}
