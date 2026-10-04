const STORAGE_KEY = 'galekovic-offers-v1';
const COUNTER_KEY = 'galekovic-offer-counter-v1';
const form = document.getElementById('offer-form');
const lineItems = document.getElementById('line-items');
const template = document.getElementById('line-item-template');
const preview = document.getElementById('offer-preview');
const draftList = document.getElementById('draft-list');
const draftCount = document.getElementById('draft-count');
const currency = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' });
const dateFormat = new Intl.DateTimeFormat('hr-HR');
let activeId = null;
let toastTimer;

const presets = {
  concept: {
    summary: 'Izrada jasnog prostornog i vizualnog koncepta kao osnove za daljnju razradu i izvedbu interijera.',
    items: [
      { description: 'Analiza potreba i organizacija prostora', quantity: 1, unit: 'paušal', price: 0 },
      { description: 'Idejni koncept interijera', quantity: 1, unit: 'paušal', price: 0 },
      { description: 'Paleta materijala, boja i opreme', quantity: 1, unit: 'paušal', price: 0 },
    ],
    included: 'Uvodni sastanak i analiza potreba\nTlocrtna organizacija prostora\nVizualni smjer i paleta materijala\nDva kruga izmjena',
    excluded: 'Izvedbeni i radionički nacrti\nTroškovnik izvođačkih radova\nNabava, dostava i montaža\nKoordinacija izvođača i nadzor gradilišta',
  },
  furniture: {
    summary: 'Projektiranje interijera i precizna razrada elemenata namještaja po mjeri za dogovoreni prostor.',
    items: [
      { description: 'Koncept i projekt interijera', quantity: 1, unit: 'paušal', price: 0 },
      { description: 'Tehnička razrada namještaja po mjeri', quantity: 1, unit: 'paušal', price: 0 },
      { description: 'Specifikacija materijala i okova', quantity: 1, unit: 'paušal', price: 0 },
    ],
    included: 'Analiza potreba i tlocrtno rješenje\nVizualni koncept interijera\nTehnički nacrti dogovorenog namještaja\nSpecifikacija materijala i okova\nDva kruga izmjena',
    excluded: 'Građevinski i obrtnički radovi\nKupnja gotovog namještaja i opreme\nTroškovi dostave i montaže, osim ako su navedeni kao stavka\nPromjene nakon potvrde izvedbenih nacrta',
  },
  complete: {
    summary: 'Cjelovit razvoj interijera od prostornog koncepta i tehničke dokumentacije do koordinacije dogovorenih faza izvedbe.',
    items: [
      { description: 'Projekt interijera i tehnička dokumentacija', quantity: 1, unit: 'paušal', price: 0 },
      { description: 'Projekt namještaja po mjeri', quantity: 1, unit: 'paušal', price: 0 },
      { description: 'Koordinacija dogovorenih faza izvedbe', quantity: 1, unit: 'paušal', price: 0 },
    ],
    included: 'Analiza potreba i organizacija prostora\nIdejno i izvedbeno rješenje interijera\nRazrada dogovorenog namještaja po mjeri\nSpecifikacija materijala i opreme\nDogovoreni obilasci i koordinacija\nDva kruga izmjena po fazi',
    excluded: 'Troškovi izvođača, materijala i opreme\nRadovi koji nisu navedeni u stavkama ponude\nStručni nadzor ovlaštenih inženjera\nUsluge i pristojbe trećih strana',
  },
};

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function nextOfferNumber(increment = false) {
  const year = new Date().getFullYear();
  const current = Number(localStorage.getItem(COUNTER_KEY) || 1);
  if (increment) localStorage.setItem(COUNTER_KEY, String(current + 1));
  return `GD-${year}-${String(current).padStart(3, '0')}`;
}

