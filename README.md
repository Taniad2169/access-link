# Accessibility Toolbar

A self-contained, privacy-friendly accessibility preference widget. It is ready to host on GitHub Pages and embed on sites that allow custom JavaScript.

## Basic one-line embed

```html
<script src="https://taniad2169.github.io/access-link/widget.js"></script>
```

The public GitHub repository is named `access-link`. GitHub Pages serves `index.html` as the demo and `widget.js` as the one-line widget.

## Optional customization

```html
<script
  src="https://taniad2169.github.io/access-link/widget.js"
  data-color="#155eef"
  data-position="right"
  data-brand="Accessibility tools"
  data-statement-url="/accessibility"
  data-contact-email="help@example.com">
</script>
```

- `data-color`: Any valid CSS color.
- `data-position`: `right` or `left`.
- `data-brand`: Heading shown in the panel.
- `data-statement-url`: Optional link to the website owner's accessibility statement.
- `data-contact-email`: Optional email for visitors to report an accessibility problem.
- `data-storage-key`: Optional custom browser-storage key when two copies must use different preferences.

## Platform notes

- **WordPress:** Add the script using a header/footer code plugin or the theme's custom-code area, before `</body>`.
- **Wix:** Use Settings → Custom Code and place it in the Body-end area. The site's plan and settings must permit custom code.
- **Squarespace:** Use Settings → Advanced → Code Injection → Footer on plans that permit code injection.
- **GoDaddy / Square:** Use the platform's custom HTML or tracking-code area if it permits third-party JavaScript. Some page-builder embed blocks isolate code in an iframe; site-wide injection works better.
- **Plain HTML:** Paste the line immediately before `</body>`.

## Included visitor controls

- Four text-size levels
- Readable font, line height, and text spacing
- Highlight links
- High contrast and grayscale
- Pause animations and transitions
- Large cursor and visible keyboard focus
- Hide media
- Skip to main content
- Vision, reading, and low-motion quick profiles
- Reset and preference saving in `localStorage`

The widget sends no visitor analytics, uses no cookies, and loads no fonts or icons. Once a day per browser it sends WebSwan the website's address and page path (never anything about the visitor) so the owner can see which sites run the widget. See **License check and install alerts** below.

## Compliance and sales language

Do **not** sell this as “automatic ADA compliance” or “compliance in all 50 states.” A toolbar cannot fix missing image alternatives, unlabeled forms, keyboard traps, inaccessible PDFs, captions, document structure, checkout flows, or other problems in the underlying site.

Safe description:

> A privacy-friendly accessibility preference toolbar that helps visitors personalize how a website looks and behaves. It supports an accessibility program but does not certify or guarantee ADA, WCAG, Section 508, or state-law compliance.

Federal requirements vary by the organization. As of August 17, 2026, the U.S. Department of Justice identifies WCAG 2.1 Level AA as the technical standard for state and local government web content under the Title II web rule, subject to its scope, exceptions, and compliance dates. DOJ guidance for businesses open to the public says their online goods and services must be accessible, while noting that automated tools and overlays must be used carefully and should be paired with manual review. State and local laws may add obligations, so each customer should obtain advice for its own location and industry.

Official references:

- DOJ web accessibility guidance: https://www.ada.gov/resources/web-guidance/
- DOJ Title II small-entity compliance guide: https://www.ada.gov/resources/small-entity-compliance-guide/
- W3C WCAG 2.1: https://www.w3.org/TR/WCAG21/
- U.S. Section 508 standards: https://www.access-board.gov/ict/

## Practical compliance package to sell alongside the toolbar

For a stronger service, combine the widget with:

1. Automated scanning.
2. Manual keyboard and screen-reader testing.
3. Fixes to the website's code and content.
4. An accessibility statement with a real support contact.
5. A recurring review after site changes.

## Browser support

Current versions of Chrome, Edge, Firefox, and Safari. The widget uses Shadow DOM when available to reduce conflicts with host-site styling and falls back to normal DOM on older browsers.

---

# Cookie Consent Banner (cookie.js)

Same one-line install as the ADA toolbar. Demo and private embed code: `https://taniad2169.github.io/access-link/cookie.html`

```html
<script
  src="https://taniad2169.github.io/access-link/cookie.js"
  data-company="Smile Dental"
  data-privacy-url="https://smiledental.com/privacy"
  data-contact-email="office@smiledental.com">
</script>
```

