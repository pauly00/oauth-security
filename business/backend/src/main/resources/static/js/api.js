// ============================================================
// api.js — API call utilities
// ============================================================
const API_BASE = '/api';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || '서버 오류가 발생했습니다.');
  }
  if (res.status === 204) return null;
  return res.json();
}

const API = {
  // Auth
  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: { email, password } }),

  // Employees
  getEmployee: (id) => apiFetch(`/employees/${id}`),
  getEmployeesByCompany: (companyId) => apiFetch(`/employees/company/${companyId}`),
  createEmployee: (data) => apiFetch('/employees', { method: 'POST', body: data }),
  deleteEmployee: (id) => apiFetch(`/employees/${id}`, { method: 'DELETE' }),

  // Rank Levels
  getRankLevels: (companyId) => apiFetch(`/rank-levels/company/${companyId}`),
  createRankLevel: (data) => apiFetch('/rank-levels', { method: 'POST', body: data }),
  deleteRankLevel: (id) => apiFetch(`/rank-levels/${id}`, { method: 'DELETE' }),

  // Overtime
  createOvertime: (data) => apiFetch('/overtime', { method: 'POST', body: data }),
  getMyOvertimes: (employeeId) => apiFetch(`/overtime/my/${employeeId}`),
  getCompanyOvertimes: (companyId) => apiFetch(`/overtime/company/${companyId}`),
  getPendingApprovals: (approverId) => apiFetch(`/overtime/pending/${approverId}`),
  getOvertime: (id) => apiFetch(`/overtime/${id}`),
  approveOvertime: (id, approverId, comment) =>
    apiFetch(`/overtime/${id}/approve`, { method: 'POST', body: { approverId, comment } }),
  rejectOvertime: (id, approverId, comment) =>
    apiFetch(`/overtime/${id}/reject`, { method: 'POST', body: { approverId, comment } }),
  cancelOvertime: (id, requesterId) =>
    apiFetch(`/overtime/${id}/cancel`, { method: 'POST', body: { requesterId } }),

  // Salary
  getSalaries: (companyId, yearMonth) =>
    apiFetch(`/salary/company/${companyId}?yearMonth=${yearMonth}`),
  paySalary: (id, hrId) =>
    apiFetch(`/salary/${id}/pay`, { method: 'POST', body: { hrId } }),
};
