// ══ HELPERS ══

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function fmt(n) {
  if (!n && n !== 0) return '—';
  return '₹' + Number(n).toLocaleString('en-IN');
}

export function genId(prefix, num) {
  const y = new Date().getFullYear();
  return `${prefix}-${y}-${String(num).padStart(4, '0')}`;
}

export function ageDays(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

export function ageBadge(days) {
  if (days <= 30) return { cls: 'age-0', label: `${days}d` };
  if (days <= 60) return { cls: 'age-31', label: `${days}d` };
  if (days <= 90) return { cls: 'age-61', label: `${days}d` };
  return { cls: 'age-91', label: `${days}d` };
}

export function statusBadge(status) {
  const map = {
    'New': 'b-new',
    'In-Progress': 'b-prog',
    'Closed-Won': 'b-won',
    'Closed-Lost': 'b-lost',
    'Hold': 'b-hold',
    'In Stock': 'b-new',
    'Sold': 'b-sold',
    'Refurb': 'b-refurb',
    'Pending': 'b-pend',
    'Paid': 'b-paid',
    'Open': 'b-open',
    'Complete': 'b-complete',
    'Confirmed': 'b-won',
    'Delivered': 'b-sold',
  };
  return map[status] || 'b-new';
}

export function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function initials(name) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
