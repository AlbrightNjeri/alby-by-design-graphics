// ===== API BASE URL =====
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '' : 'https://alby-by-design-graphics.onrender.com';

// ===== FALLBACK DATA =====
const portfolioProjectsFallback=[
{id:'brand-glow',title:'Glow Skincare Co.',category:'branding',tag:'Brand Identity',emoji:'✦',bg:'ph-1',img:'images/portfolio/brand-glow.jpg',thumbnail:'images/portfolio/brand-glow.jpg',media:[{url:'images/portfolio/brand-glow.jpg',media_type:'image'},{url:'images/portfolio/brand-glow.jpg',media_type:'image'}],client:'Glow Skincare Co.',year:'2024',desc:'Complete brand identity for a premium Nairobi-based skincare startup.',deliverables:['Logo Design','Brand Guidelines','Colour System','Business Cards','Packaging Labels','Social Media Templates']},
{id:'social-nova',title:'Nova Tech Campaign',category:'social',tag:'Social Media',emoji:'◈',bg:'ph-2',img:'images/portfolio/social-nova.jpg',thumbnail:'images/portfolio/social-nova.jpg',media:[{url:'images/portfolio/social-nova.jpg',media_type:'image'}],client:'Nova Tech Kenya',year:'2024',desc:'A 3-month social media visual campaign for a B2B tech firm.',deliverables:['Feed Post Templates','Story Graphics','Ad Creatives','Campaign Strategy Deck']},
{id:'logo-meridian',title:'Meridian Capital',category:'logos',tag:'Logo Design',emoji:'△',bg:'ph-3',img:'images/portfolio/logo-meridian.jpg',thumbnail:'images/portfolio/logo-meridian.jpg',media:[{url:'images/portfolio/logo-meridian.jpg',media_type:'image'}],client:'Meridian Capital',year:'2023',desc:'A refined, timeless logomark for a Nairobi investment firm.',deliverables:['Primary Logo','Logo Variations','Brand Mark','Dark & Light Versions']},
{id:'poster-fest',title:'Nairobi Arts Festival',category:'posters',tag:'Poster Design',emoji:'⬢',bg:'ph-4',img:'images/portfolio/poster-fest.jpg',thumbnail:'images/portfolio/poster-fest.jpg',media:[{url:'images/portfolio/poster-fest.jpg',media_type:'image'}],client:'Nairobi Arts Festival',year:'2024',desc:'A five-poster series for the annual Nairobi Arts Festival.',deliverables:['5 Event Posters','Digital Versions','Social Crops','Print-ready Files']},
{id:'flyer-pulse',title:'Pulse Nightlife Brand',category:'flyers',tag:'Flyer Design',emoji:'◉',bg:'ph-5',img:'images/portfolio/flyer-pulse.jpg',thumbnail:'images/portfolio/flyer-pulse.jpg',media:[{url:'images/portfolio/flyer-pulse.jpg',media_type:'image'}],client:'Pulse Events',year:'2024',desc:'Ongoing event flyer design for one of Nairobi\'s premier nightlife brands.',deliverables:['Monthly Event Flyers','Digital & Print Formats','Ticket Design']},
{id:'brand-roots',title:'Roots Coffee Roasters',category:'branding',tag:'Brand Identity',emoji:'☕',bg:'ph-6',img:'images/portfolio/brand-roots.jpg',thumbnail:'images/portfolio/brand-roots.jpg',media:[{url:'images/portfolio/brand-roots.jpg',media_type:'image'}],client:'Roots Coffee Roasters',year:'2023',desc:'End-to-end brand identity for a specialty coffee startup.',deliverables:['Logo Suite','Packaging Design','Menu Design','Brand Booklet']},
{id:'motion-nova-ad',title:'Nova Tech — Animated Ad',category:'motion',tag:'Motion Graphics',emoji:'▶',bg:'ph-2',img:'images/portfolio/motion-nova-ad.jpg',thumbnail:'images/portfolio/motion-nova-ad.jpg',media:[{url:'https://www.youtube.com/embed/dQw4w9WgXcQ',media_type:'video',mime_type:'embed'}],client:'Nova Tech Kenya',year:'2024',desc:'A 30-second animated advertisement for Nova Tech Kenya\'s product launch.',deliverables:['30s Ad (16:9)','15s Cut-down','9:16 Reels Version']}
];

