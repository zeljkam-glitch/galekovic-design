const toolButtons = [...document.querySelectorAll('[data-tool]')];
const toolPanels = [...document.querySelectorAll('.tool-panel')];

function openTool(id, focus = true) {
  toolButtons.forEach((button) => button.classList.toggle('active', button.dataset.tool === id));
  toolPanels.forEach((panel) => {
    const active = panel.id === id;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
    if (active && focus) panel.focus({ preventScroll: true });
  });
  history.replaceState(null, '', `#${id}`);
}

toolButtons.forEach((button) => button.addEventListener('click', () => openTool(button.dataset.tool)));
const initialTool = location.hash.slice(1);
if (toolPanels.some((panel) => panel.id === initialTool)) openTool(initialTool, false);

function makeResult(container, title, lines, emailBody = '') {
  container.replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = title;
  container.appendChild(heading);
  lines.filter(Boolean).forEach((line) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    container.appendChild(paragraph);
  });
  const actions = document.createElement('div');
  actions.className = 'result-actions';
  if (emailBody) {
    const email = document.createElement('a');
    email.textContent = 'Pošaljite Jeleni ↗';
    email.href = `mailto:info@galekovic-design.hr?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(emailBody)}`;
    actions.appendChild(email);
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = 'Kopirajte sažetak';
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(emailBody);
        copy.textContent = 'Kopirano ✓';
      } catch {
        copy.textContent = 'Označite tekst ručno';
      }
    });
    actions.appendChild(copy);
  }
  if (actions.children.length) container.appendChild(actions);
  container.hidden = false;
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

const serviceCopy = {
  concept: {
    name: 'Koncept interijera',
    text: 'Projektu je prije svega potreban jasan raspored, vizualni smjer i paleta materijala. Izvedbu je nakon toga moguće organizirati samostalno.',
  },
  furniture: {
    name: 'Interijer + namještaj po mjeri',
    text: 'Projekt traži cjelovitu razradu interijera i precizno razvijen namještaj po mjeri, ali ne nužno vođenje svih radova do završetka.',
  },
  complete: {
    name: 'Cjelovit interijer',
    text: 'Projektu odgovara povezan proces od dizajna i tehničke razrade do proizvodnje, koordinacije izvođača i završne kontrole.',
  },
};

document.getElementById('recommendation-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const scores = { concept: 0, furniture: 0, complete: 0 };
  ['stage', 'custom', 'delivery'].forEach((key) => { scores[data.get(key)] += 1; });
  const recommendation = Object.entries(scores).sort((a, b) => b[1] - a[1] || ['concept', 'furniture', 'complete'].indexOf(b[0]) - ['concept', 'furniture', 'complete'].indexOf(a[0]))[0][0];
  const result = serviceCopy[recommendation];
  const body = `Preporučena usluga: ${result.name}\n\n${result.text}\n\nŽelim provjeriti odgovara li ova usluga mojem projektu.`;
  makeResult(document.getElementById('recommendation-result'), result.name, [result.text, 'Preporuka je početna. Konačan opseg definira se nakon pregleda tlocrta i razgovora.'], body);
});

const needSelector = document.getElementById('need-selector');
const packageArticles = [...document.querySelectorAll('.comparison article')];
const comparisonNote = document.getElementById('comparison-note');
needSelector.addEventListener('change', () => {
  const selected = [...needSelector.querySelectorAll('input:checked')].map((input) => input.value);
  let recommendation = '';
  if (selected.some((item) => ['coordination', 'delivery'].includes(item))) recommendation = 'complete';
  else if (selected.some((item) => ['custom', 'technical'].includes(item))) recommendation = 'furniture';
  else if (selected.length) recommendation = 'concept';
  packageArticles.forEach((article) => article.classList.toggle('recommended', article.dataset.package === recommendation));
  comparisonNote.textContent = recommendation ? `Najbliži odabranom opsegu: ${serviceCopy[recommendation].name}.` : 'Označite barem jednu potrebu.';
});

