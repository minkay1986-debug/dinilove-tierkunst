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

    // Use the first uploaded original in the large hero frame as well as the gallery.
    const heroPlaceholder = document.querySelector('.hero-art .art-placeholder');
    if (heroPlaceholder && data.assets.length > 0) {
      const heroLink = document.createElement('a');
      heroLink.href = data.assets[0].url;
      heroLink.target = '_blank';
      heroLink.rel = 'noopener noreferrer';
      heroLink.setAttribute('aria-label', 'Originalwerk in voller Größe öffnen');
      heroLink.style.display = 'block';
      const heroImage = document.createElement('img');
      heroImage.src = data.assets[0].url;
      heroImage.alt = 'Originale Tierkunst aus dem DiniLove-Atelier';
      heroImage.loading = 'eager';
      heroImage.decoding = 'async';
      heroImage.style.width = '100%';
      heroImage.style.height = '100%';
      heroImage.style.objectFit = 'contain';
      heroImage.style.display = 'block';
      heroLink.append(heroImage);
      heroPlaceholder.replaceWith(heroLink);
      heroLink.style.aspectRatio = '4 / 4.4';
      heroLink.style.background = '#f3eee4';
      heroLink.style.overflow = 'hidden';
    }

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
const contactForm = document.querySelector('#contact-form');
contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = document.querySelector('#contact-submit');
  const result = document.querySelector('#contact-result');
  button.disabled = true;
  button.textContent = 'Wird gesendet …';
  result.textContent = '';
  result.classList.remove('is-error');
  try {
    const formData = new FormData(contactForm);
    const response = await fetch('https://dinilove-admin-api-v2.minkay1986.workers.dev/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        message: String(formData.get('message') || '').trim()
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.error || 'Die Nachricht konnte nicht gesendet werden.');
    contactForm.reset();
    result.textContent = 'Danke! Deine Nachricht wurde übermittelt.';
  } catch (error) {
    result.textContent = error.message || 'Das Senden hat leider nicht geklappt. Bitte versuche es später erneut.';
    result.classList.add('is-error');
  } finally {
    button.disabled = false;
    button.innerHTML = 'Nachricht senden <span aria-hidden="true">↗</span>';
  }
});

loadPublicGallery();
