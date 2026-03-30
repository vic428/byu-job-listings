/**
 * BYU Pathway — Job Listings (Local Dev)
 * -------------------------------------------------------
 * Loads data/jobs.json, filters in JS, renders cards and
 * pagination. Mirrors the Liquid/FetchXML logic in
 * templates/job-listings-template.liquid so you can
 * visually verify before transferring to Power Pages.
 */

const PAGE_SIZE = 9;
let allJobs = [];
let currentPage = 1;

/* ── Boot ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadJobs();
  restoreFiltersFromURL();
  render();
  bindFilterForm();
});

/* ── Data ───────────────────────────────────────────────── */
async function loadJobs() {
  try {
    const res = await fetch('./data/jobs.json');
    allJobs = await res.json();
  } catch (e) {
    console.error('Could not load jobs.json — are you running a local server?', e);
    allJobs = [];
  }
}

/* ── Filtering ──────────────────────────────────────────── */
function getFilters() {
  return {
    kw:       document.getElementById('kw')?.value.trim().toLowerCase() || '',
    position: document.getElementById('position')?.value || '',
    program:  document.getElementById('program')?.value  || '',
    location: document.getElementById('location')?.value || '',
  };
}

function applyFilters(jobs, filters) {
  return jobs.filter(job => {
    if (filters.kw && !job.title.toLowerCase().includes(filters.kw) &&
                      !job.organization.toLowerCase().includes(filters.kw)) return false;
    if (filters.position && job.position_type !== filters.position) return false;
    if (filters.program  && job.program       !== filters.program)  return false;
    if (filters.location && job.location_type !== filters.location) return false;
    return true;
  });
}

/* ── Rendering ──────────────────────────────────────────── */
function render() {
  const filters  = getFilters();
  const filtered = applyFilters(allJobs, filters);
  const total    = filtered.length;
  const pages    = Math.max(1, Math.ceil(total / PAGE_SIZE));
  currentPage    = Math.min(currentPage, pages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  renderResultsBar(total, start, slice.length);
  renderGrid(slice, total);
  renderPagination(pages, filters);
}

function renderResultsBar(total, start, count) {
  const el = document.getElementById('resultsCount');
  if (!el) return;
  if (total === 0) {
    el.innerHTML = 'No listings found';
  } else {
    const end = start + count;
    el.innerHTML = `Showing ${start + 1}–${end} of <strong>${total.toLocaleString()}</strong> listings`;
  }
}

function renderGrid(jobs, total) {
  const grid = document.getElementById('jobGrid');
  if (!grid) return;

  if (total === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>No job listings match your search.</p>
        <button class="pag-btn" onclick="clearFilters()">Clear filters</button>
      </div>`;
    return;
  }

  grid.innerHTML = jobs.map(job => cardHTML(job)).join('');
}

function cardHTML(job) {
  const initials   = getInitials(job.organization);
  const badgeClass = badgeCSSClass(job.location_type);
  const dateLabel  = relativeDate(job.posted_days_ago);

  return `
    <article class="job-card" role="listitem">
      <div class="card-top">
        <div class="card-initials" aria-hidden="true">${initials}</div>
        <span class="badge ${badgeClass}">${escapeHTML(job.location_type)}</span>
      </div>
      <h2 class="card-title">${escapeHTML(job.title)}</h2>
      <p  class="card-org">${escapeHTML(job.organization)}</p>
      <div class="card-tags">
        ${job.position_type ? `<span class="tag">${escapeHTML(job.position_type)}</span>` : ''}
        ${job.program       ? `<span class="tag">${escapeHTML(job.program)}</span>`       : ''}
        ${job.region        ? `<span class="tag">${escapeHTML(job.region)}</span>`        : ''}
      </div>
      <div class="card-foot">
        <span class="card-date">${dateLabel}</span>
        <a class="btn-card-apply" href="${job.apply_url || '#'}">Apply</a>
      </div>
    </article>`;
}

function renderPagination(totalPages, filters) {
  const nav = document.getElementById('pagination');
  if (!nav || totalPages <= 1) { if (nav) nav.innerHTML = ''; return; }

  let html = '';

  if (currentPage > 1) {
    html += paginationBtn(currentPage - 1, filters, '&larr; Prev');
  }

  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages ||
        (p >= currentPage - 2 && p <= currentPage + 2)) {
      html += paginationBtn(p, filters, p, p === currentPage);
    } else if (p === currentPage - 3 || p === currentPage + 3) {
      html += '<span class="pag-ellipsis">&hellip;</span>';
    }
  }

  if (currentPage < totalPages) {
    html += paginationBtn(currentPage + 1, filters, 'Next &rarr;');
  }

  nav.innerHTML = html;

  /* Attach click handlers */
  nav.querySelectorAll('.pag-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page, 10);
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function paginationBtn(page, filters, label, isActive = false) {
  return `<button class="pag-btn${isActive ? ' active' : ''}" data-page="${page}"
            aria-label="Page ${page}" aria-current="${isActive ? 'page' : 'false'}">
            ${label}
          </button>`;
}

/* ── Event Binding ──────────────────────────────────────── */
function bindFilterForm() {
  const form = document.getElementById('filterForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    currentPage = 1;
    render();
    syncURLParams();
  });
}

function clearFilters() {
  ['kw', 'position', 'program', 'location'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  currentPage = 1;
  render();
  syncURLParams();
}

/* ── URL Sync (mirrors Power Pages query-string behaviour) ── */
function syncURLParams() {
  const { kw, position, program, location } = getFilters();
  const params = new URLSearchParams();
  if (kw)       params.set('kw', kw);
  if (position) params.set('position', position);
  if (program)  params.set('program', program);
  if (location) params.set('location', location);
  if (currentPage > 1) params.set('page', currentPage);
  const qs = params.toString();
  history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

function restoreFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  const set    = (id, key) => { const el = document.getElementById(id); if (el && params.get(key)) el.value = params.get(key); };
  set('kw',       'kw');
  set('position', 'position');
  set('program',  'program');
  set('location', 'location');
  currentPage = parseInt(params.get('page') || '1', 10);
}

/* ── Helpers ────────────────────────────────────────────── */
function getInitials(orgName) {
  const words = (orgName || '').trim().split(/\s+/);
  const a = (words[0] || '').charAt(0).toUpperCase();
  const b = (words[1] || words[0] || '').charAt(words[1] ? 0 : 1).toUpperCase();
  return a + b;
}

function badgeCSSClass(locationType) {
  switch ((locationType || '').toLowerCase()) {
    case 'remote':  return 'badge-remote';
    case 'hybrid':  return 'badge-hybrid';
    default:        return 'badge-onsite';
  }
}

function relativeDate(daysAgo) {
  if (daysAgo === 0)  return 'Posted today';
  if (daysAgo === 1)  return 'Posted yesterday';
  if (daysAgo < 7)    return `Posted ${daysAgo} days ago`;
  if (daysAgo < 14)   return 'Posted 1 week ago';
  return `Posted ${Math.floor(daysAgo / 7)} weeks ago`;
}

function escapeHTML(str) {
  return String(str || '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
