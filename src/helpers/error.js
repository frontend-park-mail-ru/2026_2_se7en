import { ApiError } from './ApiError.js';
import { Messages } from './error.constants.js';

export function handleError(error) {
  console.error('API Error:', error);

  if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
    window.location.href = '/login';
    return;
  }

  showToast(getUserFriendlyMessage(error));
}

function getUserFriendlyMessage(error) {
  if (error instanceof ApiError) {
    return Messages[error.code] || error.message || 'Произошла ошибка';
  }
  return error.message || 'Произошла неизвестная ошибка';
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className =
    'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
