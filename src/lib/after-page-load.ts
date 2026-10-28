/** Give page resources priority before starting optional third-party code. */
export function afterPageLoadAndIdle(): Promise<void> {
  return new Promise(resolve => {
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => resolve(), { timeout: 1000 });
      else window.setTimeout(resolve, 0);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
  });
}
