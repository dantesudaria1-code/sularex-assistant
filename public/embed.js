/* SULAREX Solar Assistant — embed on sularex.com
   Usage: host this app on Vercel, then add ONE line before </body> on sularex.com:
   <script src="https://YOUR-VERCEL-APP.vercel.app/embed.js" defer></script>
   Optionally set the app URL explicitly:
   <script src=".../embed.js" data-app="https://YOUR-VERCEL-APP.vercel.app" defer></script>
*/
(function () {
  var cur = document.currentScript;
  var APP = (cur && cur.getAttribute("data-app")) ||
    (cur && cur.src ? cur.src.replace(/\/embed\.js.*$/, "") : "");
  if (document.getElementById("sx-assistant-launcher")) return;

  var btn = document.createElement("button");
  btn.id = "sx-assistant-launcher";
  btn.setAttribute("aria-label", "Ask about solar");
  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1300" stroke-width="2.2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  btn.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:2147483000;width:60px;height:60px;border:none;border-radius:50%;cursor:pointer;background:linear-gradient(135deg,#f8cb4d,#e3a81b);box-shadow:0 12px 30px -8px rgba(0,0,0,.5);display:grid;place-items:center";

  var frame = document.createElement("iframe");
  frame.title = "SULAREX Solar Assistant";
  frame.src = APP + "/widget";
  frame.style.cssText = "position:fixed;bottom:92px;right:20px;z-index:2147483000;width:400px;height:620px;max-width:calc(100vw - 32px);max-height:80vh;border:none;border-radius:18px;box-shadow:0 24px 60px -20px rgba(0,0,0,.6);display:none;background:#070f1d";

  function isMobile() { return window.matchMedia("(max-width:640px)").matches; }
  function size() {
    if (isMobile()) {
      frame.style.cssText = "position:fixed;inset:0;z-index:2147483000;width:100%;height:100%;border:none;border-radius:0;display:" + (frame.dataset.open === "1" ? "block" : "none") + ";background:#070f1d";
    }
  }
  var open = false;
  btn.addEventListener("click", function () {
    open = !open; frame.dataset.open = open ? "1" : "0";
    frame.style.display = open ? "block" : "none"; size();
    btn.style.display = open && isMobile() ? "none" : "grid";
  });
  window.addEventListener("message", function (e) {
    if (e && e.data === "sx-close") { open = false; frame.style.display = "none"; btn.style.display = "grid"; }
  });
  document.body.appendChild(frame);
  document.body.appendChild(btn);
})();
