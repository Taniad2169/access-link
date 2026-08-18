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

The widget sends no analytics, uses no cookies, loads no fonts or icons, and makes no network request after `widget.js` is loaded.

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
