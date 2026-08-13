/* eslint-disable no-restricted-globals, no-console */
/* globals clients */

self.addEventListener('push', event => {
  let notification = {
    title: 'Chatwoot',
    body: '',
    tag: 'chatwoot',
    url: '/',
  };

  try {
    if (event.data) {
      try {
        const data = event.data.json();
        notification = { ...notification, ...data };
      } catch (e) {
        const text = event.data.text();
        notification.title = text || 'Chatwoot';
        notification.body = text || '';
      }
    }
  } catch (e) {
    console.error('Failed to parse push data', e);
  }

  const options = {
   body: notification.body || notification.title || 'New message',
    tag: notification.tag || 'chatwoot-' + Date.now(),
    icon: notification.icon || '/favicon.ico',
    badge: notification.badge || '/favicon.ico',
    data: { url: notification.url || '/' },
    requireInteraction: true,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(notification.title || 'Chatwoot', options)
  );
});

self.addEventListener('notificationclick', event => {
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      const match = windowClients.find(c => c.url.includes(url) || c.url === url);
      if (match && match.focus) return match.focus();
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});