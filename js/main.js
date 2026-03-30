/**
 * BYU Pathway — Job Listings (Local Dev)
 * Updated to match client reference: sidebar pills, card with
 * description snippet + salary, 2-column results grid.
 */

const PAGE_SIZE = 10;
let allJobs     = [];
let currentPage = 1;

/* Active filter state */
let filters = {
  kw:       '',
  program:  '',
  position: '',
  location: '',
};

/* ── Boot ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadJobs();
  restoreFiltersFromURL();
  bindAll();
  render();
});

/* ── Data ───────────────────────────────────────────────────────── */
async function loadJobs() {
  try {
    const res = await fetch('./data/jobs.json');
    allJobs = await res.json();
  } catch (e) {
    console.error('Could not load jobs.json — run via Live Server.', e);
    allJobs = [];
  }
}

/* ── Filter Logic ───────────────────────────────────────────────── */
function applyFilters(jobs) {
  return jobs.filter(job => {
    const kw = filters.kw.toLowerCase();
    if (kw && !job.title.toLowerCase().includes(kw) &&
              !job.organization.toLowerCase().includes(kw) &&
              !job.description.toLowerCase().includes(kw)) return false;
    if (filters.program  && job.program       !== filters.program)  return false;
    if (filters.position && job.position_type !== filters.position) return false;
    if (filters.location && job.location_type !== filters.location &&
                            job.region        !== filters.location) return false;
    return true;
  });
}

