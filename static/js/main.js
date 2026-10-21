// Smooth scroll for nav links (desktop + mobile)
document.querySelectorAll('.nav-links a, .mobile-link').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      e.preventDefault();
      closeMobileNav();
      const el = document.querySelector(targetId);
      if (el) {
        const offset = 70; // navbar height
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
});

// Scroll reveal using IntersectionObserver
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  // Fallback
  revealElements.forEach((el) => el.classList.add('visible'));
}

/* ===========================
   MOBILE NAV DRAWER CONTROLS
=========================== */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
const closeDrawerBtn = document.getElementById('close-drawer-btn');

if (mobileMenuBtn && mobileNavOverlay) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    mobileNavOverlay.classList.toggle('active');
  });
}

if (closeDrawerBtn) {
  closeDrawerBtn.addEventListener('click', closeMobileNav);
}

if (mobileNavOverlay) {
  mobileNavOverlay.addEventListener('click', (e) => {
    if (e.target === mobileNavOverlay) {
      closeMobileNav();
    }
  });
}

function closeMobileNav() {
  if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
  if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
}

/* ===========================
   CONTACT FORM & WHATSAPP
=========================== */
function sendWhatsApp(event) {
  event.preventDefault();

  const name = document.getElementById("w-name").value.trim();
  const phone = document.getElementById("w-phone").value.trim();
  const email = document.getElementById("w-email").value.trim();
  const message = document.getElementById("w-msg").value.trim();

  // 1. Save to Admin Inbox (localStorage)
  const newMsg = {
    id: Date.now(),
    name: name,
    phone: phone || "N/A",
    email: email,
    message: message || "(No text message provided)",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dateStr: new Date().toLocaleDateString(),
    unread: true
  };

  const existingMsgs = JSON.parse(localStorage.getItem('meetgol_admin_messages') || '[]');
  existingMsgs.unshift(newMsg);
  localStorage.setItem('meetgol_admin_messages', JSON.stringify(existingMsgs));

  // Update Admin Stats Badge immediately
  updateAdminInboxBadge();

  // 2. Launch WhatsApp redirect
  const whatsappNumber = "918238005301"; // India code +91
  const text =
    "New Portfolio Message%0A%0A" +
    "*Name:* " + encodeURIComponent(name) + "%0A" +
    "*Phone:* " + encodeURIComponent(phone) + "%0A" +
    "*Email:* " + encodeURIComponent(email) + "%0A" +
    "*Message:* " + encodeURIComponent(message);

  const url = `https://wa.me/${whatsappNumber}?text=${text}`;

  // Clear form
  event.target.reset();

  window.open(url, "_blank");
}

/* ===========================
   ADMIN DASHBOARD SYSTEM
=========================== */
const DEFAULT_PIN = "1234";

function getAdminPin() {
  return localStorage.getItem('meetgol_admin_pin') || DEFAULT_PIN;
}

function openAdminModal() {
  const overlay = document.getElementById('admin-overlay');
  if (!overlay) return;

  overlay.classList.add('active');

  // Check if authenticated in current session
  const isAuth = sessionStorage.getItem('meetgol_admin_auth') === 'true';
  const loginView = document.getElementById('admin-login-view');
  const dashView = document.getElementById('admin-dashboard-view');

  if (isAuth) {
    loginView.style.display = 'none';
    dashView.style.display = 'flex';
    renderAdminInbox();
  } else {
    loginView.style.display = 'flex';
    dashView.style.display = 'none';
  }

  updateAdminInboxBadge();
}

function closeAdminModal() {
  const overlay = document.getElementById('admin-overlay');
  if (overlay) overlay.classList.remove('active');
}

function handleAdminLogin(event) {
  event.preventDefault();
  const inputPin = document.getElementById('admin-pin-input').value;
  const errorMsg = document.getElementById('login-error-msg');

  if (inputPin === getAdminPin()) {
    sessionStorage.setItem('meetgol_admin_auth', 'true');
    errorMsg.style.display = 'none';
    document.getElementById('admin-pin-input').value = '';

    document.getElementById('admin-login-view').style.display = 'none';
    document.getElementById('admin-dashboard-view').style.display = 'flex';
    renderAdminInbox();
  } else {
    errorMsg.textContent = "Incorrect security PIN.";
    errorMsg.style.display = 'block';
  }
}

function lockAdminPanel() {
  sessionStorage.removeItem('meetgol_admin_auth');
  document.getElementById('admin-login-view').style.display = 'flex';
  document.getElementById('admin-dashboard-view').style.display = 'none';
}

