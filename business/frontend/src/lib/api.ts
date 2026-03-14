const API_BASE = '/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  // 브라우저 쿠키에서 access_token 읽기
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const token = getCookie('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  // 204 No Content 처리
  if (response.status === 204) return null;
  return response.json();
}

export const API = {
  /* ─── 인증 ─── */
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  /* ─── 직원 ─── */
  getEmployees: (companyId: number) =>
    apiFetch(`/employees/company/${companyId}`),
  createEmployee: (body: object) =>
    apiFetch('/employees', { method: 'POST', body: JSON.stringify(body) }),
  deleteEmployee: (id: number) =>
    apiFetch(`/employees/${id}`, { method: 'DELETE' }),

  /* ─── 직책 ─── */
  getRankLevels: (companyId: number) =>
    apiFetch(`/rank-levels/company/${companyId}`),
  createRankLevel: (body: object) =>
    apiFetch('/rank-levels', { method: 'POST', body: JSON.stringify(body) }),
  deleteRankLevel: (id: number) =>
    apiFetch(`/rank-levels/${id}`, { method: 'DELETE' }),

  /* ─── 야근 ─── */
  getMyOvertime: (employeeId: number) =>
    apiFetch(`/overtime/my/${employeeId}`),
  getCompanyOvertime: (companyId: number) =>
    apiFetch(`/overtime/company/${companyId}`),
  getPendingOvertime: (approverId: number) =>
    apiFetch(`/overtime/pending/${approverId}`),
  createOvertime: (body: object) =>
    apiFetch('/overtime', { method: 'POST', body: JSON.stringify(body) }),
  cancelOvertime: (id: number, requesterId: number) =>
    apiFetch(`/overtime/${id}/cancel`, { method: 'POST', body: JSON.stringify({ requesterId }) }),
  approveOvertime: (id: number, approverId: number, comment?: string) =>
    apiFetch(`/overtime/${id}/approve`, { method: 'POST', body: JSON.stringify({ approverId, comment }) }),
  rejectOvertime: (id: number, approverId: number, comment?: string) =>
    apiFetch(`/overtime/${id}/reject`, { method: 'POST', body: JSON.stringify({ approverId, comment }) }),
  deleteOvertime: (id: number, requesterId: number) =>
    apiFetch(`/overtime/${id}?requesterId=${requesterId}`, { method: 'DELETE' }),

  /* ─── 급여 ─── */
  getSalary: (companyId: number, yearMonth: string) =>
    apiFetch(`/salary/company/${companyId}?yearMonth=${yearMonth}`),
  paySalary: (id: number, hrId: number) =>
    apiFetch(`/salary/${id}/pay`, { method: 'POST', body: JSON.stringify({ hrId }) }),
};
