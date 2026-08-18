/*
 * Tania Accessibility Toolbar v1.0.0
 * A privacy-friendly visitor preference toolbar.
 * Important: this toolbar does not certify or guarantee ADA/WCAG compliance.
 */
(function () {
  "use strict";

  if (window.__taniaAccessibilityWidgetLoaded) return;
  window.__taniaAccessibilityWidgetLoaded = true;

  var script = document.currentScript;
  var options = {
    color: (script && script.dataset.color) || "#155eef",
    position: (script && script.dataset.position) === "left" ? "left" : "right",
    statementUrl: (script && script.dataset.statementUrl) || "",
    contactEmail: (script && script.dataset.contactEmail) || "",
    brand: (script && script.dataset.brand) || "Accessibility tools",
    storageKey: (script && script.dataset.storageKey) || "tania-a11y-preferences-v1"
  };

  if (!window.CSS || !CSS.supports("color", options.color)) options.color = "#155eef";

  var HOST_ID = "tania-a11y-widget";
  var STYLE_ID = "tania-a11y-page-styles";
  var defaults = {
    textScale: 100,
    readableFont: false,
    lineHeight: false,
    letterSpacing: false,
    highlightLinks: false,
    highContrast: false,
    grayscale: false,
    pauseMotion: false,
    largeCursor: false,
    focusOutline: false,
    hideMedia: false
  };
  var state = loadState();
  var lastFocused = null;

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(options.storageKey) || "{}");
      var merged = Object.assign({}, defaults);
      Object.keys(defaults).forEach(function (key) {
        if (typeof saved[key] === typeof defaults[key]) merged[key] = saved[key];
      });
      if ([100, 112, 125, 150].indexOf(saved.textScale) !== -1) {
        merged.textScale = saved.textScale;
      }
      return merged;
    } catch (error) {
      return Object.assign({}, defaults);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(options.storageKey, JSON.stringify(state));
    } catch (error) {
      // Storage can be unavailable in private or restricted browser modes.
    }
  }

  function start() {
    if (document.getElementById(HOST_ID)) return;
    installPageStyles();
    buildWidget();
    applyState();
  }

  function installPageStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "html[data-ta11y-text='112']{font-size:112.5%!important}",
      "html[data-ta11y-text='125']{font-size:125%!important}",
      "html[data-ta11y-text='150']{font-size:150%!important}",
      "html[data-ta11y-readable='true'] body :not(#" + HOST_ID + "){font-family:Arial,Helvetica,sans-serif!important}",
      "html[data-ta11y-line-height='true'] body :not(#" + HOST_ID + "){line-height:1.75!important}",
      "html[data-ta11y-letter-spacing='true'] body :not(#" + HOST_ID + "){letter-spacing:.08em!important;word-spacing:.12em!important}",
      "html[data-ta11y-links='true'] body a:not(#" + HOST_ID + "){background:#ffeb3b!important;color:#111!important;text-decoration:underline!important;text-decoration-thickness:2px!important;outline:2px solid #111!important;outline-offset:2px!important}",
      "html[data-ta11y-contrast='true'] body{background:#000!important;color:#fff!important}",
      "html[data-ta11y-contrast='true'] body :where(main,header,footer,nav,section,article,aside,div,form,ul,ol,table):not(#" + HOST_ID + "){background-color:#000!important;background-image:none!important;color:#fff!important;border-color:#fff!important}",
      "html[data-ta11y-contrast='true'] body :where(p,span,li,label,h1,h2,h3,h4,h5,h6,td,th,strong,em):not(#" + HOST_ID + "){color:#fff!important}",
      "html[data-ta11y-contrast='true'] body a:not(#" + HOST_ID + "){color:#ffeb3b!important;text-decoration:underline!important}",
      "html[data-ta11y-contrast='true'] body :where(button,input,select,textarea):not(#" + HOST_ID + "){background:#fff!important;color:#000!important;border:2px solid #fff!important}",
      "html[data-ta11y-grayscale='true'] body>*:not(#" + HOST_ID + "){filter:grayscale(1)!important}",
      "html[data-ta11y-motion='true'] body :not(#" + HOST_ID + "),html[data-ta11y-motion='true'] body :not(#" + HOST_ID + ")::before,html[data-ta11y-motion='true'] body :not(#" + HOST_ID + ")::after{animation-delay:0s!important;animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.001ms!important}",
      "html[data-ta11y-cursor='true'],html[data-ta11y-cursor='true'] body :not(#" + HOST_ID + "){cursor:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M3 2l22 18-10 1 6 8-4 2-6-9-7 7z' fill='white' stroke='black' stroke-width='2'/%3E%3C/svg%3E\") 2 2,auto!important}",
      "html[data-ta11y-focus='true'] body :focus-visible:not(#" + HOST_ID + "){outline:4px solid #ffbf47!important;outline-offset:4px!important;box-shadow:0 0 0 2px #111!important}",
      "html[data-ta11y-media='true'] body :where(img,picture,video,canvas,iframe,svg):not(#" + HOST_ID + "){visibility:hidden!important}",
      "html[data-ta11y-readable='true'] #" + HOST_ID + ",html[data-ta11y-line-height='true'] #" + HOST_ID + ",html[data-ta11y-letter-spacing='true'] #" + HOST_ID + "{font:initial!important;letter-spacing:normal!important;line-height:normal!important}",
      "@media (prefers-reduced-motion:reduce){#" + HOST_ID + "{scroll-behavior:auto!important}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function buildWidget() {
    var host = document.createElement("div");
    host.id = HOST_ID;
    host.setAttribute("data-position", options.position);
    host.style.setProperty("--ta11y-accent", options.color);
    host.style.position = "fixed";
    host.style.zIndex = "2147483647";
    host.style.bottom = "max(20px, env(safe-area-inset-bottom))";
    host.style[options.position] = "max(20px, env(safe-area-inset-" + options.position + "))";
    host.style.fontSize = "16px";

    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
    root.innerHTML = getWidgetMarkup();
    document.body.appendChild(host);

    var launcher = root.getElementById("launcher");
    var panel = root.getElementById("panel");
    var close = root.getElementById("close");
    var reset = root.getElementById("reset");
    var skip = root.getElementById("skip-main");
    var decrease = root.getElementById("text-decrease");
    var increase = root.getElementById("text-increase");

    launcher.addEventListener("click", function () {
      panel.hidden ? openPanel() : closePanel();
    });
    close.addEventListener("click", closePanel);
    reset.addEventListener("click", resetAll);
    skip.addEventListener("click", skipToMain);
    decrease.addEventListener("click", function () { changeTextScale(-1); });
    increase.addEventListener("click", function () { changeTextScale(1); });

    Array.prototype.forEach.call(root.querySelectorAll("[data-setting]"), function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-setting");
        state[key] = !state[key];
        saveState();
        applyState();
        announce(button.textContent.trim() + (state[key] ? " on" : " off"));
      });
    });

    Array.prototype.forEach.call(root.querySelectorAll("[data-profile]"), function (button) {
      button.addEventListener("click", function () {
        applyProfile(button.getAttribute("data-profile"));
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) closePanel();
      if (event.key === "Tab" && !panel.hidden) keepFocusInside(event);
    });
    document.addEventListener("pointerdown", function (event) {
      if (!panel.hidden && event.target !== host && !event.composedPath().includes(host)) closePanel();
    });

    function openPanel() {
      lastFocused = document.activeElement;
      panel.hidden = false;
      launcher.setAttribute("aria-expanded", "true");
      close.focus();
    }

    function closePanel() {
      panel.hidden = true;
      launcher.setAttribute("aria-expanded", "false");
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
      else launcher.focus();
    }

    function keepFocusInside(event) {
      var focusable = Array.prototype.slice.call(panel.querySelectorAll("button,a[href]"))
        .filter(function (element) { return !element.disabled && element.offsetParent !== null; });
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && root.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && root.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function getWidgetMarkup() {
    var supportLinks = "";
    if (safeUrl(options.statementUrl)) {
      supportLinks += '<a class="support-link" href="' + escapeHtml(options.statementUrl) + '">Accessibility statement</a>';
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(options.contactEmail)) {
      supportLinks += '<a class="support-link" href="mailto:' + escapeHtml(options.contactEmail) + '?subject=Website%20accessibility%20help">Report an accessibility issue</a>';
    }

    return '<style>' + getWidgetCss() + '</style>' +
      '<button id="launcher" class="launcher" type="button" aria-label="Open accessibility tools" aria-haspopup="dialog" aria-expanded="false" aria-controls="panel"><span aria-hidden="true">♿</span></button>' +
      '<section id="panel" class="panel" role="dialog" aria-modal="true" aria-labelledby="title" hidden>' +
        '<header class="header"><div><p class="eyebrow">PERSONALIZE THIS SITE</p><h2 id="title">' + escapeHtml(options.brand) + '</h2></div><button id="close" class="icon-button" type="button" aria-label="Close accessibility tools">×</button></header>' +
        '<div class="content">' +
          '<button id="skip-main" class="skip-button" type="button">Skip to main content <span aria-hidden="true">→</span></button>' +
          '<div class="profiles" aria-label="Quick profiles"><button type="button" data-profile="vision"><span aria-hidden="true">◉</span> Vision</button><button type="button" data-profile="reading"><span aria-hidden="true">Aa</span> Reading</button><button type="button" data-profile="motion"><span aria-hidden="true">◫</span> Low motion</button></div>' +
          '<div class="text-size"><span><strong>Text size</strong><small id="text-value">100%</small></span><span class="stepper"><button id="text-decrease" type="button" aria-label="Decrease text size">−</button><button id="text-increase" type="button" aria-label="Increase text size">+</button></span></div>' +
          '<div class="settings" aria-label="Display and reading settings">' +
            settingButton("readableFont", "Aa", "Readable font") +
            settingButton("lineHeight", "↕", "Line height") +
            settingButton("letterSpacing", "↔", "Text spacing") +
            settingButton("highlightLinks", "⌁", "Highlight links") +
            settingButton("highContrast", "◐", "High contrast") +
            settingButton("grayscale", "●", "Grayscale") +
            settingButton("pauseMotion", "Ⅱ", "Pause motion") +
            settingButton("largeCursor", "➤", "Large cursor") +
            settingButton("focusOutline", "▣", "Focus highlight") +
            settingButton("hideMedia", "▧", "Hide media") +
          '</div>' +
          '<button id="reset" class="reset" type="button">Reset all settings</button>' +
          (supportLinks ? '<div class="support">' + supportLinks + '</div>' : '') +
          '<p class="privacy">Your preferences stay in this browser. This toolbar does not track you.</p>' +
        '</div>' +
        '<div id="announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>' +
      '</section>';
  }

  function settingButton(key, icon, label) {
    return '<button class="setting" type="button" data-setting="' + key + '" aria-pressed="false"><span class="setting-icon" aria-hidden="true">' + icon + '</span><span>' + label + '</span><span class="check" aria-hidden="true">✓</span></button>';
  }

  function getWidgetCss() {
    return [
      ":host{--accent:#155eef;all:initial;color-scheme:light;font-family:Inter,Arial,sans-serif;line-height:1.4}",
      "*{box-sizing:border-box}",
      "button,a{font:inherit}",
      "button:focus-visible,a:focus-visible{outline:3px solid #ffbf47;outline-offset:3px}",
      ".launcher{align-items:center;background:var(--ta11y-accent,var(--accent));border:3px solid #fff;border-radius:50%;box-shadow:0 8px 28px rgba(15,23,42,.34);color:#fff;cursor:pointer;display:flex;font-size:31px;height:62px;justify-content:center;line-height:1;padding:0;width:62px}",
      ".launcher:hover{filter:brightness(.9);transform:translateY(-2px)}",
      ".panel{background:#fff;border:1px solid #d7deea;border-radius:18px;bottom:76px;box-shadow:0 22px 60px rgba(15,23,42,.28);color:#172033;max-height:min(680px,calc(100vh - 112px));overflow:hidden;position:absolute;width:min(390px,calc(100vw - 28px))}",
      ":host([data-position='right']) .panel{right:0}",
      ":host([data-position='left']) .panel{left:0}",
      ".panel[hidden]{display:none}",
      ".header{align-items:flex-start;background:linear-gradient(135deg,var(--ta11y-accent,var(--accent)),#0c2d6b);color:#fff;display:flex;justify-content:space-between;padding:20px 20px 18px}",
      ".eyebrow{font-size:10px;font-weight:800;letter-spacing:.16em;margin:0 0 4px;opacity:.83}",
      "h2{font-size:21px;line-height:1.2;margin:0}",
      ".icon-button{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.4);border-radius:9px;color:#fff;cursor:pointer;font-size:26px;height:38px;line-height:1;padding:0;width:38px}",
      ".content{max-height:calc(min(680px,100vh - 112px) - 78px);overflow:auto;padding:16px}",
      ".skip-button{align-items:center;background:#eff4ff;border:1px solid #c7d7fe;border-radius:10px;color:#123b7a;cursor:pointer;display:flex;font-weight:750;justify-content:space-between;margin:0 0 12px;padding:11px 13px;text-align:left;width:100%}",
      ".profiles{display:grid;gap:8px;grid-template-columns:repeat(3,1fr);margin-bottom:12px}",
      ".profiles button{background:#fff;border:1px solid #cfd7e6;border-radius:10px;color:#29334a;cursor:pointer;font-size:12px;font-weight:750;min-height:54px;padding:8px 4px}",
      ".profiles button span{display:block;font-size:19px;margin-bottom:2px}",
      ".profiles button:hover,.profiles button[aria-pressed='true']{background:#edf3ff;border-color:var(--ta11y-accent,var(--accent));color:#123b7a}",
      ".text-size{align-items:center;background:#f7f8fb;border:1px solid #dfe4ec;border-radius:11px;display:flex;justify-content:space-between;margin-bottom:10px;padding:10px 12px}",
      ".text-size strong{display:block;font-size:14px}.text-size small{color:#5f6b7c;font-size:12px}",
      ".stepper{display:flex;gap:6px}.stepper button{background:#fff;border:1px solid #bfc8d8;border-radius:8px;color:#172033;cursor:pointer;font-size:23px;font-weight:700;height:38px;line-height:1;width:40px}",
      ".settings{display:grid;gap:8px;grid-template-columns:1fr 1fr}",
      ".setting{align-items:center;background:#fff;border:1px solid #d3dae6;border-radius:11px;color:#273248;cursor:pointer;display:grid;font-size:12px;font-weight:700;gap:5px;grid-template-columns:28px 1fr 17px;min-height:55px;padding:8px;text-align:left}",
      ".setting:hover{border-color:var(--ta11y-accent,var(--accent))}",
      ".setting[aria-pressed='true']{background:#eaf1ff;border-color:var(--ta11y-accent,var(--accent));color:#103b80}",
      ".setting-icon{align-items:center;background:#eef1f6;border-radius:7px;display:flex;font-size:17px;height:28px;justify-content:center;width:28px}",
      ".setting[aria-pressed='true'] .setting-icon{background:var(--ta11y-accent,var(--accent));color:#fff}",
      ".check{opacity:0}.setting[aria-pressed='true'] .check{opacity:1}",
      ".reset{background:transparent;border:0;color:#34425a;cursor:pointer;font-size:13px;font-weight:750;margin:15px 0 8px;padding:8px;text-decoration:underline;width:100%}",
      ".support{border-top:1px solid #e2e6ed;display:flex;flex-wrap:wrap;gap:6px 14px;padding-top:12px}",
      ".support-link{color:#164d9f;font-size:12px;font-weight:700;text-underline-offset:2px}",
      ".privacy{color:#697386;font-size:11px;line-height:1.45;margin:10px 0 2px;text-align:center}",
      ".sr-only{height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;clip:rect(0,0,0,0);white-space:nowrap}",
      "@media(max-width:480px){.panel{bottom:72px}.content{padding:12px}.settings{gap:6px}.setting{font-size:11px}.launcher{height:58px;width:58px}}",
      "@media(prefers-reduced-motion:no-preference){.launcher,.setting,.profiles button{transition:transform .16s ease,filter .16s ease,border-color .16s ease,background-color .16s ease}}"
    ].join("\n");
  }

  function applyState() {
    var html = document.documentElement;
    html.setAttribute("data-ta11y-text", String(state.textScale));
    setFlag(html, "readable", state.readableFont);
    setFlag(html, "line-height", state.lineHeight);
    setFlag(html, "letter-spacing", state.letterSpacing);
    setFlag(html, "links", state.highlightLinks);
    setFlag(html, "contrast", state.highContrast);
    setFlag(html, "grayscale", state.grayscale);
    setFlag(html, "motion", state.pauseMotion);
    setFlag(html, "cursor", state.largeCursor);
    setFlag(html, "focus", state.focusOutline);
    setFlag(html, "media", state.hideMedia);

    var host = document.getElementById(HOST_ID);
    if (!host) return;
    var root = host.shadowRoot || host;
    Array.prototype.forEach.call(root.querySelectorAll("[data-setting]"), function (button) {
      var active = !!state[button.getAttribute("data-setting")];
      button.setAttribute("aria-pressed", String(active));
    });
    root.getElementById("text-value").textContent = state.textScale + "%";
    root.getElementById("text-decrease").disabled = state.textScale === 100;
    root.getElementById("text-increase").disabled = state.textScale === 150;
    updateProfiles(root);
  }

  function setFlag(element, name, enabled) {
    element.setAttribute("data-ta11y-" + name, String(!!enabled));
  }

  function changeTextScale(direction) {
    var sizes = [100, 112, 125, 150];
    var current = sizes.indexOf(state.textScale);
    var next = Math.max(0, Math.min(sizes.length - 1, current + direction));
    state.textScale = sizes[next];
    saveState();
    applyState();
    announce("Text size " + state.textScale + " percent");
  }

  function applyProfile(profile) {
    if (profile === "vision") {
      state.textScale = 125;
      state.highContrast = true;
      state.focusOutline = true;
      state.largeCursor = true;
    } else if (profile === "reading") {
      state.readableFont = true;
      state.lineHeight = true;
      state.letterSpacing = true;
      state.highlightLinks = true;
    } else if (profile === "motion") {
      state.pauseMotion = true;
    }
    saveState();
    applyState();
    announce(profile + " profile applied");
  }

  function updateProfiles(root) {
    var profiles = {
      vision: state.textScale >= 125 && state.highContrast && state.focusOutline && state.largeCursor,
      reading: state.readableFont && state.lineHeight && state.letterSpacing && state.highlightLinks,
      motion: state.pauseMotion
    };
    Object.keys(profiles).forEach(function (profile) {
      var button = root.querySelector("[data-profile='" + profile + "']");
      if (button) button.setAttribute("aria-pressed", String(profiles[profile]));
    });
  }

  function resetAll() {
    state = Object.assign({}, defaults);
    saveState();
    applyState();
    announce("All accessibility preferences reset");
  }

  function skipToMain() {
    var main = document.querySelector("main,[role='main'],#main,#main-content");
    if (!main) {
      announce("Main content area was not found");
      return;
    }
    if (!main.hasAttribute("tabindex")) {
      main.setAttribute("tabindex", "-1");
      main.setAttribute("data-ta11y-temp-tabindex", "true");
      main.addEventListener("blur", function cleanup() {
        if (main.getAttribute("data-ta11y-temp-tabindex") === "true") {
          main.removeAttribute("tabindex");
          main.removeAttribute("data-ta11y-temp-tabindex");
        }
        main.removeEventListener("blur", cleanup);
      });
    }
    main.focus({ preventScroll: true });
    main.scrollIntoView({ behavior: state.pauseMotion ? "auto" : "smooth", block: "start" });
    announce("Moved to main content");
  }

  function announce(message) {
    var host = document.getElementById(HOST_ID);
    if (!host) return;
    var root = host.shadowRoot || host;
    var region = root.getElementById("announcer");
    region.textContent = "";
    window.setTimeout(function () { region.textContent = message; }, 30);
  }

  function safeUrl(value) {
    if (!value) return false;
    try {
      var url = new URL(value, window.location.href);
      return ["http:", "https:"].indexOf(url.protocol) !== -1 || url.origin === window.location.origin;
    } catch (error) {
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character];
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
