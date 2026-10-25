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


/* Öffnet nur die Vorschau; echte Konten werden erst nach Einrichtung sicherer Anmeldung aktiviert. */
const privateModal = document.querySelector('#private-modal');
const modalBackdrop = document.querySelector('.modal-backdrop');
const openPrivate = document.querySelector('.secret-heart');
const closePrivate = document.querySelector('.modal-close');
const modalOk = document.querySelector('.modal-ok');
function showPrivateModal() {
  if (!privateModal || !modalBackdrop) return;
  privateModal.hidden = false;
  modalBackdrop.hidden = false;
  closePrivate?.focus();
}
function hidePrivateModal() {
  if (!privateModal || !modalBackdrop) return;
  privateModal.hidden = true;
  modalBackdrop.hidden = true;
  openPrivate?.focus();
}
openPrivate?.addEventListener('click', showPrivateModal);
closePrivate?.addEventListener('click', hidePrivateModal);
modalOk?.addEventListener('click', hidePrivateModal);
modalBackdrop?.addEventListener('click', hidePrivateModal);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && privateModal && !privateModal.hidden) hidePrivateModal();
});
