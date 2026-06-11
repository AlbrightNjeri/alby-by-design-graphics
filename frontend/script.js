// ===== API BASE URL =====
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? ''
  : 'https://alby-by-design-graphics.onrender.com';

// ===== DATA (fallback if API unavailable) =====
const portfolioProjectsFallback=[
{id:'brand-glow',title:'Glow Skincare Co.',category:'branding',tag:'Brand Identity',emoji:'✦',bg:'ph-1',img:'images/portfolio/brand-glow.jpg',client:'Glow Skincare Co.',year:'2024',desc:'Complete brand identity for a premium Nairobi-based skincare startup. The challenge was to communicate both luxury and natural purity. I developed a warm gold and green palette with a custom logotype that conveys clean, botanical elegance.',deliverables:['Logo Design','Brand Guidelines','Colour System','Business Cards','Packaging Labels','Social Media Templates']},
{id:'social-nova',title:'Nova Tech Campaign',category:'social',tag:'Social Media',emoji:'◈',bg:'ph-2',img:'images/portfolio/social-nova.jpg',client:'Nova Tech Kenya',year:'2024',desc:'A 3-month social media visual campaign for a B2B tech firm. Created a cohesive visual language across Instagram, LinkedIn, and Twitter that positioned Nova as an industry authority and drove a 300% increase in organic engagement.',deliverables:['Feed Post Templates','Story Graphics','Ad Creatives','Campaign Strategy Deck','Branded Icons']},
{id:'logo-meridian',title:'Meridian Capital',category:'logos',tag:'Logo Design',emoji:'△',bg:'ph-3',img:'images/portfolio/logo-meridian.jpg',client:'Meridian Capital',year:'2023',desc:'A refined, timeless logomark for a Nairobi investment firm. The design needed to communicate stability, authority, and forward momentum. Delivered a geometric wordmark with a custom icon that works across digital and print at all sizes.',deliverables:['Primary Logo','Logo Variations','Brand Mark','Dark & Light Versions','Usage Guidelines']},
{id:'poster-fest',title:'Nairobi Arts Festival',category:'posters',tag:'Poster Design',emoji:'⬢',bg:'ph-4',img:'images/portfolio/poster-fest.jpg',client:'Nairobi Arts Festival',year:'2024',desc:'A five-poster series for the annual Nairobi Arts Festival. Each poster celebrated a different discipline — music, visual art, dance, film, and theatre — while maintaining cohesion through a bold typographic system and a shared gold accent language.',deliverables:['5 Event Posters (A1, A2)','Digital Versions','Social Crops','Print-ready Files']},
{id:'flyer-pulse',title:'Pulse Nightlife Brand',category:'flyers',tag:'Flyer Design',emoji:'◉',bg:'ph-5',img:'images/portfolio/flyer-pulse.jpg',client:'Pulse Events',year:'2024',desc:'Ongoing event flyer design for one of Nairobi\'s premier nightlife brands. Each flyer maintains the Pulse visual identity while feeling fresh and unique to the specific event. High-energy compositions with clear hierarchy and irresistible calls to action.',deliverables:['Monthly Event Flyers','Digital & Print Formats','WhatsApp-optimized Versions','Ticket Design']},
{id:'brand-roots',title:'Roots Coffee Roasters',category:'branding',tag:'Brand Identity',emoji:'☕',bg:'ph-6',img:'images/portfolio/brand-roots.jpg',client:'Roots Coffee Roasters',year:'2023',desc:'End-to-end brand identity for a specialty coffee startup celebrating East African coffee culture. The identity draws on Kenyan highlands terrain and craft roasting heritage, resulting in a warm, earthy brand that resonates with both local and international audiences.',deliverables:['Logo Suite','Packaging Design','Menu Design','Tote Bag','Brand Booklet','Social Media Templates']},
{id:'logo-bloom',title:'Bloom Florists',category:'logos',tag:'Logo Design',emoji:'✿',bg:'ph-1',img:'images/portfolio/logo-bloom.jpg',client:'Bloom Florists',year:'2023',desc:'A delicate yet modern logomark for a boutique floral studio. The design uses flowing lines to suggest petals while maintaining geometric precision, resulting in a mark that works beautifully across small business cards and large storefronts.',deliverables:['Primary Logo','Secondary Badge','Brand Colours','Stamp Design']},
{id:'social-soko',title:'Soko Yetu Market',category:'social',tag:'Social Media',emoji:'◆',bg:'ph-2',img:'images/portfolio/social-soko.jpg',client:'Soko Yetu',year:'2024',desc:'Social media design system for an online African marketplace. Bright, culturally vibrant templates that celebrate African artisans and their craft, with clear product hierarchy and buy-now CTAs built into every frame.',deliverables:['Instagram Templates','Product Highlight Cards','Promotional Banners','Animated Stories']},
{id:'flyer-church',title:'Elevate Conference',category:'flyers',tag:'Flyer Design',emoji:'✝',bg:'ph-3',img:'images/portfolio/flyer-church.jpg',client:'Elevate Ministries',year:'2024',desc:'Event branding and flyer suite for a large faith-based conference attracting 2,000+ attendees. Required a design that felt premium and inspiring without leaning on clichés. The result was a bold typographic approach with a transcendent colour gradient.',deliverables:['Main Conference Poster','Speaker Feature Cards','Programme Booklet Cover','Pull-up Banner','Digital Sharing Pack']},
{id:'marketing-bima',title:'Bima Rahisi Rebrand',category:'marketing',tag:'Marketing Materials',emoji:'◻',bg:'ph-4',img:'images/portfolio/marketing-bima.jpg',client:'Bima Rahisi Insurance',year:'2024',desc:'Full marketing materials package for an insurance rebrand. Overhauled all client-facing collateral including brochures, rollup banners, vehicle branding, and agent ID cards to reflect the new brand direction with consistency across every touchpoint.',deliverables:['Tri-fold Brochure','Rollup Banners (3 sizes)','Agent ID Cards','Vehicle Livery Guide','Email Headers']},
{id:'motion-glow-reveal',title:'Glow Logo Reveal',category:'motion',tag:'Motion Graphics',emoji:'▶',bg:'ph-1',type:'video',videoType:'mp4',videoSrc:'videos/motion-glow-reveal.mp4',thumbnail:'images/portfolio/motion-glow-reveal.jpg',client:'Glow Skincare Co.',year:'2024',desc:'Animated logo reveal for Glow Skincare Co. A smooth, elegant motion piece used across digital platforms and brand introduction videos. Created in After Effects with custom particle effects and gold dust transitions.',deliverables:['Logo Reveal (MP4)','Loop Version','Social Format (Square)','Transparent Background (MOV)']},
{id:'motion-nova-ad',title:'Nova Tech — Animated Ad',category:'motion',tag:'Motion Graphics',emoji:'▶',bg:'ph-2',type:'video',videoType:'youtube',videoSrc:'https://www.youtube.com/embed/dQw4w9WgXcQ',thumbnail:'images/portfolio/motion-nova-ad.jpg',client:'Nova Tech Kenya',year:'2024',desc:'A 30-second animated advertisement for Nova Tech Kenya\'s product launch campaign. High-energy kinetic typography, icon animations, and product mockup reveals. Ran across YouTube pre-roll and Instagram Reels.',deliverables:['30s Ad (16:9)','15s Cut-down','9:16 Reels Version','Thumbnail Design']},
{id:'video-roots-brand',title:'Roots Coffee — Brand Film',category:'video',tag:'Video Production',emoji:'▶',bg:'ph-6',type:'video',videoType:'vimeo',videoSrc:'https://player.vimeo.com/video/148751763',thumbnail:'images/portfolio/video-roots-brand.jpg',client:'Roots Coffee Roasters',year:'2024',desc:'A two-minute brand film for Roots Coffee Roasters celebrating the journey from East African highland farms to cup. Shot in Nairobi and Nyeri, combining documentary-style footage with brand motion graphics and original score.',deliverables:['Full Brand Film (2:00)','60s Cut','30s Social Cut','Subtitled Version','Thumbnail & Poster']},
{id:'motion-soko-reel',title:'Soko Yetu — Promo Reel',category:'motion',tag:'Motion Graphics',emoji:'▶',bg:'ph-5',type:'video',videoType:'mp4',videoSrc:'videos/motion-soko-reel.mp4',thumbnail:'images/portfolio/motion-soko-reel.jpg',client:'Soko Yetu',year:'2024',desc:'A 60-second animated promotional reel for Soko Yetu\'s marketplace platform. Showcases product categories, seller stories, and the buying process using bold 2D animation, vibrant colour, and a strong Afrocentric visual language.',deliverables:['60s Promo Reel (MP4)','Loop Intro','15s Version','WhatsApp Story Cuts']},
{id:'video-elevate-recap',title:'Elevate Conference Recap',category:'video',tag:'Video Production',emoji:'▶',bg:'ph-3',type:'video',videoType:'youtube',videoSrc:'https://www.youtube.com/embed/dQw4w9WgXcQ',thumbnail:'images/portfolio/video-elevate-recap.jpg',client:'Elevate Ministries',year:'2024',desc:'A 5-minute event recap video for the Elevate Conference 2024. Combines edited footage, speaker highlights, attendee testimonials, and branded motion graphics into a compelling post-event story piece used for social sharing and sponsorship reporting.',deliverables:['Full Recap (5:00)','90s Social Cut','Speaker Highlight Clips','Thumbnail']}
];

