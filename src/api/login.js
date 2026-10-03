export async function loginRequest(email, password) {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => null);

  return { status: response.status, data };
}
