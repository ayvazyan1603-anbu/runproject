const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) || 'http://localhost:3001'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})) as { error?: string }
    throw new ApiError(res.status, errorData.error || `API error: ${res.status}`)
  }
  return res.json() as Promise<T>
}
