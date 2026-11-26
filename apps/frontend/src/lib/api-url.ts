export function backendApiUrl(value: string | undefined): string {
  const base = (value?.trim() || 'http://localhost:4000').replace(/\/+$/, '');
  return base.endsWith('/api/v1') ? base : `${base}/api/v1`;
}
