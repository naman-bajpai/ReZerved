/**
 * BookedUp embed loader — v1
 * Drop this script tag anywhere on your page to render the booking widget.
 *
 * Usage:
 *   <script src="https://your-app.com/embed.js" data-slug="your-slug"></script>
 *
 * Optional attributes:
 *   data-width  — iframe width  (default: "100%")
 *   data-height — iframe initial height in px (default: 620)
 *   data-radius — border-radius in px (default: 16)
 *
 * Events dispatched on the container element:
 *   bookedup:complete — fired when a booking is confirmed
 *     event.detail: { bookingId, slug, service }
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) {
    // Fallback: look for the script tag by data attribute
    script = document.querySelector('script[data-slug]');
  }
  if (!script) return;

  var slug = script.getAttribute('data-slug');
  if (!slug) {
    console.warn('[BookedUp] data-slug attribute is required.');
    return;
  }

  var width  = script.getAttribute('data-width')  || '100%';
  var height = parseInt(script.getAttribute('data-height') || '620', 10);
  var radius = parseInt(script.getAttribute('data-radius') || '16', 10);

  // Derive base URL from script src so self-hosted deployments work automatically.
  var base = '';
  try {
    var srcUrl = new URL(script.src);
    base = srcUrl.origin;
  } catch (_) {
    // script.src may be empty in some edge cases; fall back to current origin
    base = window.location.origin;
  }

  var iframeSrc = base + '/embed/' + encodeURIComponent(slug);

  // Build iframe
  var iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.title = 'Book an appointment';
  iframe.allow = 'payment';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.style.cssText = [
    'display:block',
    'border:none',
    'width:' + width,
    'height:' + height + 'px',
    'border-radius:' + radius + 'px',
    'overflow:hidden',
  ].join(';');

  // Inject immediately after the script tag
  script.parentNode.insertBefore(iframe, script.nextSibling);

  // Listen for postMessage events from the iframe
  window.addEventListener('message', function (event) {
    if (!event.data || typeof event.data !== 'object') return;

    switch (event.data.type) {
      case 'bookedup:resize': {
        var newHeight = Number(event.data.height);
        if (!isNaN(newHeight) && newHeight > 0) {
          iframe.style.height = Math.max(300, newHeight + 32) + 'px';
        }
        break;
      }
      case 'bookedup:complete': {
        // Dispatch a CustomEvent on the iframe element so the host page can react
        var detail = {
          bookingId: event.data.bookingId,
          slug:      event.data.slug,
          service:   event.data.service,
        };
        iframe.dispatchEvent(new CustomEvent('bookedup:complete', { bubbles: true, detail: detail }));
        break;
      }
    }
  });
})();