let portfolioProjects = [];
const projectData = {};

// ===== LOAD PROJECTS FROM API =====
async function loadProjects() {
  try {
    const res = await fetch(`${BASE_URL}/api/projects`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        portfolioProjects = data.map(p => ({
          id: String(p.id),
          title: p.title,
          category: p.category || '',
          tag: p.category
            ? p.category.charAt(0).toUpperCase() + p.category.slice(1).replace(/-/g, ' ')
            : 'Design',
          emoji: '✦',
          bg: 'ph-1',
          img: p.image_url || '',
          thumbnail: p.image_url || '',
          // client_name and project_year are now persisted columns — read them directly
          client: p.client_name || p.title,
          year: p.project_year
            || (p.created_at ? new Date(p.created_at).getFullYear().toString() : '2024'),
          desc: p.description || '',
          // deliverables stored as a comma-separated string in the DB
          deliverables: p.deliverables
            ? (Array.isArray(p.deliverables)
                ? p.deliverables
                : p.deliverables.split(',').map(d => d.trim()).filter(Boolean))
            : [],
          type: p.video_url ? 'video' : 'static',
          videoSrc: p.video_url || '',
          videoType: p.video_url
            ? (p.video_url.includes('youtube') ? 'youtube'
              : p.video_url.includes('vimeo') ? 'vimeo' : 'mp4')
            : '',
          project_url: p.project_url || '',
          featured: !!p.featured,
        }));
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

// ===== RENDER PORTFOLIO =====
function renderPortfolio(filter='all', query='') {
  const grid = document.getElementById('portfolio-grid');
  const items = portfolioProjects.filter(p => {
    const matchFilter = filter === 'all' || p.category === filter;
    const matchQuery = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.tag.toLowerCase().includes(query.toLowerCase());
    return matchFilter && matchQuery;
  });
  grid.innerHTML = '';
  items.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'portfolio-item reveal';
    item.setAttribute('role', 'listitem');
    item.setAttribute('tabindex', '0');
    item.setAttribute('data-project', p.id);
    item.setAttribute('aria-label', `View ${p.title} project`);
    const imgSrc = p.img || p.thumbnail || '';
    const innerContent = imgSrc
      ? `<img src="${imgSrc}" alt="${p.title} – ${p.tag} by Alby by Design Graphics" loading="lazy" width="600" height="600" style="width:100%;height:100%;object-fit:cover;display:block;">`
      : `<span style="font-size:2.5rem" aria-hidden="true">${p.emoji}</span>`;
    const playIcon = p.type === 'video'
      ? `<div class="portfolio-item-play" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg></div><div class="portfolio-item-video-badge">${p.tag}</div>`
      : '';
    item.innerHTML = `<div class="portfolio-item-inner ${p.bg}" aria-hidden="true">${innerContent}</div>${playIcon}<div class="portfolio-item-overlay"><h4>${p.title}</h4><span>${p.tag}</span></div>`;
    item.addEventListener('click', () => openModal(p.id));
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(p.id); } });
    grid.appendChild(item);
    setTimeout(() => item.classList.add('visible'), 50 * i);
  });
}

