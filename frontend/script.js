/**
 * script.js — Public-facing portfolio site
 *
 * Fetches all content from the backend API and renders it dynamically.
 * API base is relative so it works in both dev and production.
 *
 * Sections driven by API:
 *   /api/content/logo    → nav logo
 *   /api/content/about   → hero + about section
 *   /api/projects        → "Crafted With Purpose" work grid
 *   /api/services        → services grid
 *   /api/testimonials    → testimonials grid
 *   /api/contact         → contact form POST
 */

const API = '/api';

// ─── Utility ─────────────────────────────────────────────────────────────────

function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls)  e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

async function apiFetch(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Nav scroll behaviour ─────────────────────────────────────────────────────

window.addEventListener('scroll', () => {
  qs('#navbar').classList.toggle('nav--scrolled', window.scrollY > 40);
});

// Hamburger
qs('#hamburger')?.addEventListener('click', () => {
  document.body.classList.toggle('nav-open');
});

// Close mobile menu on link click
qsa('.nav__links a').forEach(a => {
  a.addEventListener('click', () => document.body.classList.remove('nav-open'));
});

// ─── Footer year ─────────────────────────────────────────────────────────────

const fyEl = qs('#footer-year');
if (fyEl) fyEl.textContent = new Date().getFullYear();

// ─── Logo ─────────────────────────────────────────────────────────────────────

async function loadLogo() {
  try {
    const data = await apiFetch('/content/logo');
    if (data?.image_url) {
      const img  = qs('#nav-logo-img');
      const text = qs('#nav-logo-text');
      if (img) {
        img.src = data.image_url;
        img.classList.remove('hidden');
      }
      if (text) text.classList.add('hidden');
    }
  } catch (_) { /* fall through — text logo already shown */ }
}

// ─── About / Hero ─────────────────────────────────────────────────────────────

async function loadAbout() {
  try {
    const data = await apiFetch('/content/about');
    if (!data) return;

    if (data.title) {
      const el = qs('#hero-title');
      if (el) el.innerHTML = escHtml(data.title).replace('\n', '<br/>');

      const atEl = qs('#about-title');
      if (atEl) atEl.textContent = data.title;
    }

    if (data.subtitle) {
      const sub = qs('#hero-subtitle');
      if (sub) sub.textContent = data.subtitle;

      const eyebrow = qs('#hero-eyebrow');
      if (eyebrow) eyebrow.textContent = data.subtitle;
    }

    if (data.description) {
      const desc = qs('#about-description');
      if (desc) desc.textContent = data.description;
    }

    if (data.image_url) {
      const img = qs('#hero-image');
      const ph  = qs('#hero-placeholder');
      if (img) {
        img.src = data.image_url;
        img.alt = data.title || 'About';
        img.classList.remove('hidden');
      }
      if (ph) ph.style.display = 'none';
    }
  } catch (err) {
    console.warn('[loadAbout]', err.message);
  }
}

// ─── Services ─────────────────────────────────────────────────────────────────

async function loadServices() {
  const grid = qs('#services-grid');
  if (!grid) return;

  try {
    const services = await apiFetch('/services');

    if (!services.length) {
      grid.innerHTML = '<p class="empty-state">Services coming soon.</p>';
      return;
    }

    grid.innerHTML = '';
    services.forEach(svc => {
      const card = el('div', 'service-card');
      const itemsHtml = (svc.items || []).length
        ? `<ul class="service-card__items">${svc.items.map(i => `<li>${escHtml(i)}</li>`).join('')}</ul>`
        : '';

      card.innerHTML = `
        <div class="service-card__icon">${escHtml(svc.icon || '✦')}</div>
        <h3 class="service-card__title">${escHtml(svc.title)}</h3>
        ${svc.description ? `<p class="service-card__desc">${escHtml(svc.description)}</p>` : ''}
        ${itemsHtml}
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.warn('[loadServices]', err.message);
    grid.innerHTML = '<p class="empty-state">Could not load services.</p>';
  }
}

// ─── Projects / "Crafted With Purpose" ───────────────────────────────────────

let allProjects = [];

async function loadProjects() {
  const grid    = qs('#work-grid');
  const filters = qs('#work-filters');
  const pcEl    = qs('#projects-count');
  if (!grid) return;

  try {
    allProjects = await apiFetch('/projects');

    // Update about stats
    if (pcEl) pcEl.textContent = allProjects.length;

    if (!allProjects.length) {
      grid.innerHTML = '<p class="empty-state">Projects coming soon.</p>';
      return;
    }

    // Build category filter buttons
    if (filters) {
      const cats = [...new Set(allProjects.map(p => p.category).filter(Boolean))];
      // Keep existing "All" button, add categories
      qsa('button:not([data-filter="all"])', filters).forEach(b => b.remove());
      cats.forEach(cat => {
        const btn = el('button', 'filter-btn', escHtml(cat));
        btn.dataset.filter = cat;
        filters.appendChild(btn);
      });

      filters.addEventListener('click', e => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        qsa('.filter-btn', filters).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProjectCards(btn.dataset.filter);
      });
    }

    renderProjectCards('all');
  } catch (err) {
    console.warn('[loadProjects]', err.message);
    grid.innerHTML = '<p class="empty-state">Could not load projects.</p>';
  }
}

function renderProjectCards(filter) {
  const grid = qs('#work-grid');
  if (!grid) return;

  const visible = filter === 'all'
    ? allProjects
    : allProjects.filter(p => p.category === filter);

  if (!visible.length) {
    grid.innerHTML = '<p class="empty-state">No projects in this category yet.</p>';
    return;
  }

  grid.innerHTML = '';
  visible.forEach(project => {
    const card = el('div', 'work-card');
    card.dataset.id = project.id;

    // Image or fallback
    const imageHtml = project.image_url
      ? `<img class="work-card__img" src="${escHtml(project.image_url)}" alt="${escHtml(project.title)}" loading="lazy" />`
      : `<div class="work-card__img-placeholder"><span>✦</span></div>`;

    // Category badge
    const catBadge = project.category
      ? `<span class="work-card__cat">${escHtml(project.category)}</span>`
      : '';

    // Featured mark
    const featuredMark = project.featured
      ? `<span class="work-card__featured">Featured</span>`
      : '';

    card.innerHTML = `
      <div class="work-card__media">
        ${imageHtml}
        <div class="work-card__overlay">
          <button class="work-card__view-btn" data-id="${project.id}">View Project</button>
        </div>
      </div>
      <div class="work-card__info">
        ${catBadge}${featuredMark}
        <h3 class="work-card__title">${escHtml(project.title)}</h3>
        ${project.client_name ? `<p class="work-card__client">${escHtml(project.client_name)}</p>` : ''}
        ${project.description
          ? `<p class="work-card__desc">${escHtml(project.description.slice(0, 120))}${project.description.length > 120 ? '…' : ''}</p>`
          : ''}
      </div>
    `;

    card.querySelector('.work-card__view-btn')?.addEventListener('click', () => openModal(project));
    grid.appendChild(card);
  });
}

// ─── Project Modal ────────────────────────────────────────────────────────────

function openModal(project) {
  const modal = qs('#project-modal');
  if (!modal) return;

  // Image
  const img = qs('#modal-image');
  if (img) {
    img.src = project.image_url || '';
    img.alt = project.title || '';
    img.style.display = project.image_url ? 'block' : 'none';
  }

  // Text fields
  const setTxt = (id, val) => { const e = qs(id); if (e) e.textContent = val || ''; };
  setTxt('#modal-category',    project.category);
  setTxt('#modal-title',       project.title);
  setTxt('#modal-description', project.description);

  // Meta (client, year, deliverables)
  const meta = qs('#modal-meta');
  if (meta) {
    meta.innerHTML = '';
    const addMeta = (label, value) => {
      if (!value) return;
      meta.insertAdjacentHTML('beforeend',
        `<div class="modal__meta-item"><dt>${escHtml(label)}</dt><dd>${escHtml(value)}</dd></div>`
      );
    };
    addMeta('Client',       project.client_name);
    addMeta('Year',         project.project_year);
    addMeta('Deliverables', project.deliverables);
  }

  // Action buttons
  const actions = qs('#modal-actions');
  if (actions) {
    actions.innerHTML = '';
    if (project.project_url) {
      actions.insertAdjacentHTML('beforeend',
        `<a href="${escHtml(project.project_url)}" target="_blank" rel="noopener" class="btn btn--primary">View Live</a>`
      );
    }
    if (project.video_url) {
      actions.insertAdjacentHTML('beforeend',
        `<a href="${escHtml(project.video_url)}" target="_blank" rel="noopener" class="btn btn--ghost">Watch Video</a>`
      );
    }
  }

  modal.classList.add('modal--open');
  document.body.classList.add('modal-active');
}

function closeModal() {
  qs('#project-modal')?.classList.remove('modal--open');
  document.body.classList.remove('modal-active');
}

qs('#modal-close')?.addEventListener('click', closeModal);
qs('#modal-backdrop')?.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ─── Testimonials ─────────────────────────────────────────────────────────────

async function loadTestimonials() {
  const grid = qs('#testimonials-grid');
  if (!grid) return;

  try {
    const items = await apiFetch('/testimonials');

    const ccEl = qs('#clients-count');
    if (ccEl) ccEl.textContent = items.length;

    if (!items.length) {
      grid.innerHTML = '<p class="empty-state">Testimonials coming soon.</p>';
      return;
    }

    grid.innerHTML = '';
    items.forEach(t => {
      const card = el('div', 'testimonial-card');
      const stars = '★'.repeat(Math.min(5, Math.max(0, t.rating || 5)));
      const initials = t.initials || (t.name ? t.name.slice(0, 2).toUpperCase() : '??');

      card.innerHTML = `
        <div class="testimonial-card__stars" aria-label="${t.rating || 5} stars">${stars}</div>
        <blockquote class="testimonial-card__text">${escHtml(t.text)}</blockquote>
        <div class="testimonial-card__author">
          <div class="testimonial-card__avatar">${escHtml(initials)}</div>
          <div>
            <p class="testimonial-card__name">${escHtml(t.name)}</p>
            ${t.role ? `<p class="testimonial-card__role">${escHtml(t.role)}</p>` : ''}
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.warn('[loadTestimonials]', err.message);
    grid.innerHTML = '<p class="empty-state">Could not load testimonials.</p>';
  }
}

// ─── Contact form ─────────────────────────────────────────────────────────────

qs('#contact-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();

  const btn    = qs('#cf-submit');
  const status = qs('#form-status');
  const data   = Object.fromEntries(new FormData(this).entries());

  btn.disabled    = true;
  btn.textContent = 'Sending…';

  try {
    const res = await fetch(`${API}/contact`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });

    const json = await res.json();

    if (res.ok) {
      this.reset();
      if (status) {
        status.textContent = '✓ Message sent! I\'ll be in touch soon.';
        status.className = 'form__status form__status--success';
      }
    } else {
      throw new Error(json.error || 'Submission failed.');
    }
  } catch (err) {
    if (status) {
      status.textContent = `✗ ${err.message}`;
      status.className = 'form__status form__status--error';
    }
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Send Message';
  }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

(async function init() {
  await Promise.allSettled([
    loadLogo(),
    loadAbout(),
    loadServices(),
    loadProjects(),
    loadTestimonials(),
  ]);
})();