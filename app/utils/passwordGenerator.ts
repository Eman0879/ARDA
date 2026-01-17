// utils/passwordGenerator.ts

/**
 * Generates a random secure password
 * @param length - Length of password (default: 12)
 * @param options - Options for password complexity
 * @returns Generated password string
 */
export const generatePassword = (
  length: number = 12,
  options: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
  } = {}
): string => {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let characters = '';
  let password = '';

  // Build character set based on options
  if (includeUppercase) characters += uppercase;
  if (includeLowercase) characters += lowercase;
  if (includeNumbers) characters += numbers;
  if (includeSymbols) characters += symbols;

  // Ensure we have at least one character set
  if (characters.length === 0) {
    characters = lowercase + numbers;
  }

  // Generate password
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  // Ensure password has at least one character from each enabled set
  if (includeUppercase && !/[A-Z]/.test(password)) {
    const pos = Math.floor(Math.random() * password.length);
    const char = uppercase[Math.floor(Math.random() * uppercase.length)];
    password = password.substring(0, pos) + char + password.substring(pos + 1);
  }

  if (includeLowercase && !/[a-z]/.test(password)) {
    const pos = Math.floor(Math.random() * password.length);
    const char = lowercase[Math.floor(Math.random() * lowercase.length)];
    password = password.substring(0, pos) + char + password.substring(pos + 1);
  }

  if (includeNumbers && !/\d/.test(password)) {
    const pos = Math.floor(Math.random() * password.length);
    const char = numbers[Math.floor(Math.random() * numbers.length)];
    password = password.substring(0, pos) + char + password.substring(pos + 1);
  }

  if (includeSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    const pos = Math.floor(Math.random() * password.length);
    const char = symbols[Math.floor(Math.random() * symbols.length)];
    password = password.substring(0, pos) + char + password.substring(pos + 1);
  }

  return password;
};

/**
 * Generates a memorable password (easier to type but still secure)
 * Format: Word-Word-Number-Symbol (e.g., "Happy-Cloud-2024!")
 */
export const generateMemorablePassword = (): string => {
  const words = [
    'Happy', 'Cloud', 'River', 'Mountain', 'Ocean', 'Forest', 'Desert', 'Valley',
    'Bright', 'Swift', 'Strong', 'Calm', 'Bold', 'Wise', 'Quick', 'Brave',
    'Tiger', 'Eagle', 'Wolf', 'Bear', 'Lion', 'Hawk', 'Fox', 'Owl',
    'Star', 'Moon', 'Sun', 'Sky', 'Wind', 'Fire', 'Water', 'Earth'
  ];

  const symbols = ['!', '@', '#', '$', '%', '&', '*'];

  const word1 = words[Math.floor(Math.random() * words.length)];
  const word2 = words[Math.floor(Math.random() * words.length)];
  const number = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];

  return `${word1}-${word2}-${number}${symbol}`;
};

export default {
  generatePassword,
  generateMemorablePassword,
};