const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-header nav');
menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
});

async function loadPublicGallery() {
  const grid = document.querySelector('#gallery-grid');
  const count = document.querySelector('#gallery-count');
  if (!grid) return;
  try {
    const response = await fetch('https://dinilove-admin-api-v2.minkay1986.workers.dev/public/gallery', {
      headers: { Accept: 'application/json' }
    });
    const data = await response.json();
    if (!response.ok || !data.ok || !Array.isArray(data.assets)) throw new Error('gallery-unavailable');
    count.textContent = String(data.assets.length).padStart(2, '0');
    grid.replaceChildren();
    if (data.assets.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'gallery-loading';
      empty.textContent = 'Neue Originalwerke werden hier veröffentlicht, sobald sie im Atelier hochgeladen wurden.';
      grid.append(empty);
      return;
    }
    data.assets.forEach((asset, index) => {
      const card = document.createElement('article');
      card.className = 'public-work';
      const link = document.createElement('a');
      link.className = 'public-work-image';
      link.href = asset.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'Originalwerk in voller Größe öffnen');
      const image = document.createElement('img');
      image.src = asset.url;
      image.alt = 'Originale Tierkunst aus dem DiniLove-Atelier';
      image.loading = index < 3 ? 'eager' : 'lazy';
      image.decoding = 'async';
      link.append(image);
      const info = document.createElement('div');
      info.className = 'work-info';
      const text = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = 'Aus dem Atelier';
      const subtitle = document.createElement('p');
      subtitle.textContent = 'Original · Tierkunst';
      text.append(title, subtitle);
      const number = document.createElement('span');
      number.className = 'work-number';
      number.textContent = String(index + 1).padStart(2, '0');
      info.append(text, number);
      card.append(link, info);
      grid.append(card);
    });
  } catch {
    if (count) count.textContent = '–';
    grid.replaceChildren();
    const error = document.createElement('p');
    error.className = 'gallery-loading';
    error.textContent = 'Die Galerie ist gerade nicht erreichbar. Bitte später erneut versuchen.';
    grid.append(error);
  }
}
loadPublicGallery();