document.getElementById('furniture-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const elements = data.getAll('elements');
  const lines = [
    `Prostorija: ${data.get('room')}`,
    `Približne dimenzije: ${data.get('dimensions') || 'nisu unesene'}`,
    `Elementi: ${elements.length ? elements.join(', ') : 'potrebno definirati'}`,
    `Uređaji i tehnički zahtjevi: ${data.get('appliances') || 'nisu uneseni'}`,
    `Navike i posebne potrebe: ${data.get('needs') || 'nisu unesene'}`,
  ];
  makeResult(document.getElementById('furniture-result'), 'Početni popis namještaja', ['Ovaj popis nije nacrt ni ponuda. Daje dobru osnovu za prvi razgovor i tehničku razradu.'], lines.join('\n'));
});

document.getElementById('project-brief-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const fileNames = [...form.elements.files.files].map((file) => file.name);
  const lines = [
    `Vrsta prostora: ${data.get('space')}`,
    `Lokacija i kvadratura: ${data.get('location')}`,
    `Faza projekta: ${data.get('stage')}`,
    `Željeni početak: ${data.get('start') || 'nije naveden'}`,
    `Najvažnije potrebe: ${data.get('needs')}`,
    `Odabrane datoteke: ${fileNames.length ? fileNames.join(', ') : 'nema'}`,
    '',
    'Napomena: tlocrt i fotografije dodat ću kao privitak u emailu.',
  ];
  makeResult(document.getElementById('project-brief-result'), 'Projektni brief je spreman', ['Sažetak možete kopirati ili otvoriti kao pripremljen email. Odabrane datoteke zbog privatnosti ostaju samo na vašem uređaju.'], lines.join('\n'));
});

document.getElementById('hospitality-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const lines = [
    `Tip objekta: ${data.get('property')}`,
    `Kapacitet: ${data.get('capacity')}`,
    `Planirano otvaranje: ${data.get('opening') || 'nije navedeno'}`,
    `Faza projekta: ${data.get('stage')}`,
    `Profil gosta i doživljaj: ${data.get('guest') || 'nije uneseno'}`,
    `Operativni zahtjevi: ${data.get('operations') || 'nisu uneseni'}`,
  ];
  makeResult(document.getElementById('hospitality-result'), 'Hospitality brief je spreman', ['Dobar početni brief povezuje identitet prostora s kapacitetom, operativnim potrebama i rokom otvaranja.'], lines.join('\n'));
});

const budgetTotal = document.getElementById('budget-total');
const budgetInputs = [...document.querySelectorAll('#budget-sliders input')];
const budgetStatus = document.getElementById('budget-status');
const budgetBreakdown = document.getElementById('budget-breakdown');
const currency = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

function updateBudget() {
  const total = Number(budgetTotal.value) || 0;
  const percentTotal = budgetInputs.reduce((sum, input) => sum + Number(input.value), 0);
  budgetInputs.forEach((input) => { input.previousElementSibling.querySelector('b').textContent = `${input.value}%`; });
  budgetStatus.textContent = percentTotal === 100 ? 'Raspodjela je uravnotežena: ukupno 100%.' : `Trenutačna raspodjela iznosi ${percentTotal}%. Prilagodite kategorije do ukupno 100%.`;
  budgetStatus.classList.toggle('invalid', percentTotal !== 100);
  budgetBreakdown.replaceChildren();
  budgetInputs.forEach((input) => {
    const article = document.createElement('article');
    const amount = document.createElement('b');
    amount.textContent = currency.format(total * Number(input.value) / 100);
    const label = document.createElement('span');
    label.textContent = input.dataset.label;
    article.append(amount, label);
    budgetBreakdown.appendChild(article);
  });
}

budgetTotal.addEventListener('input', updateBudget);
budgetInputs.forEach((input) => input.addEventListener('input', updateBudget));
updateBudget();
document.getElementById('year').textContent = new Date().getFullYear();
