export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email) {
    return `Email обязателен`;
  }

  if (!EMAIL_REGEX.test(email)) {
    return `Email некорректен`;
  }

  return null;
}

export function validatePassword(password) {
  if (!password) {
    return `Пароль обязателен`;
  }

  if (password.length < 8) {
    return `Пароль минимум 8 символом`;
  }

  if (password.length > 16) {
    return `Пароль максимум 16 символов`;
  }

  return null;
}
