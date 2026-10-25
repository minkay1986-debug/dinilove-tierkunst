const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-header nav');
menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
});
document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const category = button.dataset.filter;
    document.querySelectorAll('.empty-work').forEach(card => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
    });
  });
});


// Eigenes Tierporträt: lokale Browser-Vorschau (kein Upload auf einen Server)
(() => {
  const fileInput = document.getElementById('portrait-file');
  const chooseButton = document.getElementById('portrait-upload-button');
  const resetButton = document.getElementById('portrait-reset-button');
  const preview = document.getElementById('portrait-preview');
  const emptyState = document.getElementById('portrait-empty');
  const note = document.getElementById('portrait-storage-note');
  if (!fileInput || !chooseButton || !preview || !emptyState || !resetButton) return;

  const storageKey = 'dinilove-atelier-local-portrait-v1';
  const showImage = (dataUrl) => {
    preview.src = dataUrl;
    preview.hidden = false;
    emptyState.hidden = true;
    resetButton.hidden = false;
    chooseButton.textContent = 'Anderes Porträt auswählen ↗';
  };
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved && saved.startsWith('data:image/')) showImage(saved);
  } catch (_) {
    note.textContent = 'Bildvorschau nur während dieses Besuchs verfügbar.';
  }

  chooseButton.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      note.textContent = 'Bitte eine JPG-, PNG- oder WEBP-Bilddatei auswählen.';
      fileInput.value = '';
      return;
    }
    if (file.size > 1500000) {
      note.textContent = 'Das Bild ist zu groß. Bitte wähle eine Datei unter 1,5 MB.';
      fileInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      showImage(dataUrl);
      try {
        localStorage.setItem(storageKey, dataUrl);
        note.textContent = 'Auf diesem Gerät in diesem Browser gespeichert – noch nicht öffentlich auf der Website.';
      } catch (_) {
        note.textContent = 'Vorschau aktiv, aber Speicherung im Browser nicht möglich.';
      }
    };
    reader.onerror = () => { note.textContent = 'Das Bild konnte nicht gelesen werden. Bitte versuche es erneut.'; };
    reader.readAsDataURL(file);
  });
  resetButton.addEventListener('click', () => {
    preview.removeAttribute('src');
    preview.hidden = true;
    emptyState.hidden = false;
    resetButton.hidden = true;
    chooseButton.textContent = 'Porträt auswählen ↗';
    fileInput.value = '';
    try { localStorage.removeItem(storageKey); } catch (_) {}
    note.textContent = 'Wird nur in diesem Browser gespeichert.';
  });
})();