// ===== RENDER FEATURED WORK ("Crafted with Purpose") =====
function renderFeaturedWork() {
  const grid = document.getElementById('work-grid');
  if (!grid) return;

  // Show up to 6 items: featured first, then newest
  const featured = portfolioProjects.filter(p => p.featured);
  const rest     = portfolioProjects.filter(p => !p.featured);
  const display  = [...featured, ...rest].slice(0, 6);

  if (display.length === 0) {
    grid.innerHTML = '<p style="color:var(--text3);padding:2rem 0">No projects yet.</p>';
    return;
  }

  const delayClass = (i) => i === 1 || i === 3 ? ' reveal-delay-1' : i === 2 || i === 4 ? ' reveal-delay-2' : '';

  grid.innerHTML = display.map((p, i) => {
    const imgHtml = p.img
      ? `<img src="${p.img}" alt="${p.title} – ${p.tag} project by Alby by Design Graphics" loading="lazy" class="work-card-img" width="800" height="600">`
      : `<div class="work-card-placeholder ${p.bg}" aria-hidden="true" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem">${p.emoji}</div>`;
    const featuredClass = i === 0 ? ' featured' : '';
    return `<div class="work-card${featuredClass}${delayClass(i)} reveal" data-project="${p.id}" tabindex="0" role="button" aria-label="View ${p.title} project">
      ${imgHtml}
      <div class="work-card-border" aria-hidden="true"></div>
      <div class="work-card-overlay">
        <div class="work-card-tag">${p.tag}</div>
        <div class="work-card-title">${p.title}</div>
      </div>
    </div>`;
  }).join('');

  // Bind click/keyboard handlers
  grid.querySelectorAll('[data-project]').forEach(card => {
    const id = card.getAttribute('data-project');
    card.addEventListener('click', () => openModal(id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(id); }
    });
  });
}