let portfolioProjects = [];
const projectData = {};

// ===== HELPERS =====
function resolveVideoSrc(url) {
  if (!url) return '';
  const ytShort = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  const ytWatch = url.match(/youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})/);
  const ytId = (ytShort || ytWatch || [])[1];
  if (ytId) return `https://www.youtube.com/embed/${ytId}`;
  const vmMatch = url.match(/vimeo\.com\/(?!video\/)(\d+)/);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
  return url;
}

function getMediaType(m) {
  if (!m) return 'image';
  if (m.media_type === 'video') return 'video';
  if (m.mime_type === 'embed') return 'embed';
  const url = m.url || '';
  if (url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo')) return 'embed';
  if (/\.(mp4|webm|mov|avi)(\?|$)/i.test(url)) return 'video';
  return 'image';
}

// ===== LOAD PROJECTS =====
async function loadProjects() {
  try {
    const res = await fetch(`${BASE_URL}/api/projects`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        portfolioProjects = data.map(p => {
          // Build media array: prefer project_media table, fall back to legacy fields
          let media = Array.isArray(p.media) && p.media.length ? p.media : [];
          if (!media.length && (p.image_url || p.thumbnail_url)) {
            media.push({ url: p.thumbnail_url || p.image_url, media_type: 'image', is_thumbnail: true });
          }
          if (!media.length && p.video_url) {
            const isEmbed = p.video_url.includes('youtube') || p.video_url.includes('vimeo') || p.video_url.includes('youtu.be');
            media.push({ url: resolveVideoSrc(p.video_url), media_type: 'video', mime_type: isEmbed ? 'embed' : 'video/mp4' });
          }
          const thumbnail = p.thumbnail_url || p.image_url ||
            (media.find(m => m.is_thumbnail) || media.find(m => m.media_type === 'image') || media[0] || {}).url || '';
          return {
            id: String(p.id),
            title: p.title,
            category: p.category || '',
            tag: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1).replace(/-/g, ' ') : 'Design',
            emoji: '✦', bg: 'ph-1',
            img: thumbnail, thumbnail,
            media,
            client: p.client_name || p.title,
            year: p.project_year || (p.created_at ? new Date(p.created_at).getFullYear().toString() : '2024'),
            desc: p.description || '',
            deliverables: p.deliverables
              ? (Array.isArray(p.deliverables) ? p.deliverables : p.deliverables.split(',').map(d => d.trim()).filter(Boolean))
              : [],
            project_url: p.project_url || '',
            featured: !!p.featured,
          };
        });
      } else {
        portfolioProjects = portfolioProjectsFallback;
      }
    } else {
      portfolioProjects = portfolioProjectsFallback;
    }
  } catch (e) {
    portfolioProjects = portfolioProjectsFallback;
  }
  portfolioProjects.forEach(p => { projectData[p.id] = p; });
}

// ===== NETFLIX-STYLE CARD CYCLING =====
const cardTimers = new Map();

function startCardCycle(el, mediaList) {
  if (mediaList.length <= 1) return;
  let idx = 0;
  const imgs = el.querySelectorAll('.card-slide');
  const dots = el.querySelectorAll('.card-dot');
  const counter = el.querySelector('.card-media-count');

  function showSlide(i) {
    imgs.forEach((img, n) => {
      img.style.opacity = n === i ? '1' : '0';
    });
    dots.forEach((d, n) => d.classList.toggle('active', n === i));
    if (counter) counter.textContent = `${i + 1} / ${mediaList.length}`;
  }

  const timer = setInterval(() => {
    idx = (idx + 1) % mediaList.length;
    showSlide(idx);
  }, 3500);

  cardTimers.set(el, timer);

  el.addEventListener('mouseenter', () => clearInterval(cardTimers.get(el)));
  el.addEventListener('mouseleave', () => {
    const t = setInterval(() => { idx = (idx + 1) % mediaList.length; showSlide(idx); }, 3500);
    cardTimers.set(el, t);
  });
}