function notify(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function lines(value = '') {
  return String(value).split('\n').map((line) => line.trim()).filter(Boolean);
}

function addItem(item = {}) {
  const row = template.content.firstElementChild.cloneNode(true);
  ['description', 'quantity', 'unit', 'price'].forEach((field) => {
    const input = row.querySelector(`[data-field="${field}"]`);
    if (item[field] !== undefined) input.value = item[field];
    input.addEventListener('input', updatePreview);
  });
  row.querySelector('.remove-item').addEventListener('click', () => {
    if (lineItems.children.length === 1) return notify('Ponuda treba imati barem jednu stavku.');
    row.remove();
    updatePreview();
  });
  lineItems.appendChild(row);
}

function getItems() {
  return [...lineItems.querySelectorAll('.line-item')].map((row) => ({
    description: row.querySelector('[data-field="description"]').value.trim(),
    quantity: Number(row.querySelector('[data-field="quantity"]').value) || 0,
    unit: row.querySelector('[data-field="unit"]').value.trim(),
    price: Number(row.querySelector('[data-field="price"]').value) || 0,
  }));
}

function getData() {
  return Object.fromEntries(new FormData(form).entries());
}

function calculate(items, discount, taxRate) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discountAmount = subtotal * discount / 100;
  const base = subtotal - discountAmount;
  const tax = base * taxRate / 100;
  return { subtotal, discountAmount, base, tax, total: base + tax };
}

function listMarkup(value) {
  const entries = lines(value);
  return entries.length ? `<ul>${entries.map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')}</ul>` : '<p>Nije navedeno.</p>';
}

function displayDate(value) {
  if (!value) return 'Nije navedeno';
  return dateFormat.format(new Date(`${value}T12:00:00`));
}

function updatePreview() {
  const data = getData();
  const items = getItems();
  const totals = calculate(items, Number(data.discount) || 0, Number(data.taxRate) || 0);
  const itemRows = items.filter((item) => item.description).map((item) => `
    <tr><td>${escapeHtml(item.description)}</td><td>${item.quantity}</td><td>${escapeHtml(item.unit)}</td><td>${currency.format(item.price)}</td><td>${currency.format(item.quantity * item.price)}</td></tr>`).join('');
  const discountRow = totals.discountAmount ? `<div class="offer-total-row"><span>Popust (${escapeHtml(data.discount)}%)</span><strong>− ${currency.format(totals.discountAmount)}</strong></div>` : '';
  const taxRow = Number(data.taxRate) ? `<div class="offer-total-row"><span>PDV (${escapeHtml(data.taxRate)}%)</span><strong>${currency.format(totals.tax)}</strong></div>` : '';

  preview.innerHTML = `
    <div class="offer-logo"><span><b>Galeković</b><em>Design</em></span><img src="../assets/brand/galekovic-monogram-transparent.png" alt="" /></div>
    <div class="offer-kicker">Ponuda / ${escapeHtml(data.offerNumber || 'radna verzija')}</div>
    <h2>${escapeHtml(data.projectName || 'Naziv projekta')}</h2>
    <div class="offer-meta">
      <div><span>Broj ponude</span><strong>${escapeHtml(data.offerNumber || 'Nije naveden')}</strong></div>
      <div><span>Datum</span><strong>${displayDate(data.offerDate)}</strong></div>
      <div><span>Vrijedi do</span><strong>${displayDate(data.validUntil)}</strong></div>
    </div>
    <div class="offer-client">
      <div><span>Za</span><strong>${escapeHtml(data.clientName || 'Klijent')}</strong><small>${escapeHtml(data.clientContact || '')}</small></div>
      <div><span>Projekt</span><strong>${escapeHtml(data.projectLocation || 'Lokacija nije navedena')}</strong></div>
    </div>
    ${data.projectSummary ? `<p class="offer-summary">${escapeHtml(data.projectSummary)}</p>` : ''}
    <section class="offer-section">
      <span class="offer-section-label">Opseg i naknada</span>
      <h3>Stavke ponude</h3>
      <table class="offer-table"><thead><tr><th>Opis</th><th>Kol.</th><th>Jedinica</th><th>Cijena</th><th>Ukupno</th></tr></thead><tbody>${itemRows || '<tr><td colspan="5">Dodajte stavke ponude.</td></tr>'}</tbody></table>
      <div class="offer-totals">
        <div class="offer-total-row"><span>Međuzbroj</span><strong>${currency.format(totals.subtotal)}</strong></div>
        ${discountRow}${taxRow}
        <div class="offer-total-row grand"><span>Ukupno</span><strong>${currency.format(totals.total)}</strong></div>
      </div>
      ${data.taxNote ? `<p class="offer-note">${escapeHtml(data.taxNote)}</p>` : ''}
    </section>
    <section class="offer-section offer-columns">
      <div class="offer-copy"><span class="offer-section-label">U cijenu je uključeno</span>${listMarkup(data.included)}</div>
      <div class="offer-copy"><span class="offer-section-label">U cijenu nije uključeno</span>${listMarkup(data.excluded)}</div>
    </section>
    <section class="offer-section offer-columns">
      <div class="offer-copy"><span class="offer-section-label">Planirani rok</span><p>${escapeHtml(data.timeline || 'Rok se potvrđuje nakon prihvata ponude i primitka svih potrebnih podloga.')}</p></div>
      <div class="offer-copy"><span class="offer-section-label">Dinamika plaćanja</span><p>${escapeHtml(data.paymentTerms || 'Dinamika plaćanja dogovara se prije prihvata ponude.')}</p></div>
    </section>
    <section class="offer-section offer-columns">
      <div class="offer-copy"><span class="offer-section-label">Uvjeti početka</span><p>${escapeHtml(data.startConditions)}</p>${data.startTiming ? `<p><strong>Predviđeni početak:</strong> ${escapeHtml(data.startTiming)}</p>` : ''}</div>
      <div class="offer-copy"><span class="offer-section-label">Obveze klijenta</span>${listMarkup(data.clientDuties)}</div>
    </section>
    <section class="offer-section offer-copy"><span class="offer-section-label">Izmjene i dodatni rad</span><p>${escapeHtml(data.changes)}</p></section>
    <section class="offer-accept"><p>${escapeHtml(data.finalNote)}</p></section>
    <div class="signature-grid"><div>Za Galeković Design / datum i potpis</div><div>Prihvat ponude / datum i potpis klijenta</div></div>
    <footer class="offer-footer"><span>Galeković Design j.d.o.o.<br />Braće Radića 111, Mraclin<br />OIB 07767406016 / MB 04083300</span><span>info@galekovic-design.hr<br />+385 91 939 5377<br />galekovic-design.hr</span></footer>`;
}

