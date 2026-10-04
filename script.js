const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.menu');

function closeMenu() {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.menu a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const navLinks = [...document.querySelectorAll('.menu a[href^="#"]')];
const navTargets = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${entry.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-25% 0px -65% 0px' });
navTargets.forEach((section) => navObserver.observe(section));

document.querySelectorAll('.finder-options button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.finder-options button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelector('.finder-result').textContent = button.dataset.result;
  });
});

document.querySelectorAll('.faq details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    detail.parentElement.querySelectorAll('details[open]').forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

document.querySelectorAll('.inquiry-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const isEnglish = form.dataset.language === 'en';
    const subject = isEnglish ? `Project enquiry: ${data.get('type')}` : `Upit za projekt: ${data.get('type')}`;
    const lines = isEnglish
      ? [`Name: ${data.get('name')}`, `Email: ${data.get('email')}`, `Project type: ${data.get('type')}`, `Location and area: ${data.get('location') || '-'}`, `Investment range: ${data.get('budget') || '-'}`, `Preferred start: ${data.get('start') || '-'}`, '', `Project details: ${data.get('message') || '-'}`]
      : [`Ime i prezime: ${data.get('name')}`, `Email: ${data.get('email')}`, `Vrsta projekta: ${data.get('type')}`, `Lokacija i kvadratura: ${data.get('location') || '-'}`, `Okvir ulaganja: ${data.get('budget') || '-'}`, `Željeni početak: ${data.get('start') || '-'}`, '', `Opis projekta: ${data.get('message') || '-'}`];
    window.location.href = `mailto:info@galekovic-design.hr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  });
});

document.querySelectorAll('.newsletter-form').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const isEnglish = form.dataset.language === 'en';
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.newsletter-status');
    const data = new FormData(form);
    button.disabled = true;
    status.textContent = isEnglish ? 'Submitting…' : 'Prijava je u tijeku…';

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          consent: data.get('consent') === 'on',
          source: data.get('source'),
          language: form.dataset.language
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Newsletter signup failed.');
      form.reset();
      status.textContent = isEnglish
        ? 'Thank you. Your subscription has been confirmed.'
        : 'Hvala. Vaša prijava je potvrđena.';
    } catch (error) {
      status.textContent = isEnglish
        ? 'The Airtable connection is not active yet. Please try again later.'
        : 'Povezivanje s Airtableom još nije aktivno. Pokušajte ponovno kasnije.';
    } finally {
      button.disabled = false;
    }
  });
});

const mobileContact = document.querySelector('.mobile-contact');
const contactSection = document.querySelector('.faq-contact');
if (mobileContact && contactSection) {
  const contactObserver = new IntersectionObserver(([entry]) => {
    mobileContact.style.visibility = entry.isIntersecting ? 'hidden' : 'visible';
  }, { threshold: 0.15 });
  contactObserver.observe(contactSection);
}

document.getElementById('year').textContent = new Date().getFullYear();
