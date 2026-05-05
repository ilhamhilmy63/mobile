/* ============================
   APP.JS — Dent AI Mobile
   Main Entry Point
   ============================ */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Dent AI Mobile Initializing...');

  // Check if user is logged in
  const token = api.getToken();
  const user = api.getUser();

  if (token && user) {
    console.log('Session found, navigating to dashboard...');
    if (user.role === 'admin') {
      Router.navigate('admin-dashboard');
    } else {
      Router.navigate('dashboard');
    }
  } else {
    console.log('No session, navigating to login...');
    Router.navigate('login');
  }
});