function getDrafts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function renderDrafts() {
  const drafts = getDrafts();
  draftCount.textContent = drafts.length;
  draftList.replaceChildren();
  if (!drafts.length) {
    const empty = document.createElement('p');
    empty.className = 'draft-empty';
    empty.textContent = 'Još nema spremljenih ponuda.';
    draftList.appendChild(empty);
    return;
  }
  drafts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).forEach((draft) => {
    const row = document.createElement('div');
    row.className = 'draft-row';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `draft-card${draft.id === activeId ? ' active' : ''}`;
    button.innerHTML = `<strong>${escapeHtml(draft.data.clientName || 'Bez naziva')}</strong><span>${escapeHtml(draft.data.offerNumber)} / ${escapeHtml(draft.data.projectName || 'Projekt')}</span>`;
    button.addEventListener('click', () => loadDraft(draft.id));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete-draft';
    remove.setAttribute('aria-label', `Izbriši ponudu ${draft.data.offerNumber}`);
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      if (!confirm(`Izbrisati skicu ${draft.data.offerNumber}?`)) return;
      const remaining = getDrafts().filter((item) => item.id !== draft.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
      if (activeId === draft.id) resetOffer();
      else renderDrafts();
      notify('Skica je izbrisana.');
    });
    row.append(button, remove);
    draftList.appendChild(row);
  });
}

function saveDraft() {
  const data = getData();
  if (!data.clientName || !data.projectName) return notify('Unesite klijenta i naziv projekta.');
  const drafts = getDrafts();
  const id = activeId || crypto.randomUUID();
  const draft = { id, data, items: getItems(), updatedAt: new Date().toISOString() };
  const index = drafts.findIndex((item) => item.id === id);
  if (index >= 0) drafts[index] = draft;
  else drafts.push(draft);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  if (!activeId) {
    activeId = id;
    nextOfferNumber(true);
  }
  renderDrafts();
  notify('Skica je spremljena u pregledniku.');
}

function setFormData(data) {
  Object.entries(data).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (field) field.value = value;
  });
}

