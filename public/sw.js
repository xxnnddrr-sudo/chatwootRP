/* eslint-disable no-restricted-globals, no-console */
/* globals clients */

const ORIGIN = self.location.origin;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', event => {
  event.waitUntil(handlePush(event));
});

async function handlePush(event) {
  let title = 'Chatwoot';
  let body = 'New notification';
  let url = ORIGIN + '/';

  try {
    if (event.data) {
      try {
        const data = event.data.json();
        title = data.title || title;
        body = data.body || data.title || body;
        url = data.url || url;
        if (url && url.startsWith('/')) url = ORIGIN + url;
      } catch (e) {
        const text = event.data.text();
        title = text || title;
        body = text || body;
      }
    }
  } catch (e) {
    console.error('push parse error', e);
  }

  try {
    await self.registration.showNotification(title, {
      body: body,
      icon: ORIGIN + '/favicon.ico',
      badge: ORIGIN + '/favicon.ico',
      data: { url: url },
      requireInteraction: true,
      silent: false,
    });
  } catch (e) {
    console.error('showNotification failed', e);
    // last resort
    await self.registration.showNotification('Chatwoot', {
      body: body || 'New notification',
      requireInteraction: true,
    });
  }
}

self.addEventListener('notificationclick', event => {
  const url =
    (event.notification.data && event.notification.data.url) || ORIGIN + '/';
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => {
        const match = list.find(c => c.url === url || c.url.startsWith(url));
        if (match && match.focus) return match.focus();
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});