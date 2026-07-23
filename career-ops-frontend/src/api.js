// All API calls go through this module.
// RULE S-1: no keys, no CV content ever stored client-side.

const BASE = import.meta.env.VITE_API_BASE;

async function api(method, path, body, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    credentials: 'include', // send session cookie
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  // For PDF downloads, return the blob directly
  if (res.headers.get('content-type')?.includes('application/pdf')) {
    return res.blob();
  }
  return res.json();
}

export const authApi = {
  login:  code => api('POST', '/api/auth/login',  { code }),
  logout: ()   => api('POST', '/api/auth/logout'),
  status: ()   => api('GET',  '/api/auth/status'),
};

export const cvApi = {
  upload: file => {
    const form = new FormData();
    form.append('cv', file);
    return api('POST', '/api/cv/upload', form);
  },
  info:   ()   => api('GET',    '/api/cv/info'),
  delete: ()   => api('DELETE', '/api/cv'),
};

export const searchApi = {
  jobs: params => api('POST', '/api/search/jobs', params),
};

export const evaluateApi = {
  job:   body => api('POST', '/api/evaluate/job',   body),
  batch: jobs => api('POST', '/api/evaluate/batch', { jobs }),
};

export const coverApi   = { generate: body => api('POST', '/api/cover',        body) };
export const emailApi   = { draft:    body => api('POST', '/api/email/draft',   body) };
export const interviewApi = {
  stories:   body => api('POST', '/api/interview/stories',   body),
  questions: body => api('POST', '/api/interview/questions', body),
};
export const pdfApi = {
  downloadCv: async body => {
    const blob = await api('POST', '/api/pdf/cv', body);
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `cv-${body.jobTitle?.replace(/\s+/g,'-').toLowerCase() || 'tailored'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