function loadDraft(id) {
  const draft = getDrafts().find((item) => item.id === id);
  if (!draft) return;
  activeId = id;
  form.reset();
  setFormData(draft.data);
  lineItems.replaceChildren();
  draft.items.forEach(addItem);
  renderDrafts();
  updatePreview();
  notify('Skica je otvorena.');
}

function resetOffer() {
  activeId = null;
  form.reset();
  const today = new Date();
  const valid = new Date(today);
  valid.setDate(valid.getDate() + 15);
  form.elements.offerNumber.value = nextOfferNumber();
  form.elements.offerDate.value = isoDate(today);
  form.elements.validUntil.value = isoDate(valid);
  form.elements.discount.value = 0;
  form.elements.taxRate.value = 0;
  form.elements.changes.value = 'Ponuda uključuje dva kruga izmjena unutar dogovorenog opsega. Naknadne izmjene, novi zahtjevi i rad izvan navedenog opsega ugovaraju se i obračunavaju zasebno prije početka dodatnog rada.';
  form.elements.startConditions.value = 'Rad počinje nakon pisanog prihvata ponude, uplate dogovorenog predujma i primitka svih podloga potrebnih za početak projekta.';
  form.elements.finalNote.value = 'Prihvatom ponude potvrđuje se razumijevanje navedenog opsega, rokova, cijene i uvjeta suradnje.';
  lineItems.replaceChildren();
  addItem({ description: '', quantity: 1, unit: 'paušal', price: 0 });
  renderDrafts();
  updatePreview();
}

function applyPreset(key) {
  if (!presets[key]) return;
  const preset = presets[key];
  form.elements.projectSummary.value = preset.summary;
  form.elements.included.value = preset.included;
  form.elements.excluded.value = preset.excluded;
  lineItems.replaceChildren();
  preset.items.forEach(addItem);
  updatePreview();
}

function offerAsText() {
  const data = getData();
  const items = getItems();
  const totals = calculate(items, Number(data.discount) || 0, Number(data.taxRate) || 0);
  return [
    `PONUDA ${data.offerNumber || ''}`,
    data.projectName || '',
    `Klijent: ${data.clientName || ''}`,
    `Datum: ${displayDate(data.offerDate)}`,
    `Ponuda vrijedi do: ${displayDate(data.validUntil)}`,
    '', data.projectSummary || '', '', 'STAVKE PONUDE',
    ...items.filter((item) => item.description).map((item) => `${item.description}: ${item.quantity} ${item.unit} × ${currency.format(item.price)} = ${currency.format(item.quantity * item.price)}`),
    `UKUPNO: ${currency.format(totals.total)}`,
    data.taxNote || '', '', 'U CIJENU JE UKLJUČENO', ...lines(data.included).map((line) => `/ ${line}`),
    '', 'U CIJENU NIJE UKLJUČENO', ...lines(data.excluded).map((line) => `/ ${line}`),
    '', 'ROK', data.timeline || '', '', 'PLAĆANJE', data.paymentTerms || '',
    '', 'UVJETI POČETKA', data.startConditions || '', '', 'IZMJENE I DODATNI RAD', data.changes || '',
    '', data.finalNote || '', '', 'Galeković Design j.d.o.o. / info@galekovic-design.hr / +385 91 939 5377',
  ].filter((line, index, array) => line !== '' || array[index - 1] !== '').join('\n');
}

form.addEventListener('input', updatePreview);
form.addEventListener('change', updatePreview);
document.getElementById('service-preset').addEventListener('change', (event) => applyPreset(event.target.value));
document.getElementById('add-item').addEventListener('click', () => { addItem(); updatePreview(); });
document.getElementById('new-offer').addEventListener('click', () => {
  if (confirm('Otvoriti novu ponudu? Nespremljene promjene neće biti sačuvane.')) resetOffer();
});
document.getElementById('save-offer').addEventListener('click', saveDraft);
document.getElementById('print-offer').addEventListener('click', () => window.print());
document.getElementById('copy-offer').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(offerAsText()); notify('Tekst ponude je kopiran.'); }
  catch { notify('Kopiranje nije uspjelo.'); }
});

resetOffer();
