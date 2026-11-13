import { ENV } from '../config/env';
import { JobAcceptedResponse, JobStatusResponse, ResearchRequest } from '../types/research';

const BASE_URL = ENV.apiUrl;

/**
 * Builds request headers including any optional API key / Authorization token
 * configured via environment variables (.env.local).
 */
function buildHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...extraHeaders,
  };

  if (ENV.apiKey) {
    if (ENV.authHeader.toLowerCase() === 'authorization' && !ENV.apiKey.startsWith('Bearer ')) {
      headers[ENV.authHeader] = `Bearer ${ENV.apiKey}`;
    } else {
      headers[ENV.authHeader] = ENV.apiKey;
    }
  }

  return headers;
}

export class ApiError extends Error {
  status: number;
  retryAfter?: number;
  data?: any;

  constructor(message: string, status: number, retryAfter?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfter = retryAfter;
    this.data = data;
  }
}

export async function checkBackendHealth(): Promise<{ ok: boolean; statusText?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/healthz/`, {
      headers: buildHeaders(),
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: data.status === 'ok' };
    }
    return { ok: false, statusText: `HTTP ${res.status}` };
  } catch (err: any) {
    return { ok: false, statusText: err.message || 'Cannot connect to backend' };
  }
}

export async function startResearchJob(payload: ResearchRequest): Promise<JobAcceptedResponse> {
  const cleanPayload: Record<string, any> = {
    provider: payload.provider.trim(),
  };

  if (payload.doc_url?.trim()) cleanPayload.doc_url = payload.doc_url.trim();
  if (payload.domains && payload.domains.length > 0) cleanPayload.domains = payload.domains;
  if (payload.seeds && payload.seeds.length > 0) cleanPayload.seeds = payload.seeds;
  if (payload.select_paths && payload.select_paths.length > 0) cleanPayload.select_paths = payload.select_paths;
  if (payload.exclude_paths && payload.exclude_paths.length > 0) cleanPayload.exclude_paths = payload.exclude_paths;
  if (payload.max_urls) cleanPayload.max_urls = Number(payload.max_urls);
  if (payload.dry_run !== undefined) cleanPayload.dry_run = Boolean(payload.dry_run);

  const res = await fetch(`${BASE_URL}/api/research/`, {
    method: 'POST',
    headers: buildHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(cleanPayload),
  });

  if (!res.ok) {
    let errorDetail = `Failed to start research (${res.status})`;
    let errData: any = null;
    const retryAfterHeader = res.headers.get('Retry-After');
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;

    try {
      errData = await res.json();
      if (errData.detail) {
        errorDetail = errData.detail;
      } else if (typeof errData === 'object') {
        const firstKey = Object.keys(errData)[0];
        const val = errData[firstKey];
        errorDetail = Array.isArray(val) ? `${firstKey}: ${val[0]}` : `${firstKey}: ${val}`;
      }
    } catch {
      // not json
    }

    throw new ApiError(errorDetail, res.status, retryAfter, errData);
  }

  return (await res.json()) as JobAcceptedResponse;
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${BASE_URL}/api/jobs/${encodeURIComponent(jobId)}/status/`, {
    headers: buildHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    let errorDetail = `Job status check failed (${res.status})`;
    try {
      const errData = await res.json();
      if (errData.detail) errorDetail = errData.detail;
    } catch {
      // not json
    }
    throw new ApiError(errorDetail, res.status);
  }

  return (await res.json()) as JobStatusResponse;
}
