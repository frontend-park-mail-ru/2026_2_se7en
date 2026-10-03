export async function registerRequest(payload) {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  return { status: response.status, data };
}
