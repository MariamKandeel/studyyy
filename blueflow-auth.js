// Protect BlueFlow pages and expose a shared auth-ready promise.
const isLoginPage = /(^|\/)login\.html$/i.test(window.location.pathname);

window.blueflowAuthReady = new Promise(resolve => {
  BlueFlowFirebase.auth.onAuthStateChanged(user => {
    if (!user && !isLoginPage) {
      const next = encodeURIComponent(window.location.pathname.split("/").pop() + window.location.search);
      window.location.href = `login.html?next=${next}`;
      return;
    }

    window.blueflowUser = user || null;
    resolve(user || null);
  });
});