function buildCardSlides(p) {
  const media = p.media || [];
  if (!media.length) {
    return p.img
      ? `<img src="${p.img}" class="card-slide" alt="${p.title}" loading="lazy" style="opacity:1;width:100%;height:100%;object-fit:cover;position:absolute;inset:0;transition:opacity 0.8s ease">`
      : `<div class="card-slide" style="opacity:1;position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem">${p.emoji}</div>`;
  }

  const slides = media.slice(0, 8).map((m, i) => {
    const mt = getMediaType(m);
    if (mt === 'image') {
      return `<img src="${m.url}" class="card-slide" alt="${p.title} media ${i+1}" loading="${i === 0 ? 'eager' : 'lazy'}" style="opacity:${i===0?1:0};width:100%;height:100%;object-fit:cover;position:absolute;inset:0;transition:opacity 0.8s ease">`;
    }
    // Video/embed: show thumbnail or dark placeholder
    const thumb = m.thumbnail_url || p.thumbnail || p.img || '';
    return thumb
      ? `<div class="card-slide" style="opacity:${i===0?1:0};position:absolute;inset:0;transition:opacity 0.8s ease"><img src="${thumb}" loading="lazy" style="width:100%;height:100%;object-fit:cover"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35)"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5))"><path d="M5 3l14 9-14 9V3z"/></svg></div></div>`
      : `<div class="card-slide" style="opacity:${i===0?1:0};position:absolute;inset:0;background:#111;display:flex;align-items:center;justify-content:center;transition:opacity 0.8s ease"><svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg></div>`;
  }).join('');

  const imageCount = media.filter(m => getMediaType(m) === 'image').length;
  const videoCount = media.filter(m => getMediaType(m) !== 'image').length;
  const indicators = media.length > 1
    ? `<div class="card-dots">${media.slice(0,8).map((_,i) => `<span class="card-dot${i===0?' active':''}"></span>`).join('')}</div>` : '';
  const mediaLabel = imageCount && videoCount
    ? `<span class="card-media-badge">📷 ${imageCount}  🎬 ${videoCount}</span>`
    : imageCount > 1 ? `<span class="card-media-badge">📷 ${imageCount}</span>`
    : videoCount > 1 ? `<span class="card-media-badge">🎬 ${videoCount}</span>` : '';

  return `${slides}${indicators}${mediaLabel}`;
}

// ===== RENDER PORTFOLIO =====
function renderPortfolio(filter='all', query='') {
  const grid = document.getElementById('portfolio-grid');
  const items = portfolioProjects.filter(p => {
    const matchFilter = filter === 'all' || p.category === filter;
    const matchQuery = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.tag.toLowerCase().includes(query.toLowerCase());
    return matchFilter && matchQuery;
  });

  // Clear old card timers
  cardTimers.forEach(t => clearInterval(t));
  cardTimers.clear();
  grid.innerHTML = '';

  items.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'portfolio-item reveal';
    item.setAttribute('role', 'listitem');
    item.setAttribute('tabindex', '0');
    item.setAttribute('data-project', p.id);
    item.setAttribute('aria-label', `View ${p.title} project`);

    const slides = buildCardSlides(p);
    const hasVideo = p.media && p.media.some(m => getMediaType(m) !== 'image');

    item.innerHTML = `
      <div class="portfolio-item-inner ${p.bg}" aria-hidden="true" style="position:relative;overflow:hidden;width:100%;height:100%">
        ${slides}
      </div>
      ${hasVideo ? '<div class="portfolio-item-play" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg></div>' : ''}
      <div class="portfolio-item-overlay"><h4>${p.title}</h4><span>${p.tag}</span></div>`;

    item.addEventListener('click', () => openModal(p.id, 0));
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(p.id, 0); } });
    grid.appendChild(item);
    setTimeout(() => {
      item.classList.add('visible');
      if (p.media && p.media.length > 1) startCardCycle(item, p.media);
    }, 50 * i);
  });
}