- `data-company`: Business name shown in the banner.
- `data-privacy-url`: Link to the website's privacy policy (recommended).
- `data-contact-email`: Optional email for privacy requests.
- `data-color`: Button color (default WebSwan blue `#339cde`).
- `data-position`: Side of the small cookie button that reopens the choices, `left` (default, so it does not sit on the ADA button) or `right`.
- `data-show-button="false"`: Hide the floating cookie button (then add a "Cookie settings" link in the footer, see below).
- `data-branding="false"`: Hide "Privacy center by WebSwan Digital Solutions".
- `data-expires-days`: How long a choice is remembered (30 to 395, default 365).

## What visitors see

1. A banner with **Accept all**, **Reject all**, **Choose what to share** and **Do Not Sell or Share My Personal Information**.
2. Do Not Sell opens the privacy center with the disclaimer and turns off Marketing and Sale or sharing; the visitor presses **Save and close**.
3. The privacy center has switches for Functional, Analytics, Marketing and Sale or sharing (Strictly necessary is always on).
4. After choosing, a small cookie button lets the visitor change their mind at any time.
5. A browser's **Global Privacy Control** signal is honored automatically (sale, sharing and targeted ads stay off).

Footer links: any link to `#cookie-settings` opens the privacy center, and any link to `#do-not-sell` opens it in Do Not Sell mode. `data-webswan-cookie-settings` on any element does the same.

## How choices are enforced

- **Google Consent Mode v2:** defaults to denied, updated when the visitor chooses (works with Google Analytics, Google Ads and Google Tag Manager).
- **Meta Pixel:** `fbq('consent','grant' | 'revoke')`.
- **Any other script or iframe:** tag it and it stays off until allowed:
  ```html
  <script type="text/plain" data-cookie-category="analytics" src="https://example.com/tracker.js"></script>
  <iframe data-src="https://www.youtube.com/embed/..." data-cookie-category="functional"></iframe>
  ```
- Events: `window` fires `webswan:consent`, and `dataLayer` gets `webswan_consent_update`.
- JavaScript: `WebSwanCookies.open()`, `WebSwanCookies.openDoNotSell()`, `WebSwanCookies.getConsent()`, `WebSwanCookies.allowed('analytics')`.

Website builders (Wix, Squarespace, GoDaddy, Square) load some trackers themselves. Turn on each platform's own cookie or consent setting too, or those built-in trackers may still run.

## Compliance language

Safe description:

> A cookie consent banner that lets visitors accept, reject, or opt out of the sale and sharing of their personal information, and that passes those choices to Google, Meta and tagged scripts. It supports a privacy program but does not certify or guarantee compliance with the CCPA/CPRA, GDPR, or any other law.

---

# License check and install alerts (both widgets)

Every time a browser loads `widget.js` or `cookie.js` on a real website (not localhost), it:

1. Checks `widget_licenses/{product}__{website}` in the WebSwan Firebase project. Status `paused` (unpaid subscription) or `blocked` (unlicensed) turns the widget off on that website and shows a small notice telling the website owner to contact WebSwan Digital Solutions. `approved` or no status keeps it running.
2. Once a day per browser, reports the website address, page path, first seen, last seen and a visit count to `widget_installs`. Nothing about the visitor is sent.

Owner dashboard: `https://taniad2169.github.io/access-link/dashboard.html` (Google sign-in, thewebswann@gmail.com only). New websites are marked **NEW** and **Not approved yet**. Press **Approve** for paying clients, **Pause** for clients who stop paying (press **Approve** again when they pay), or **Block** for anyone using the widget without permission. **Email owner** opens a ready-to-send email (paused or unlicensed notice) in your mail app. Changes reach visitors right away; returning visitors can keep a cached status for up to one day. "Alert me in this tab" shows a desktop notification when a new website appears while the dashboard is open.

Firestore rules required (add inside `match /databases/{database}/documents { ... }`):

```
function isOwner() { return request.auth != null && request.auth.token.email == 'thewebswann@gmail.com'; }
match /widget_installs/{id} {
  allow read, delete: if isOwner();
  allow create: if request.resource.data.keys().hasOnly(['product','host','page','firstSeen','lastSeen','hits'])
    && request.resource.data.product in ['cookie','ada']
    && request.resource.data.host is string && request.resource.data.host.size() <= 253
    && request.resource.data.page is string && request.resource.data.page.size() <= 300
    && id == request.resource.data.product + '__' + request.resource.data.host
    && request.resource.data.hits == 1
    && request.resource.data.firstSeen == request.time && request.resource.data.lastSeen == request.time;
  allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['page','lastSeen','hits'])
    && request.resource.data.page is string && request.resource.data.page.size() <= 300
    && request.resource.data.hits == resource.data.hits + 1
    && request.resource.data.lastSeen == request.time;
}
match /widget_licenses/{id} {
  allow read: if true;
  allow write: if isOwner();
}
```
