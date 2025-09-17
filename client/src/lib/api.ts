// client/src/lib/api.ts
export async function apiRequest(
  method: string,
  path: string,
  body?: unknown
): Promise<Response> {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // Attach status and a safe .json() reader so callers can inspect error bodies
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.json = async () => {
      try {
        return await res.json();
      } catch {
        return null;
      }
    };
    throw err;
  }

  return res;
}
