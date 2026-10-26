/** Public measurement ID, not a credential. */
export const GA_MEASUREMENT_ID = "G-LNLWYCJQTQ";

// Next Script runs this once after hydration. GA4 Enhanced Measurement owns
// history-based page views; do not add a second manual page_view listener.
export const GOOGLE_ANALYTICS_BOOTSTRAP = `
(function () {
  if (window.location.hostname !== 'www.destinationfinderai.com' ||
      window.location.protocol !== 'https:') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', '${GA_MEASUREMENT_ID}');
  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
  document.head.appendChild(tag);
})();
`;