// ===== RENDER FEATURED WORK =====
function renderFeaturedWork() {
  const grid = document.getElementById('work-grid');
  if (!grid) return;
  const featured = portfolioProjects.filter(p => p.featured);
  const rest = portfolioProjects.filter(p => !p.featured);
  const display = [...featured, ...rest].slice(0, 6);
  if (!display.length) { grid.innerHTML = '<p style="color:var(--text3);padding:2rem 0">No projects yet.</p>'; return; }
  const delayClass = i => i===1||i===3?' reveal-delay-1':i===2||i===4?' reveal-delay-2':'';
  grid.innerHTML = display.map((p, i) => {
    const imgHtml = p.img
      ? `<img src="${p.img}" alt="${p.title} – ${p.tag} project by Alby by Design Graphics" loading="lazy" class="work-card-img" width="800" height="600">`
      : `<div class="work-card-placeholder ${p.bg}" aria-hidden="true" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem">${p.emoji}</div>`;
    return `<div class="work-card${i===0?' featured':''}${delayClass(i)} reveal" data-project="${p.id}" tabindex="0" role="button" aria-label="View ${p.title} project">
      ${imgHtml}<div class="work-card-border" aria-hidden="true"></div>
      <div class="work-card-overlay"><div class="work-card-tag">${p.tag}</div><div class="work-card-title">${p.title}</div></div>
    </div>`;
  }).join('');
  grid.querySelectorAll('[data-project]').forEach(card => {
    const id = card.getAttribute('data-project');
    card.addEventListener('click', () => openModal(id, 0));
    card.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); openModal(id, 0); } });
  });
}

// ===== MODAL GALLERY =====
let modalProject = null;
let modalIndex   = 0;

function openModal(id, startIndex = 0) {
  const p = projectData[id];
  if (!p) return;
  modalProject = p;
  modalIndex   = startIndex;

  document.getElementById('modal-tag').textContent      = p.tag;
  document.getElementById('modal-title').textContent    = p.title;
  document.getElementById('modal-client').textContent   = p.client;
  document.getElementById('modal-year').textContent     = p.year;
  document.getElementById('modal-category').textContent = p.tag;
  document.getElementById('modal-desc').textContent     = p.desc;
  document.getElementById('modal-deliverables').innerHTML = p.deliverables.map(d => `<span class="skill-tag">${d}</span>`).join('');

  renderModalMedia();

  const modal = document.getElementById('project-modal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close').focus();
}

function renderModalMedia() {
  const p     = modalProject;
  const media = (p.media && p.media.length) ? p.media : [{ url: p.img || p.thumbnail, media_type: 'image' }];
  const total = media.length;
  const m     = media[modalIndex] || media[0];
  const mt    = getMediaType(m);
  const container = document.getElementById('modal-img');

  // Counter
  const counterEl = document.getElementById('modal-counter');
  if (counterEl) { counterEl.textContent = total > 1 ? `${modalIndex + 1} of ${total}` : ''; counterEl.style.display = total > 1 ? 'block' : 'none'; }

  // Nav arrows
  const prevBtn = document.getElementById('modal-prev');
  const nextBtn = document.getElementById('modal-next');
  if (prevBtn) prevBtn.style.display = total > 1 ? 'flex' : 'none';
  if (nextBtn) nextBtn.style.display = total > 1 ? 'flex' : 'none';

  // Thumbnail strip
  renderModalThumbs(media);

  if (mt === 'image') {
    container.innerHTML = `<img src="${m.url}" alt="${p.title} – media ${modalIndex+1}" style="width:100%;height:100%;object-fit:contain;display:block;border-radius:var(--radius)" loading="eager">`;
  } else if (mt === 'embed') {
    const src = resolveVideoSrc(m.url);
    container.innerHTML = `<div class="modal-video-wrap"><iframe src="${src}?autoplay=1&rel=0" title="${p.title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  } else {
    const mime = m.mime_type || 'video/mp4';
    container.innerHTML = `<div class="modal-video-wrap"><video controls autoplay preload="metadata" aria-label="${p.title}"><source src="${m.url}" type="${mime}">Your browser does not support video.</video></div>`;
  }
}

function renderModalThumbs(media) {
  const strip = document.getElementById('modal-thumbs');
  if (!strip || media.length <= 1) { if (strip) strip.innerHTML = ''; return; }
  strip.innerHTML = media.map((m, i) => {
    const mt = getMediaType(m);
    const active = i === modalIndex ? 'style="border-color:var(--gold);opacity:1"' : 'style="border-color:transparent;opacity:0.5"';
    if (mt === 'image') {
      return `<button class="modal-thumb" onclick="goToModalSlide(${i})" aria-label="View image ${i+1}" ${active}><img src="${m.url}" loading="lazy" style="width:100%;height:100%;object-fit:cover"></button>`;
    }
    return `<button class="modal-thumb" onclick="goToModalSlide(${i})" aria-label="View video ${i+1}" ${active}><div style="width:100%;height:100%;background:#111;display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg></div></button>`;
  }).join('');
}

