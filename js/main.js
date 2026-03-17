/* ─────────────────────────────────────────
   FlowDesk — Main JS
   ───────────────────────────────────────── */

const SUPABASE_URL = 'https://kntkvepnbskfgvrnzohl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudGt2ZXBuYnNrZmd2cm56b2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3Njg0ODksImV4cCI6MjA4OTM0NDQ4OX0.cgLPRfXa1bTbCz7m0PYbUIpWbH8Rbxaus1JFhcqIwhE';

// ── Smooth scroll to signup ──────────────
function scrollToSignup() {
  document.getElementById('signup').scrollIntoView({ behavior: 'smooth' });
}

// ── Form submission ──────────────────────
async function handleSubmit(e, formId) {
  e.preventDefault();
  const form      = document.getElementById(formId);
  const successId = formId === 'heroForm' ? 'heroSuccess' : 'ctaSuccess';
  const success   = document.getElementById(successId);
  const btn       = form.querySelector('button');
  const email     = form.querySelector('input[type="email"]').value.trim();
  const source    = formId === 'heroForm' ? 'hero' : 'cta';

  btn.textContent = 'Sending...';
  btn.disabled    = true;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ email, source })
    });

    if (!res.ok && res.status !== 409) {
      throw new Error('Request failed');
    }

    form.style.display = 'none';
    success.style.display = 'flex';
  } catch (err) {
    btn.textContent = 'Try again';
    btn.disabled    = false;
    console.error(err);
  }
}

// ── Scroll reveal ────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Nav shrink on scroll ─────────────────
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (window.scrollY > 40) {
    nav.style.height = '54px';
  } else {
    nav.style.height = '64px';
  }
});
