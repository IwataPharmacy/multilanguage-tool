import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = document.getElementById("root") || (() => {
  const r = document.createElement("div");
  r.id = "root";
  document.body.appendChild(r);
  return r;
})();

createRoot(root).render(<App />);

// PWA登録
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  });
}