function switchAdminTab(tabName) {
  // Update Tab buttons active class
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
  });

  // Toggle Tab panels
  document.querySelectorAll('.admin-tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabName}`);
  });

  if (tabName === 'inbox') {
    renderAdminInbox();
  }
}

function renderAdminInbox() {
  const container = document.getElementById('inbox-messages-container');
  if (!container) return;

  const messages = JSON.parse(localStorage.getItem('meetgol_admin_messages') || '[]');

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="empty-inbox-state">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="1.5" style="margin-bottom: 0.5rem;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        <p>No messages received yet.</p>
        <span style="font-size: 0.78rem;" class="muted">Submissions from the contact form will appear here.</span>
      </div>
    `;
    updateAdminInboxBadge();
    return;
  }

  container.innerHTML = messages.map(msg => `
    <div class="message-card ${msg.unread ? 'unread' : ''}">
      <div class="message-card-header">
        <span class="sender-name">${escapeHtml(msg.name)}</span>
        <span class="message-time">${msg.dateStr} at ${msg.timestamp}</span>
      </div>
      <div class="message-meta">
        <span>📧 <a href="mailto:${escapeHtml(msg.email)}" style="color: #9ca3af; text-decoration: none;">${escapeHtml(msg.email)}</a></span>
        <span>📞 ${escapeHtml(msg.phone)}</span>
      </div>
      <div class="message-body">${escapeHtml(msg.message)}</div>
      <div class="message-actions">
        ${msg.unread ? `<button class="btn-sm btn-outline" onclick="markMessageRead(${msg.id})">Mark as Read</button>` : ''}
        <a href="mailto:${escapeHtml(msg.email)}" class="btn-sm btn-solid" style="text-decoration: none;">Reply Email</a>
        <button class="btn-sm btn-danger-outline" onclick="deleteMessage(${msg.id})">Delete</button>
      </div>
    </div>
  `).join('');

  updateAdminInboxBadge();
}

function markMessageRead(id) {
  let messages = JSON.parse(localStorage.getItem('meetgol_admin_messages') || '[]');
  messages = messages.map(m => m.id === id ? { ...m, unread: false } : m);
  localStorage.setItem('meetgol_admin_messages', JSON.stringify(messages));
  renderAdminInbox();
}

function deleteMessage(id) {
  let messages = JSON.parse(localStorage.getItem('meetgol_admin_messages') || '[]');
  messages = messages.filter(m => m.id !== id);
  localStorage.setItem('meetgol_admin_messages', JSON.stringify(messages));
  renderAdminInbox();
}

function clearAllMessages() {
  if (confirm("Are you sure you want to clear all inbox messages?")) {
    localStorage.removeItem('meetgol_admin_messages');
    renderAdminInbox();
  }
}

function updateAdminInboxBadge() {
  const messages = JSON.parse(localStorage.getItem('meetgol_admin_messages') || '[]');
  const unreadCount = messages.filter(m => m.unread).length;
  
  const badgeEl = document.getElementById('unread-count-badge');
  if (badgeEl) badgeEl.textContent = unreadCount;

  const statMsgVal = document.getElementById('stat-msg-val');
  if (statMsgVal) statMsgVal.textContent = messages.length;
}

function recordPortfolioVisit() {
  const visitCount = Number(localStorage.getItem('meetgol_portfolio_views') || '0') + 1;
  localStorage.setItem('meetgol_portfolio_views', String(visitCount));

  const statViewsVal = document.getElementById('stat-views-val');
  if (statViewsVal) statViewsVal.textContent = visitCount.toLocaleString();
}

function updateAvailabilityStatus(val) {
  const badgeText = document.getElementById('status-badge-text');
  if (badgeText) badgeText.textContent = val;

  const statStatusVal = document.getElementById('stat-status-val');
  if (statStatusVal) statStatusVal.textContent = val;

  localStorage.setItem('meetgol_site_status', val);
}

function saveNewPin() {
  const newPin = document.getElementById('new-pin-input').value.trim();
  if (newPin.length >= 4) {
    localStorage.setItem('meetgol_admin_pin', newPin);
    alert("Admin PIN updated successfully!");
    document.getElementById('new-pin-input').value = '';
  } else {
    alert("Please enter a valid PIN with at least 4 digits.");
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initializer on Page Load
document.addEventListener('DOMContentLoaded', () => {
  recordPortfolioVisit();
  updateAdminInboxBadge();

  // Restore saved availability status if set
  const savedStatus = localStorage.getItem('meetgol_site_status');
  if (savedStatus) {
    updateAvailabilityStatus(savedStatus);
    const selectEl = document.getElementById('availability-select');
    if (selectEl) selectEl.value = savedStatus;
  }
});
