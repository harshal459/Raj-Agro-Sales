// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = '/api';
const WHATSAPP_NUMBER = '919763638666';

// ─── SESSION / VISITOR ────────────────────────────────────────────────────────
const SessionManager = {
  getSessionId() {
    let sid = localStorage.getItem('agri_session');
    if (!sid) {
      sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('agri_session', sid);
    }
    return sid;
  },
  getVisitorData() {
    const data = localStorage.getItem('agri_visitor');
    return data ? JSON.parse(data) : null;
  },
  setVisitorData(data) {
    localStorage.setItem('agri_visitor', JSON.stringify(data));
  },
  isIdentified() {
    const v = this.getVisitorData();
    return v && v.isIdentified;
  }
};

// ─── API HELPER ───────────────────────────────────────────────────────────────
const API = {
  async request(method, endpoint, data = null) {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': SessionManager.getSessionId(),
        'x-page': window.location.pathname
      }
    };
    if (data) opts.body = JSON.stringify(data);
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, opts);
      return await res.json();
    } catch (err) {
      console.error('API Error:', err);
      return { success: false, message: 'Network error' };
    }
  },
  get: (ep) => API.request('GET', ep),
  post: (ep, d) => API.request('POST', ep, d),
  put: (ep, d) => API.request('PUT', ep, d),
  delete: (ep) => API.request('DELETE', ep)
};

// ─── i18n ────────────────────────────────────────────────────────────────────
const I18n = {
  current: localStorage.getItem('agri_lang') || 'en',
  t(key) {
    return (translations[this.current] && translations[this.current][key]) ||
           (translations['en'] && translations['en'][key]) || key;
  },
  set(lang) {
    this.current = lang;
    localStorage.setItem('agri_lang', lang);
    this.apply();
  },
  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = this.t(el.getAttribute('data-i18n-title'));
    });
    // Update active language btn
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.current);
    });
  }
};

// ─── VISITOR TRACKING ────────────────────────────────────────────────────────
const VisitorTracker = {
  async init() {
    const sessionId = SessionManager.getSessionId();
    const visitor = SessionManager.getVisitorData();

    const res = await API.post('/visitors/track', {
      sessionId,
      page: window.location.pathname,
      language: I18n.current
    });

    if (res.success) {
      SessionManager.setVisitorData({
        sessionId,
        isIdentified: res.isIdentified,
        isReturning: res.isReturning
      });

      // Show welcome modal if not identified and not returning in this session
      if (!res.isIdentified && !sessionStorage.getItem('modal_shown')) {
        setTimeout(() => WelcomeModal.show(), 1500);
      }
    }
  },

  async identify(name, phone) {
    const res = await API.post('/visitors/identify', {
      sessionId: SessionManager.getSessionId(),
      name, phone
    });
    if (res.success) {
      SessionManager.setVisitorData({
        ...SessionManager.getVisitorData(),
        isIdentified: true,
        name, phone
      });
    }
    return res;
  }
};


// ─── WELCOME MODAL ───────────────────────────────────────────────────────────
const WelcomeModal = {
  show() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
      modal.classList.add('active');
      sessionStorage.setItem('modal_shown', '1');
    }
  },
  hide() {
    const modal = document.getElementById('welcomeModal');
    if (modal) modal.classList.remove('active');
  }
};

// ─── WHATSAPP ─────────────────────────────────────────────────────────────────
function openWhatsApp(message) {
  const msg = message || I18n.t('whatsapp_message');
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ─── TOAST NOTIFICATION ──────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── MOBILE NAV ──────────────────────────────────────────────────────────────
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }
}

// ─── STICKY HEADER ──────────────────────────────────────────────────────────
function initStickyHeader() {
  const header = document.getElementById('mainHeader');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  I18n.apply();
  initMobileNav();
  initStickyHeader();
  VisitorTracker.init();

  // Language switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => I18n.set(btn.dataset.lang));
  });

  // Welcome modal form
  const welcomeForm = document.getElementById('welcomeForm');
  if (welcomeForm) {
    welcomeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('welcomeName').value.trim();
      const phone = document.getElementById('welcomePhone').value.trim();
      if (!name || !phone || !/^[6-9]\d{9}$/.test(phone)) {
        showToast('Please enter valid name and 10-digit phone number', 'error');
        return;
      }
      await VisitorTracker.identify(name, phone);
      WelcomeModal.hide();
      showToast(`Welcome, ${name}! 🙏`);
    });
  }
  document.getElementById('skipModal')?.addEventListener('click', WelcomeModal.hide);
  document.getElementById('closeModal')?.addEventListener('click', WelcomeModal.hide);

  // WhatsApp floating button
  document.getElementById('whatsappFloat')?.addEventListener('click', () => openWhatsApp());
});
