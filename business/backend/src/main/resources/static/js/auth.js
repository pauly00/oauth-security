// ============================================================
// auth.js — Session management (dummy, localStorage-based)
// ============================================================

const Auth = {
  KEY: 'payroll_user',

  save(user) {
    localStorage.setItem(this.KEY, JSON.stringify(user));
  },

  get() {
    const s = localStorage.getItem(this.KEY);
    return s ? JSON.parse(s) : null;
  },

  logout() {
    localStorage.removeItem(this.KEY);
    window.location.href = 'index.html';
  },

  /** 로그인 필요 페이지에서 호출 */
  require() {
    const user = this.get();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }
    return user;
  },

  /** HR/ADMIN 전용 페이지에서 호출 */
  requireHR() {
    const user = this.require();
    if (user && user.role !== 'HR' && user.role !== 'ADMIN') {
      alert('HR 담당자 전용 페이지입니다.');
      window.location.href = 'dashboard.html';
      return null;
    }
    return user;
  },

  isHR() {
    const u = this.get();
    return u && (u.role === 'HR' || u.role === 'ADMIN');
  }
};

// Toast helper
function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// Render sidebar user info
function renderUserChip(user) {
  const avatar = document.getElementById('userAvatar');
  const name = document.getElementById('userName');
  const sub  = document.getElementById('userSub');
  if (avatar) avatar.textContent = user.name.charAt(0);
  if (name)   name.textContent  = user.name;
  if (sub)    sub.textContent   = `${user.rankTitle} · ${user.companyName}`;
}

// Status badge
function statusBadge(status) {
  const map = {
    PENDING:     ['대기',     'pending'],
    IN_PROGRESS: ['승인중',   'in_progress'],
    APPROVED:    ['승인완료', 'approved'],
    REJECTED:    ['반려',     'rejected'],
    WAITING:     ['대기',     'waiting'],
    PAID:        ['지급완료', 'paid'],
  };
  const [label, cls] = map[status] || [status, 'pending'];
  return `<span class="badge badge-${cls}">${label}</span>`;
}

// Approval chain render
function renderStepChain(steps) {
  if (!steps || steps.length === 0) return '—';
  return `<div class="step-chain">${steps.map((s, i) =>
    `${i > 0 ? '<span class="step-arrow">›</span>' : ''}
     <span class="step-item ${s.status.toLowerCase()}">${s.approverRankTitle} ${s.approverName}</span>`
  ).join('')}</div>`;
}

// Format number to KRW
function fmtWon(n) {
  return (n || 0).toLocaleString('ko-KR') + '원';
}

// Format date
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('ko-KR');
}
