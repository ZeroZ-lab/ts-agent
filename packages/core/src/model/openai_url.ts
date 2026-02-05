function unquote(text: string): string {
  const t = text.trim();
  const quoted =
    (t.startsWith('"') && t.endsWith('"') && t.length >= 2) || (t.startsWith("'") && t.endsWith("'") && t.length >= 2);
  return quoted ? t.slice(1, -1).trim() : t;
}

export function normalizeBaseUrl(baseUrl: string): string {
  const raw = unquote(baseUrl);
  if (!raw) throw new Error("OpenAI: baseUrl is empty");

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error(`OpenAI: invalid baseUrl: ${raw}`);
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error(`OpenAI: invalid baseUrl protocol: ${u.protocol}`);
  }

  // drop query/hash if present; keep pathname
  u.search = "";
  u.hash = "";

  return u.toString().replace(/\/+$/u, "");
}

export function normalizeApiPath(apiPath?: string): string {
  const raw = unquote(apiPath ?? "/v1");
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/u, "");
}

export function mergeBaseUrlAndApiPath(baseUrl: string, apiPath: string): { baseUrl: string; apiPath: string } {
  const b = normalizeBaseUrl(baseUrl);
  const p = normalizeApiPath(apiPath);
  if (!p) return { baseUrl: b, apiPath: "" };

  // If the user already included the apiPath in baseUrl, avoid duplicating it.
  if (b.endsWith(p)) {
    const stripped = b.slice(0, b.length - p.length).replace(/\/+$/u, "");
    return { baseUrl: stripped || b, apiPath: p };
  }
  return { baseUrl: b, apiPath: p };
}

export function joinUrl(baseUrl: string, path: string): string {
  const b = baseUrl.replace(/\/+$/u, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