function openModal(id) {
  const p = projectData[id];
  if (!p) return;
  const modal = document.getElementById('project-modal');
  document.getElementById('modal-tag').textContent = p.tag;
  document.getElementById('modal-title').textContent = p.title;
  document.getElementById('modal-client').textContent = p.client;
  document.getElementById('modal-year').textContent = p.year;
  document.getElementById('modal-category').textContent = p.tag;
  document.getElementById('modal-desc').textContent = p.desc;
  const modalImgSrc = p.img || p.thumbnail || '';
  document.getElementById('modal-img').innerHTML = modalImgSrc
    ? `<img src="${modalImgSrc}" alt="${p.title} – ${p.tag} project by Alby by Design Graphics" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">`
    : `<div style="width:100%;height:100%;background:var(--${p.bg});display:flex;align-items:center;justify-content:center;font-size:5rem">${p.emoji}</div>`;
  if (p.type === 'video') {
    let playerHTML = '';
    if (p.videoType === 'youtube' || p.videoType === 'vimeo') {
      playerHTML = `<div class="modal-video-wrap"><iframe src="${p.videoSrc}?autoplay=1&rel=0" title="${p.title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    } else if (p.videoType === 'mp4' || p.videoType === 'webm') {
      const mimeType = p.videoType === 'webm' ? 'video/webm' : 'video/mp4';
      playerHTML = `<div class="modal-video-wrap"><video controls autoplay preload="metadata" aria-label="${p.title} – ${p.tag}"><source src="${p.videoSrc}" type="${mimeType}">Your browser does not support video playback.</video></div>`;
    }
    document.getElementById('modal-img').outerHTML = playerHTML;
  }
  const delDiv = document.getElementById('modal-deliverables');
  delDiv.innerHTML = p.deliverables.map(d => `<span class="skill-tag">${d}</span>`).join('');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close').focus();
}

function closeModal() {
  const modal = document.getElementById('project-modal');
  const wrap = modal.querySelector('.modal-video-wrap');
  if (wrap) {
    const iframe = wrap.querySelector('iframe');
    if (iframe) iframe.src = '';
    const video = wrap.querySelector('video');
    if (video) { video.pause(); video.src = ''; }
    const newImgDiv = document.createElement('div');
    newImgDiv.className = 'modal-img';
    newImgDiv.id = 'modal-img';
    newImgDiv.setAttribute('aria-hidden', 'true');
    wrap.replaceWith(newImgDiv);
  }
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ===== WORK CARDS MODAL — bound after loadProjects() in the load event =====

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('project-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ===== FILTERS =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
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
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
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

// ===== FORM — replaced Formspree with /api/contact =====
document.getElementById('submit-btn').addEventListener('click', () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const status = document.getElementById('form-status');
  if (!name || !email || !message) {
    status.textContent = 'Please fill in all required fields.';
    status.className = 'form-status error';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    status.textContent = 'Please enter a valid email address.';
    status.className = 'form-status error';
    return;
  }
  const btn = document.getElementById('submit-btn');
  btn.innerHTML = 'Sending...';
  btn.disabled = true;

  const formData = {
    name,
    email,
    company: document.getElementById('company').value.trim(),
    subject: document.getElementById('service').value || '',
    budget: document.getElementById('budget').value || '',
    message
  };

  fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  .then(res => {
    if (res.ok) {
      status.textContent = '✓ Message sent! I\'ll get back to you within 24 hours.';
      status.className = 'form-status success';
      btn.innerHTML = 'Message Sent ✓';
      showToast('Message sent successfully! I\'ll be in touch soon.');
      ['name', 'email', 'company', 'budget', 'service', 'message'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    } else {
      res.json().then(data => {
        const errMsg = (data && data.error) || 'Submission failed. Please try again.';
        status.textContent = errMsg;
        status.className = 'form-status error';
        btn.innerHTML = 'Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        btn.disabled = false;
      });
    }
  })
  .catch(() => {
    status.textContent = 'Network error. Please check your connection and try again.';
    status.className = 'form-status error';
    btn.innerHTML = 'Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    btn.disabled = false;
  });
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
let mx = 0, my = 0, rx = 0, ry = 0;
window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }, { passive: true });
function animateRing() { rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(animateRing); }
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
    renderFeaturedWork();   // populate "Crafted with Purpose" from live API data
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