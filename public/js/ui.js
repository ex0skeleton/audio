/** Shared DOM, notification, and download helpers. */
export const $ = (selector) => document.querySelector(selector);

export function toast(t) {
  $("#toast").textContent = t;
  $("#toast").hidden = false;
  setTimeout(() => ($("#toast").hidden = true), 4000);
}
export function status(t) {
  $("#status").textContent = t;
}
export function save(blob, name) {
  let u = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 30000);
}
