// netlify-identity.js
// Redirect CMS editors to /admin after GitHub OAuth login.
// Loaded synchronously after the Netlify Identity widget on index.html only.
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', function (user) {
    if (!user) {
      window.netlifyIdentity.on('login', function () {
        document.location.href = '/admin/';
      });
    }
  });
}