/* ── Render ─────────────────────────────────────────────────────── */
function render() {
  const filtered = applyFilters(allJobs);
  const total    = filtered.length;
  const pages    = Math.max(1, Math.ceil(total / PAGE_SIZE));
  currentPage    = Math.min(currentPage, pages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  updateResultsCount(total);
  renderGrid(slice, total);
  renderPagination(pages);
  syncURLParams();
}

function updateResultsCount(total) {
  const el = document.getElementById('resultsCount');
  if (!el) return;
  el.textContent = total === 0
    ? 'No roles found'
    : `${total} role${total === 1 ? '' : 's'} found`;
}

function renderGrid(jobs, total) {
  const grid = document.getElementById('jobGrid');
  if (!grid) return;

  if (total === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>No listings match your search.</p>
        <button class="pag-btn" onclick="clearAllFilters()">Clear filters</button>
      </div>`;
    return;
  }

  grid.innerHTML = jobs.map(cardHTML).join('');
}

/* ── Card HTML ──────────────────────────────────────────────────── */
function cardHTML(job) {
  const initials   = getInitials(job.organization);
  const dateLabel  = relativeDate(job.posted_days_ago);
  const locationDisplay = job.location_type === 'Remote' || job.location_type === 'Hybrid'
    ? job.location_type
    : job.region || job.location_type;

  /* Tag colours */
  const typeTagClass = {
    'Full-time':  'tag-type',
    'Part-time':  'tag-type',
    'Contract':   'tag-program',
    'Internship': 'tag-program',
  }[job.position_type] || 'tag-location';

  return `
    <article class="job-card">
      <div class="card-header">
        <div class="card-initials">${initials}</div>
        <div class="card-company-block">
          <div class="card-company">${escapeHTML(job.organization)}</div>
          <div class="card-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 21s-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-8 12-8 12z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            ${escapeHTML(locationDisplay)}
          </div>
        </div>
        <span class="card-date">${dateLabel}</span>
      </div>

      <h2 class="card-title">${escapeHTML(job.title)}</h2>

      <p class="card-desc">${escapeHTML(job.description)}</p>

      <div class="card-footer">
        <div class="card-tags">
          <span class="tag ${typeTagClass}">${escapeHTML(job.position_type)}</span>
          <span class="tag tag-location">${escapeHTML(job.program.split(' ')[0])}</span>
        </div>
        ${job.salary ? `<span class="card-salary">${escapeHTML(job.salary)}</span>` : ''}
      </div>
    </article>`;
}

/* ── Pagination ─────────────────────────────────────────────────── */
function renderPagination(totalPages) {
  const nav = document.getElementById('pagination');
  if (!nav) return;
  if (totalPages <= 1) { nav.innerHTML = ''; return; }

  let html = '';

  if (currentPage > 1) {
    html += `<button class="pag-btn" data-page="${currentPage - 1}">&larr; Prev</button>`;
  }

  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
      html += `<button class="pag-btn${p === currentPage ? ' active' : ''}" data-page="${p}">${p}</button>`;
    } else if (p === currentPage - 3 || p === currentPage + 3) {
      html += `<span class="pag-ellipsis">&hellip;</span>`;
    }
  }

  if (currentPage < totalPages) {
    html += `<button class="pag-btn" data-page="${currentPage + 1}">Next &rarr;</button>`;
  }

  nav.innerHTML = html;

  nav.querySelectorAll('.pag-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page, 10);
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* ── Event Binding ──────────────────────────────────────────────── */
function bindAll() {
  /* Keyword — live filter as user types */
  const kwInput = document.getElementById('kw');
  if (kwInput) {
    kwInput.addEventListener('input', () => {
      filters.kw = kwInput.value.trim();
      currentPage = 1;
      render();
    });
  }

  /* Location dropdown */
  const locSelect = document.getElementById('location');
  if (locSelect) {
    locSelect.addEventListener('change', () => {
      filters.location = locSelect.value;
      currentPage = 1;
      render();
    });
  }

  /* Program pill group */
  bindPillGroup('programPills', val => {
    filters.program = val;
    currentPage = 1;
    render();
  });

  /* Position pill group */
  bindPillGroup('positionPills', val => {
    filters.position = val;
    currentPage = 1;
    render();
  });

  /* Clear all */
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) clearBtn.addEventListener('click', clearAllFilters);
}

function bindPillGroup(containerId, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      onChange(pill.dataset.value);
    });
  });
}

/* ── Clear All ──────────────────────────────────────────────────── */
function clearAllFilters() {
  filters = { kw: '', program: '', position: '', location: '' };

  const kwInput = document.getElementById('kw');
  if (kwInput) kwInput.value = '';

  const locSelect = document.getElementById('location');
  if (locSelect) locSelect.value = '';

  ['programPills', 'positionPills'].forEach(id => {
    const container = document.getElementById(id);
    if (!container) return;
    container.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    const first = container.querySelector('.pill[data-value=""]');
    if (first) first.classList.add('active');
  });

  currentPage = 1;
  render();
}

/* ── URL Sync ───────────────────────────────────────────────────── */
function syncURLParams() {
  const params = new URLSearchParams();
  if (filters.kw)       params.set('kw',       filters.kw);
  if (filters.program)  params.set('program',  filters.program);
  if (filters.position) params.set('position', filters.position);
  if (filters.location) params.set('location', filters.location);
  if (currentPage > 1)  params.set('page',     currentPage);
  const qs = params.toString();
  history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

function restoreFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  filters.kw       = params.get('kw')       || '';
  filters.program  = params.get('program')  || '';
  filters.position = params.get('position') || '';
  filters.location = params.get('location') || '';
  currentPage      = parseInt(params.get('page') || '1', 10);

  /* Restore input values */
  const kwInput = document.getElementById('kw');
  if (kwInput && filters.kw) kwInput.value = filters.kw;

  const locSelect = document.getElementById('location');
  if (locSelect && filters.location) locSelect.value = filters.location;

  /* Restore active pills */
  restorePills('programPills',  filters.program);
  restorePills('positionPills', filters.position);
}

function restorePills(containerId, activeValue) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.pill').forEach(p => {
    p.classList.toggle('active', p.dataset.value === activeValue);
  });
}

/* ── Helpers ────────────────────────────────────────────────────── */
function getInitials(orgName) {
  const words = (orgName || '').trim().split(/\s+/);
  const a = (words[0] || '').charAt(0).toUpperCase();
  const b = (words[1] || words[0] || '').charAt(words[1] ? 0 : 1).toUpperCase();
  return a + b;
}

function relativeDate(daysAgo) {
  if (daysAgo === 0)  return 'Today';
  if (daysAgo === 1)  return '1d ago';
  if (daysAgo < 7)    return `${daysAgo}d ago`;
  if (daysAgo < 14)   return '1w ago';
  return `${Math.floor(daysAgo / 7)}w ago`;
}

function escapeHTML(str) {
  return String(str || '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
