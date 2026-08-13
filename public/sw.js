/* eslint-disable no-restricted-globals, no-console */
/* globals clients */

self.addEventListener('push', event => {
  let notification = {
    title: 'Chatwoot',
    body: 'New notification',
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
        notification.body = text || 'New notification';
      }
    }
  } catch (e) {
    console.error('Failed to parse push data', e);
  }

  const title = notification.title || 'Chatwoot';
  const body =
    notification.body ||
    notification.title ||
    'New notification';

  const options = {
    body: body,
    icon: notification.icon || '/favicon.ico',
    badge: notification.badge || '/favicon.ico',
    data: {
      url: notification.url || '/',
    },
    requireInteraction: true,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  const url =
    (event.notification.data && event.notification.data.url) || '/';

  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        const match = windowClients.find(
          client => client.url === url || client.url.includes(url)
        );

        if (match && 'focus' in match) {
          return match.focus();
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});