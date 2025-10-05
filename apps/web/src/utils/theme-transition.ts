export function startThemeTransition(updateFn: () => void) {
  if (!("startViewTransition" in document)) {
    updateFn();
    return;
  }

  const styleId = `theme-transition-${Date.now()}`;
  const style = document.createElement("style");
  style.id = styleId;

  style.textContent = `
      @supports (view-transition-name: root) {
        ::view-transition-old(root) { animation: none; }
        ::view-transition-new(root) {
          animation: circle-blur-expand 0.5s ease-out;
          transform-origin: center;
          filter: blur(0);
        }
        @keyframes circle-blur-expand {
          from { clip-path: circle(0% at 50% 50%); filter: blur(4px); }
          to { clip-path: circle(150% at 50% 50%); filter: blur(0); }
        }
      }
    `;

  document.head.appendChild(style);

  setTimeout(() => style.remove(), 3000);

  document.startViewTransition(updateFn);
}
