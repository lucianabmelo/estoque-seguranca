const SESSION_KEY = 'estocai_auth';
const USER_KEY = 'estocai_user';
const INACTIVITY_MS = 2 * 60 * 1000;
let inactivityTimer = null;

function setAuthenticated(user) {
  sessionStorage.setItem(SESSION_KEY, '1');
  sessionStorage.setItem(USER_KEY, user);
}
function clearAuthenticated() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(USER_KEY);
}
function isAuthenticated() { return sessionStorage.getItem(SESSION_KEY) === '1'; }

function resetInactivityTimer() {
  if (!isAuthenticated()) return;
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    clearAuthenticated();
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
    document.getElementById('timeout-dialog').showModal();
  }, INACTIVITY_MS);
}

function bindActivityMonitor() {
  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(eventName => {
    document.addEventListener(eventName, resetInactivityTimer, { passive: true });
  });
}

window.Auth = { setAuthenticated, clearAuthenticated, isAuthenticated, resetInactivityTimer, bindActivityMonitor };
