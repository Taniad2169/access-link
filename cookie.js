/*
 * WebSwan Cookie Consent v1.0.0
 * Accept / Reject / Do Not Sell or Share banner with a preferences panel.
 * Important: this banner helps a website owner collect and honor privacy choices.
 * It does not certify or guarantee compliance with any privacy law.
 */
(function () {
  "use strict";

  if (window.__webswanCookieLoaded) return;
  window.__webswanCookieLoaded = true;

  var script = document.currentScript;
  var ds = (script && script.dataset) || {};
  var options = {
    color: ds.color || "#339cde",
    position: ds.position === "right" ? "right" : "left",
    company: ds.company || "This website",
    privacyUrl: ds.privacyUrl || "",
    contactEmail: ds.contactEmail || "",
    showButton: ds.showButton !== "false",
    branding: ds.branding !== "false",
    storageKey: ds.storageKey || "webswan-cookie-consent-v1",
    expiresDays: Math.max(30, Math.min(395, parseInt(ds.expiresDays, 10) || 365))
  };
  if (!window.CSS || !CSS.supports("color", options.color)) options.color = "#339cde";

  var HOST_ID = "webswan-cookie-consent";
  var CATEGORIES = [
    { key: "necessary", title: "Strictly necessary", locked: true,
      text: "Needed for the website to work, for example security, page loading and remembering these privacy choices. These cannot be turned off." },
    { key: "functional", title: "Functional",
      text: "Remember things like your language, chat widgets and embedded videos or maps." },
    { key: "analytics", title: "Analytics",
      text: "Help the owner understand how visitors use the site, for example page views and traffic sources." },
    { key: "marketing", title: "Marketing and targeted advertising",
      text: "Used by advertising partners to show you ads based on your browsing, here and on other websites." },
    { key: "sale", title: "Sale or sharing of my personal information",
      text: "Allows information collected by cookies and similar technologies to be sold to or shared with third parties for advertising. Turn this off to opt out." }
  ];
  var gpc = navigator.globalPrivacyControl === true;
  var consent = loadConsent();
  var host, root, lastFocused = null;

  /* ---------- storage ---------- */
  function loadConsent() {
    try {
      var saved = JSON.parse(localStorage.getItem(options.storageKey) || "null");
      if (!saved || saved.v !== 1) return null;
      if (saved.expires && Date.now() > saved.expires) return null;
      if (gpc && (saved.sale || saved.marketing)) { saved.sale = false; saved.marketing = false; saved.gpc = true; }
      return saved;
    } catch (e) { return null; }
  }

  function saveConsent(choice, method) {
    consent = {
      v: 1,
      necessary: true,
      functional: !!choice.functional,
      analytics: !!choice.analytics,
      marketing: gpc ? false : !!choice.marketing,
      sale: gpc ? false : !!choice.sale,
      method: method,
      gpc: gpc,
      ts: Date.now(),
      expires: Date.now() + options.expiresDays * 864e5
    };
    try { localStorage.setItem(options.storageKey, JSON.stringify(consent)); } catch (e) { /* private mode */ }
    try {
      var summary = ["f", "a", "m", "s"].map(function (k, i) {
        return k + (consent[["functional", "analytics", "marketing", "sale"][i]] ? "1" : "0");
      }).join(".");
      document.cookie = "ws_consent=" + summary + ";path=/;max-age=" + options.expiresDays * 86400 + ";SameSite=Lax" + (location.protocol === "https:" ? ";Secure" : "");
    } catch (e) { /* cookies blocked */ }
    applyConsent();
    try { window.dispatchEvent(new CustomEvent("webswan:consent", { detail: getConsent() })); } catch (e) { /* old browser */ }
  }

  function getConsent() {
    return consent ? JSON.parse(JSON.stringify(consent)) : null;
  }

  /* ---------- enforcement ---------- */
  function setupConsentModeDefaults() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") window.gtag = function () { window.dataLayer.push(arguments); };
    var c = consent || { functional: false, analytics: false, marketing: false, sale: false };
    window.gtag("consent", "default", consentModeValues(c, true));
  }

  function consentModeValues(c, isDefault) {
    var ads = c.marketing && c.sale ? "granted" : "denied";
    var v = {
      ad_storage: ads,
      ad_user_data: ads,
      ad_personalization: ads,
      analytics_storage: c.analytics ? "granted" : "denied",
      functionality_storage: c.functional ? "granted" : "denied",
      personalization_storage: c.functional ? "granted" : "denied",
      security_storage: "granted"
    };
    if (isDefault) v.wait_for_update = 500;
    return v;
  }

  function allowed(category) {
    if (!consent) return category === "necessary";
    if (category === "marketing") return consent.marketing && consent.sale;
    return !!consent[category];
  }

  function applyConsent() {
    if (!consent) return;
    try { window.gtag("consent", "update", consentModeValues(consent, false)); } catch (e) { /* ignore */ }
    try { window.dataLayer.push({ event: "webswan_consent_update", webswan_consent: getConsent() }); } catch (e) { /* ignore */ }
    try { if (typeof window.fbq === "function") window.fbq("consent", allowed("marketing") ? "grant" : "revoke"); } catch (e) { /* ignore */ }
    try { if (allowed("marketing") === false && window.uetq && window.uetq.push) window.uetq.push("consent", "update", { ad_storage: "denied" }); } catch (e) { /* ignore */ }
    if (consent.sale === false) {
      try { window.__uspapi = window.__uspapi || function (cmd, ver, cb) { if (cmd === "getUSPData" && typeof cb === "function") cb({ version: 1, uspString: "1YYN" }, true); }; } catch (e) { /* ignore */ }
    }
    activateBlocked();
  }

  // Scripts or iframes the owner tags with data-cookie-category stay off until the visitor allows them:
  // <script type="text/plain" data-cookie-category="analytics" src="..."></script>
  // <iframe data-src="..." data-cookie-category="functional"></iframe>
  function activateBlocked() {
    var nodes = document.querySelectorAll("script[type='text/plain'][data-cookie-category],iframe[data-cookie-category][data-src]");
    Array.prototype.forEach.call(nodes, function (node) {
      if (!allowed(node.getAttribute("data-cookie-category"))) return;
      if (node.tagName === "IFRAME") { node.src = node.getAttribute("data-src"); node.removeAttribute("data-src"); return; }
      var fresh = document.createElement("script");
      Array.prototype.forEach.call(node.attributes, function (a) { if (a.name !== "type") fresh.setAttribute(a.name, a.value); });
      fresh.type = node.getAttribute("data-type") || "text/javascript";
      if (!node.src) fresh.text = node.text;
      node.parentNode.replaceChild(fresh, node);
    });
  }

  /* ---------- user interface ---------- */
  function start() {
    if (document.getElementById(HOST_ID)) return;
    if (consent) applyConsent();
    buildUI();
    if (!consent) showBanner(); else if (options.showButton) showReopen();
    document.addEventListener("click", function (event) {
      var t = event.target && event.target.closest ? event.target.closest("[data-webswan-cookie-settings],a[href='#cookie-settings'],a[href='#do-not-sell']") : null;
      if (t) { event.preventDefault(); openPanel(t.getAttribute("href") === "#do-not-sell" ? "dns" : ""); }
    });
  }

  function buildUI() {
    host = document.createElement("div");
    host.id = HOST_ID;
    host.setAttribute("data-position", options.position);
    host.style.setProperty("--wsc-accent", options.color);
    host.style.position = "fixed";
    host.style.zIndex = "2147483646";
    host.style.left = "0";
    host.style.right = "0";
    host.style.bottom = "0";
    host.style.height = "0";
    host.style.fontSize = "16px";
    root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
    root.innerHTML = markup();
    document.body.appendChild(host);

    on("accept-all", function () { saveConsent(all(true), "accept"); hideBanner(); announce("All cookies accepted"); });
    on("reject-all", function () { saveConsent(all(false), "reject"); hideBanner(); announce("Optional cookies rejected"); });
    on("dns-open", function () { openPanel("dns"); });
    on("customize", function () { openPanel(""); });
    on("reopen", function () { openPanel(""); });
    on("close", closePanel);
    on("p-accept", function () { saveConsent(all(true), "accept"); closePanel(); hideBanner(); announce("All cookies accepted"); });
    on("p-reject", function () { saveConsent(all(false), "reject"); closePanel(); hideBanner(); announce("Optional cookies rejected"); });
    on("save", function () {
      var choice = {};
      Array.prototype.forEach.call(root.querySelectorAll("input[data-cat]"), function (input) { choice[input.getAttribute("data-cat")] = input.checked; });
      saveConsent(choice, "custom");
      closePanel(); hideBanner();
      announce("Your privacy choices were saved");
    });
    window.addEventListener("resize", syncBannerHeight);
    root.getElementById("overlay").addEventListener("click", function (event) { if (event.target.id === "overlay") closePanel(); });
    document.addEventListener("keydown", function (event) {
      var panel = root.getElementById("overlay");
      if (panel.hidden) return;
      if (event.key === "Escape") closePanel();
      if (event.key === "Tab") trapFocus(event);
    });
  }

  function on(id, fn) { root.getElementById(id).addEventListener("click", fn); }
  function all(value) { return { functional: value, analytics: value, marketing: value, sale: value }; }

  // Tell the WebSwan ADA button (if installed) how tall the banner is so it can float above it.
  function syncBannerHeight() {
    var banner = root.getElementById("banner"), html = document.documentElement;
    if (banner.hidden) { html.removeAttribute("data-wsc-banner"); return; }
    html.setAttribute("data-wsc-banner", "open");
    html.style.setProperty("--wsc-banner-h", banner.offsetHeight + "px");
  }
  function showBanner() {
    root.getElementById("banner").hidden = false;
    root.getElementById("reopen").hidden = true;
    syncBannerHeight();
  }
  function hideBanner() {
    root.getElementById("banner").hidden = true;
    if (options.showButton) showReopen();
    syncBannerHeight();
  }
  function showReopen() { root.getElementById("reopen").hidden = false; }

  function openPanel(mode) {
    lastFocused = document.activeElement;
    var c = consent || { functional: false, analytics: false, marketing: false, sale: false };
    if (!consent && !mode) c = { functional: true, analytics: true, marketing: true, sale: true };
    if (mode === "dns") c = { functional: c.functional, analytics: c.analytics, marketing: false, sale: false };
    Array.prototype.forEach.call(root.querySelectorAll("input[data-cat]"), function (input) {
      var key = input.getAttribute("data-cat");
      input.checked = !!c[key];
      if (gpc && (key === "sale" || key === "marketing")) { input.checked = false; input.disabled = true; }
    });
    root.getElementById("dns-note").hidden = mode !== "dns";
    root.getElementById("overlay").hidden = false;
    document.documentElement.setAttribute("data-wsc-modal", "open");
    root.getElementById("close").focus();
  }

  function closePanel() {
    root.getElementById("overlay").hidden = true;
    document.documentElement.removeAttribute("data-wsc-modal");
    if (!consent) { showBanner(); root.getElementById("accept-all").focus(); return; }
    if (lastFocused && typeof lastFocused.focus === "function" && lastFocused !== document.body) lastFocused.focus();
  }

  function trapFocus(event) {
    var dialog = root.getElementById("panel");
    var list = Array.prototype.slice.call(dialog.querySelectorAll("button,a[href],input:not([disabled])"));
    if (!list.length) return;
    var first = list[0], last = list[list.length - 1];
    var active = root.activeElement || document.activeElement;
    if (event.shiftKey && active === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
  }

  function announce(message) {
    var region = root.getElementById("announcer");
    region.textContent = "";
    window.setTimeout(function () { region.textContent = message; }, 30);
  }

  function markup() {
    var links = "";
    if (safeUrl(options.privacyUrl)) links += '<a href="' + escapeHtml(options.privacyUrl) + '" target="_blank" rel="noopener">Privacy policy</a>';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(options.contactEmail)) links += '<a href="mailto:' + escapeHtml(options.contactEmail) + '?subject=Privacy%20request">Contact us about privacy</a>';
    var gpcNote = gpc ? '<p class="gpc">We detected a Global Privacy Control signal from your browser, so the sale and sharing of your information and targeted advertising are already turned off.</p>' : "";
    var rows = CATEGORIES.map(function (c) {
      var id = "cat-" + c.key;
      return '<div class="row"><div class="row-text"><label for="' + id + '"><strong>' + c.title + '</strong></label><p id="' + id + '-d">' + c.text + '</p></div>' +
        (c.locked ? '<span class="always">Always on</span>' :
          '<label class="switch"><input type="checkbox" role="switch" id="' + id + '" data-cat="' + c.key + '" aria-describedby="' + id + '-d"><span class="slider" aria-hidden="true"></span></label>') +
        '</div>';
    }).join("");
    return '<style>' + css() + '</style>' +
      '<section id="banner" class="banner" role="region" aria-label="Cookie consent" hidden>' +
        '<div class="banner-text"><p class="eyebrow">YOUR PRIVACY</p><p><strong>' + escapeHtml(options.company) + ' uses cookies.</strong> We use cookies and similar technologies to run this site, understand traffic and, with your permission, for advertising. You can accept, reject, or choose what to share. ' +
        (safeUrl(options.privacyUrl) ? '<a href="' + escapeHtml(options.privacyUrl) + '" target="_blank" rel="noopener">Privacy policy</a>' : '') + '</p>' + gpcNote + '</div>' +
        '<div class="actions"><button id="accept-all" class="btn primary" type="button">Accept all</button><button id="reject-all" class="btn" type="button">Reject all</button>' +
        '<button id="customize" class="btn" type="button">Choose what to share</button><button id="dns-open" class="link" type="button">Do Not Sell or Share My Personal Information</button></div>' +
      '</section>' +
      '<button id="reopen" class="reopen" type="button" aria-label="Privacy and cookie settings" hidden><span aria-hidden="true">\ud83c\udf6a</span></button>' +
      '<div id="overlay" class="overlay" hidden><section id="panel" class="panel" role="dialog" aria-modal="true" aria-labelledby="p-title">' +
        '<header class="header"><div><p class="eyebrow">PRIVACY CENTER</p><h2 id="p-title">Your privacy choices</h2></div><button id="close" class="icon" type="button" aria-label="Close privacy choices">\u00d7</button></header>' +
        '<div class="content">' +
          '<div id="dns-note" class="dns" hidden><strong>Do Not Sell or Share My Personal Information</strong><p>Depending on where you live (for example California, Colorado, Connecticut, Virginia, Texas, Oregon and other states), you have the right to opt out of the sale or sharing of your personal information and of targeted advertising. We have turned off <b>Marketing</b> and <b>Sale or sharing</b> below. Press <b>Save and close</b> to confirm.</p></div>' +
          '<p class="intro">Choose which information you allow this website to collect and share. Your choices are saved on this browser and device only. If you clear your cookies or use a different browser or device, you will be asked again. You can change your mind at any time with the cookie button.</p>' +
          gpcNote + rows +
          (links ? '<div class="links">' + links + '</div>' : '') +
        '</div>' +
        '<footer class="footer"><button id="p-reject" class="btn" type="button">Reject all</button><button id="p-accept" class="btn" type="button">Accept all</button><button id="save" class="btn primary" type="button">Save and close</button></footer>' +
        (options.branding ? '<p class="brand">Privacy center by <a href="https://webswandigitalsolutions.com" target="_blank" rel="noopener">WebSwan Digital Solutions</a></p>' : '') +
      '</section></div>' +
      '<div id="announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>';
  }

  function css() {
    return [
      ":host{--accent:#339cde;all:initial;color-scheme:light;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.45}",
      "*{box-sizing:border-box}",
      "button,a,input{font:inherit}",
      "a{color:#0b5c94;font-weight:700;text-underline-offset:2px}",
      "button:focus-visible,a:focus-visible,input:focus-visible+.slider{outline:3px solid #ffbf47;outline-offset:3px}",
      ".eyebrow{color:var(--wsc-accent,var(--accent));font-size:10px;font-weight:800;letter-spacing:.16em;margin:0 0 4px}",
      ".banner{background:#fff;border:1px solid #d7deea;border-radius:16px;bottom:max(16px,env(safe-area-inset-bottom));box-shadow:0 18px 50px rgba(15,23,42,.28);color:#172033;display:flex;flex-wrap:wrap;gap:14px 22px;left:50%;max-width:1040px;padding:18px 20px;position:fixed;transform:translateX(-50%);width:calc(100% - 28px)}",
      ".banner[hidden],.overlay[hidden],.reopen[hidden],.dns[hidden]{display:none}",
      ".banner-text{flex:1 1 420px;font-size:14px}.banner-text p{margin:0}.banner-text .eyebrow{margin-bottom:4px}",
      ".actions{align-items:center;display:flex;flex:1 1 360px;flex-wrap:wrap;gap:8px;justify-content:flex-end}",
      ".btn{background:#fff;border:2px solid #9fb0c8;border-radius:10px;color:#172033;cursor:pointer;font-size:14px;font-weight:800;min-height:44px;padding:9px 16px}",
      ".btn:hover{border-color:var(--wsc-accent,var(--accent))}",
      ".btn.primary{background:var(--wsc-accent,var(--accent));border-color:var(--wsc-accent,var(--accent));color:#fff}",
      ".btn.primary:hover{filter:brightness(.92)}",
      ".link{background:none;border:0;color:#0b5c94;cursor:pointer;flex-basis:100%;font-size:13px;font-weight:800;padding:4px 2px;text-align:right;text-decoration:underline;text-underline-offset:2px}",
      ".gpc{background:#e9f7ee;border:1px solid #9ad3ad;border-radius:10px;color:#17502b;font-size:13px;margin:10px 0 0!important;padding:8px 10px}",
      ".reopen{align-items:center;background:var(--wsc-accent,var(--accent));border:3px solid #fff;border-radius:50%;bottom:max(20px,env(safe-area-inset-bottom));box-shadow:0 8px 24px rgba(15,23,42,.3);cursor:pointer;display:flex;font-size:24px;height:52px;justify-content:center;padding:0;position:fixed;width:52px}",
      ":host([data-position='left']) .reopen{left:max(20px,env(safe-area-inset-left))}",
      ":host([data-position='right']) .reopen{right:max(20px,env(safe-area-inset-right))}",
      ".reopen:hover{transform:translateY(-2px)}",
      ".overlay{align-items:center;background:rgba(8,20,36,.62);display:flex;inset:0;justify-content:center;padding:14px;position:fixed}",
      ".panel{background:#fff;border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.35);color:#172033;display:flex;flex-direction:column;max-height:min(720px,calc(100vh - 28px));overflow:hidden;width:min(560px,100%)}",
      ".header{align-items:flex-start;background:linear-gradient(135deg,var(--wsc-accent,var(--accent)),#0c2d6b);color:#fff;display:flex;justify-content:space-between;padding:18px 20px}",
      ".header .eyebrow{color:#fff;opacity:.85}",
      "h2{font-size:21px;line-height:1.2;margin:0}",
      ".icon{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.4);border-radius:9px;color:#fff;cursor:pointer;font-size:26px;height:38px;line-height:1;padding:0;width:38px}",
      ".content{overflow:auto;padding:16px 20px}",
      ".intro{color:#4a5568;font-size:13px;margin:0 0 6px}",
      ".dns{background:#fff7db;border:1px solid #efcf67;border-radius:12px;color:#463b17;font-size:13px;margin-bottom:12px;padding:12px 14px}.dns p{margin:6px 0 0}",
      ".row{align-items:center;border-bottom:1px solid #e6eaf0;display:flex;gap:14px;justify-content:space-between;padding:12px 0}",
      ".row-text{flex:1}.row-text strong{font-size:14px}.row-text p{color:#5f6b7c;font-size:12px;margin:3px 0 0}",
      ".always{color:#17502b;font-size:12px;font-weight:800;white-space:nowrap}",
      ".switch{cursor:pointer;display:inline-block;flex:0 0 auto;height:28px;position:relative;width:50px}",
      ".switch input{height:100%;margin:0;opacity:0;position:absolute;width:100%;cursor:pointer;z-index:1}",
      ".slider{background:#b8c2d1;border-radius:28px;inset:0;position:absolute;transition:background .15s}",
      ".slider:before{background:#fff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.3);content:'';height:22px;left:3px;position:absolute;top:3px;transition:transform .15s;width:22px}",
      ".switch input:checked+.slider{background:var(--wsc-accent,var(--accent))}",
      ".switch input:checked+.slider:before{transform:translateX(22px)}",
      ".switch input:disabled+.slider{opacity:.5}",
      ".links{display:flex;flex-wrap:wrap;font-size:12px;gap:6px 16px;padding-top:12px}",
      ".footer{border-top:1px solid #e6eaf0;display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;padding:14px 20px}",
      ".brand{color:#8a94a6;font-size:10px;margin:0;padding:0 20px 10px;text-align:right}.brand a{color:#8a94a6;font-weight:600}",
      ".sr-only{clip:rect(0,0,0,0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;white-space:nowrap;width:1px}",
      "@media(max-width:600px){.banner{padding:14px}.actions{justify-content:stretch}.actions .btn{flex:1 1 45%}.link{text-align:center}.footer .btn{flex:1 1 100%}}"
    ].join("\n");
  }

  function safeUrl(value) {
    if (!value) return false;
    try { var u = new URL(value, location.href); return u.protocol === "https:" || u.protocol === "http:"; } catch (e) { return false; }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c];
    });
  }

  /* ---------- WebSwan license check and install report ---------- */
  // Sends only this website's address and page path (never anything about the visitor), at most once a day per browser.
  function licenseCheck(product, onBlocked) {
    var hostName = String(location.hostname || "").toLowerCase().replace(/^www\./, "");
    if (!hostName || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(hostName) || location.protocol === "file:") return;
    var id = product + "__" + hostName.replace(/[^a-z0-9.-]/g, "_");
    var base = "https://firestore.googleapis.com/v1/projects/webswan-marketing/databases/(default)/documents";
    var key = "AIzaSyAqhqUzWqpS7YunkODJU_udTBG3pjsJegQ";
    var cacheKey = "ws-lic-" + id, today = new Date().toISOString().slice(0, 10), cache = {};
    try { cache = JSON.parse(localStorage.getItem(cacheKey) || "{}"); } catch (e) { cache = {}; }
    if (cache.status === "blocked" && cache.day === today) { onBlocked(); return; }
    if (!window.fetch) return;
    fetch(base + ":batchGet?key=" + key, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documents: ["projects/webswan-marketing/databases/(default)/documents/widget_licenses/" + id] }) }).then(function (r) { return r.ok ? r.json() : null; }).then(function (res) {
      var doc = res && res[0] && res[0].found;
      var status = doc && doc.fields && doc.fields.status && doc.fields.status.stringValue || "";
      if (status === "blocked") onBlocked();
      if (cache.day !== today || cache.status !== status) report();
      try { localStorage.setItem(cacheKey, JSON.stringify({ day: today, status: status })); } catch (e) { /* ignore */ }
    }).catch(function () { /* offline or blocked: never break the site */ });

    function report() {
      var name = "projects/webswan-marketing/databases/(default)/documents/widget_installs/" + id;
      var page = String(location.pathname || "/").slice(0, 300);
      var transforms = [{ fieldPath: "lastSeen", setToServerValue: "REQUEST_TIME" }, { fieldPath: "hits", increment: { integerValue: "1" } }];
      function commit(write) {
        return fetch(base + ":commit?key=" + key, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ writes: [write] }), keepalive: true });
      }
      commit({
        update: { name: name, fields: { product: { stringValue: product }, host: { stringValue: hostName }, page: { stringValue: page } } },
        updateTransforms: transforms.concat([{ fieldPath: "firstSeen", setToServerValue: "REQUEST_TIME" }]),
        currentDocument: { exists: false }
      }).then(function (r) {
        if (r.ok) return;
        return commit({ update: { name: name, fields: { page: { stringValue: page } } }, updateMask: { fieldPaths: ["page"] }, updateTransforms: transforms, currentDocument: { exists: true } });
      }).catch(function () { /* ignore */ });
    }
  }

  window.WebSwanCookies = {
    open: function () { openPanel(""); },
    openDoNotSell: function () { openPanel("dns"); },
    getConsent: getConsent,
    allowed: allowed,
    reset: function () { try { localStorage.removeItem(options.storageKey); } catch (e) { /* ignore */ } consent = null; showBanner(); }
  };

  setupConsentModeDefaults();
  function boot() {
    start();
    licenseCheck("cookie", function () {
      var el = document.getElementById(HOST_ID);
      if (el) el.parentNode.removeChild(el);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
