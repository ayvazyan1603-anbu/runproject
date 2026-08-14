function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return (import.meta.env["VITE_API_URL"] as string | undefined) ?? '';
  }
  if (typeof process !== 'undefined' && process.env['VERCEL_URL']) {
    return `https://${process.env['VERCEL_URL']}`;
  }
  return (import.meta.env["VITE_API_URL"] as string | undefined) || 'http://localhost:3001';
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T>(path: string): Promise<T> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}${path}`);
  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})) as { error?: string };
    throw new ApiError(res.status, errorData.error || `API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
