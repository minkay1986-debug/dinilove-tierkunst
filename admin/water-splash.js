/**
 * DiniLove admin-only water splash Easter egg.
 *
 * This module is intentionally NOT imported by the public gallery.
 * The authenticated admin UI may dispatch "dinilove:upload-success" only
 * after the server confirms an image upload succeeded.
 */
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

export function playWaterSplash(root = document.querySelector("[data-admin-surface]")) {
  if (!root || reducedMotion.matches) return;
  const old = root.querySelector(".admin-water-splash");
  old?.remove();

  const splash = document.createElement("div");
  splash.className = "admin-water-splash";
  splash.setAttribute("aria-hidden", "true");
  splash.innerHTML = `
    <span class="water-impact"></span>
    <span class="water-drop drop-1"></span>
    <span class="water-drop drop-2"></span>
    <span class="water-drop drop-3"></span>
    <span class="water-drop drop-4"></span>
    <span class="water-drop drop-5"></span>
    <span class="water-trail trail-1"></span>
    <span class="water-trail trail-2"></span>
    <span class="water-trail trail-3"></span>
    <span class="water-trail trail-4"></span>
    <span class="water-trail trail-5"></span>
  `;
  root.append(splash);
  splash.addEventListener("animationend", (event) => {
    if (event.target === splash) splash.remove();
  }, { once: true });
  window.setTimeout(() => splash.remove(), 1250);
}

window.addEventListener("dinilove:upload-success", () => {
  // The event must only be dispatched by the authenticated admin UI after
  // a successful server response. Upload failures must never dispatch it.
  playWaterSplash();
});
