// netlify-identity.js
// GitHub OAuth redirects editors back to the site root with a token in the
// URL hash (e.g. #access_token=..., #invite_token=..., #recovery_token=...,
// #error=...). Only in that case do we load the Netlify Identity widget,
// let it consume the hash, and forward the editor to /admin/.
// On normal visits, nothing is injected — no widget HTML at the bottom.
(function () {
  var hash = window.location.hash || '';
  if (!/(^|&|#)(access_token|invite_token|recovery_token|confirmation_token|email_change_token|error)=/.test(hash)) {
    return;
  }
  var s = document.createElement('script');
  s.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
  s.onload = function () {
    if (!window.netlifyIdentity) return;
    window.netlifyIdentity.on('init', function (user) {
      if (!user) {
        window.netlifyIdentity.on('login', function () {
          document.location.href = '/admin/';
        });
      } else {
        document.location.href = '/admin/';
      }
    });
  };
  document.head.appendChild(s);
})();