function goToModalSlide(i) {
  stopCurrentModalMedia();
  modalIndex = i;
  renderModalMedia();
}

function modalNext() { if (!modalProject) return; const total = (modalProject.media||[]).length||1; stopCurrentModalMedia(); modalIndex = (modalIndex + 1) % total; renderModalMedia(); }
function modalPrev() { if (!modalProject) return; const total = (modalProject.media||[]).length||1; stopCurrentModalMedia(); modalIndex = (modalIndex - 1 + total) % total; renderModalMedia(); }

function stopCurrentModalMedia() {
  const container = document.getElementById('modal-img');
  const iframe = container.querySelector('iframe');
  if (iframe) iframe.src = '';
  const video = container.querySelector('video');
  if (video) { video.pause(); video.src = ''; }
}

function closeModal() {
  stopCurrentModalMedia();
  const modal = document.getElementById('project-modal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  modalProject = null;
  modalIndex   = 0;
}

// Touch/swipe support for modal
let touchStartX = 0;
document.addEventListener('DOMContentLoaded', () => {
  const modalBackdrop = document.getElementById('project-modal');
  if (!modalBackdrop) return;
  modalBackdrop.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  modalBackdrop.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? modalNext() : modalPrev(); }
  }, { passive: true });
});

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('project-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowRight') modalNext();
  if (e.key === 'ArrowLeft')  modalPrev();
});

// ===== FILTERS =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
    renderPortfolio(btn.dataset.filter, document.getElementById('portfolio-search-input').value);
  });
});
document.getElementById('portfolio-search-input').addEventListener('input', e => {
  const active = document.querySelector('.filter-btn.active');
  renderPortfolio(active ? active.dataset.filter : 'all', e.target.value);
});

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) current = s.id; });
  document.querySelectorAll('.nav-links a').forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
}, { passive: true });

// ===== MOBILE NAV =====
const burger = document.getElementById('nav-burger');
const mobileNav = document.getElementById('mobile-nav');
burger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  burger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
document.querySelectorAll('.mobile-nav-link').forEach(a => {
  a.addEventListener('click', () => { mobileNav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; });
});

// ===== CONTACT FORM =====
document.getElementById('submit-btn').addEventListener('click', () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const status = document.getElementById('form-status');
  if (!name || !email || !message) { status.textContent = 'Please fill in all required fields.'; status.className = 'form-status error'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = 'Please enter a valid email address.'; status.className = 'form-status error'; return; }
  const btn = document.getElementById('submit-btn');
  btn.innerHTML = 'Sending...'; btn.disabled = true;
  fetch(`${BASE_URL}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, company: document.getElementById('company').value.trim(), subject: document.getElementById('service').value || '', budget: document.getElementById('budget').value || '', message }) })
  .then(res => {
    if (res.ok) {
      status.textContent = '✓ Message sent! I\'ll get back to you within 24 hours.'; status.className = 'form-status success';
      btn.innerHTML = 'Message Sent ✓';
      showToast('Message sent successfully!');
      ['name','email','company','budget','service','message'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    } else { res.json().then(data => { status.textContent = (data && data.error) || 'Submission failed.'; status.className = 'form-status error'; btn.innerHTML = 'Send Message'; btn.disabled = false; }); }
  })
  .catch(() => { status.textContent = 'Network error. Please try again.'; status.className = 'form-status error'; btn.innerHTML = 'Send Message'; btn.disabled = false; });
});

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = `<span class="toast-icon">✓</span>${msg}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}

// ===== REVEAL ON SCROLL =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
function observeReveals() { document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); }

// ===== CURSOR =====
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
window.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; cursor.style.left=mx+'px'; cursor.style.top=my+'px'; }, { passive:true });
function animateRing() { rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(animateRing); }
animateRing();
document.querySelectorAll('a,button,.work-card,.portfolio-item,.service-card,.skill-tag').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ===== LOADER =====
window.addEventListener('load', async () => {
  await loadProjects();
  setTimeout(() => {
    document.getElementById('page-loader').classList.add('hidden');
    renderFeaturedWork();
    observeReveals();
    renderPortfolio();
  }, 1300);
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});