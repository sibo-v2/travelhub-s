export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  return { isValid: true };
}

export function validateFullName(name: string): ValidationResult {
  if (!name) {
    return { isValid: false, message: 'Full name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }

  return { isValid: true };
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  if (!password) {
    return {
      score: 0,
      label: 'Too weak',
      color: 'bg-red-500',
      suggestions: ['Password is required'],
    };
  }

  if (password.length >= 8) score += 1;
  else suggestions.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  else suggestions.push('Include both uppercase and lowercase letters');

  if (/\d/.test(password)) score += 1;
  else suggestions.push('Include at least one number');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else suggestions.push('Include at least one special character');

  let label = 'Too weak';
  let color = 'bg-red-500';

  if (score >= 5) {
    label = 'Very strong';
    color = 'bg-green-500';
  } else if (score >= 4) {
    label = 'Strong';
    color = 'bg-green-400';
  } else if (score >= 3) {
    label = 'Good';
    color = 'bg-yellow-500';
  } else if (score >= 2) {
    label = 'Weak';
    color = 'bg-orange-500';
  }

  return { score, label, color, suggestions };
}
